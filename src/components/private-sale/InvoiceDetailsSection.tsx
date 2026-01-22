import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceDetails } from '@/types/privateSaleForm';

interface InvoiceDetailsSectionProps {
  data: InvoiceDetails;
  onChange: (data: InvoiceDetails) => void;
}

export function InvoiceDetailsSection({ data, onChange }: InvoiceDetailsSectionProps) {
  // Format number with commas for display
  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Parse formatted currency back to raw number string
  const parseCurrency = (value: string) => {
    return value.replace(/[^0-9.]/g, '');
  };

  const handleChange = (field: keyof InvoiceDetails, value: string) => {
    onChange({ ...data, [field]: parseCurrency(value) });
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
            <Label htmlFor="purchasePrice">Purchase Price ($) <span className="text-destructive">*</span></Label>
            <Input
              id="purchasePrice"
              value={data.purchasePrice}
              onChange={(e) => handleChange('purchasePrice', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
            <Input
              id="depositAmount"
              value={formatCurrency(data.depositAmount)}
              onChange={(e) => handleChange('depositAmount', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balanceToBeFinanced">Balance to be Financed ($)</Label>
            <Input
              id="balanceToBeFinanced"
              value={formatCurrency(data.balanceToBeFinanced || calculateBalance())}
              onChange={(e) => handleChange('balanceToBeFinanced', e.target.value)}
              placeholder="Auto-calculated"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
