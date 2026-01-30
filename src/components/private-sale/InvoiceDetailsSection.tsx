import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceDetails } from '@/types/privateSaleForm';
import { CurrencyInput } from '@/components/ui/currency-input';
import { cn } from '@/lib/utils';

interface InvoiceDetailsSectionProps {
  data: InvoiceDetails;
  onChange: (data: InvoiceDetails) => void;
  validationErrors: Set<string>;
}

export function InvoiceDetailsSection({ data, onChange, validationErrors }: InvoiceDetailsSectionProps) {
  const handleChange = (field: keyof InvoiceDetails, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Calculate balance when price or deposit changes
  const calculateBalance = () => {
    const price = parseFloat(data.purchasePrice.replace(/[^0-9.]/g, '')) || 0;
    const deposit = parseFloat(data.depositAmount.replace(/[^0-9.]/g, '')) || 0;
    return (price - deposit).toFixed(2);
  };

  // Auto-update balance when purchase price or deposit changes
  useEffect(() => {
    if (data.purchasePrice || data.depositAmount) {
      const calculatedBalance = calculateBalance();
      if (data.balanceToBeFinanced !== calculatedBalance) {
        onChange({ ...data, balanceToBeFinanced: calculatedBalance });
      }
    }
  }, [data.purchasePrice, data.depositAmount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invoice Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price <span className="text-destructive">*</span></Label>
            <CurrencyInput
              id="purchasePrice"
              value={data.purchasePrice}
              onChange={(val) => handleChange('purchasePrice', val)}
              className={cn(
                validationErrors.has('invoice.purchasePrice') && 
                !data.purchasePrice.trim() && 
                'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depositAmount">Deposit Amount</Label>
            <CurrencyInput
              id="depositAmount"
              value={data.depositAmount}
              onChange={(val) => handleChange('depositAmount', val)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balanceToBeFinanced">Balance to be Financed</Label>
            <CurrencyInput
              id="balanceToBeFinanced"
              value={data.balanceToBeFinanced || calculateBalance()}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
