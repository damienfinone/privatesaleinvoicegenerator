import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Ship, Briefcase, User, Download, Eye } from 'lucide-react';
import { PrivateSaleFormData, initialFormData } from '@/types/privateSaleForm';
import { BuyerDetailsSection } from './BuyerDetailsSection';
import { AssetDetailsSection } from './AssetDetailsSection';
import { InvoiceDetailsSection } from './InvoiceDetailsSection';
import { DisbursementSection } from './DisbursementSection';
import { LoanTypeSelector, LoanType } from './LoanTypeSelector';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { useToast } from '@/hooks/use-toast';

const loanTypeConfig: Record<LoanType, { title: string; icon: React.ReactNode; description: string }> = {
  commercial: {
    title: 'Commercial Private Sale',
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    description: 'For business and commercial vehicle financing',
  },
  consumer: {
    title: 'Consumer Private Sale',
    icon: <User className="h-8 w-8 text-primary" />,
    description: 'For personal vehicle financing',
  },
  boat: {
    title: 'Vendor Tax Invoice – Watercraft',
    icon: <Ship className="h-8 w-8 text-primary" />,
    description: 'For boat and watercraft financing',
  },
};

export function PrivateSaleForm() {
  const [loanType, setLoanType] = useState<LoanType | null>(null);
  const [formData, setFormData] = useState<PrivateSaleFormData>(initialFormData);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  const config = loanType ? loanTypeConfig[loanType] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanType) return;
    
    // Validate that Balance to be Financed = Option 1 Amount + Option 2 Amount
    const balance = parseFloat(formData.invoice.balanceToBeFinanced.replace(/[^0-9.]/g, '')) || 0;
    const option1Amount = parseFloat(formData.disbursement.bankAccount.amount.replace(/[^0-9.]/g, '')) || 0;
    const option2Amount = parseFloat(formData.disbursement.payoutBank.amount.replace(/[^0-9.]/g, '')) || 0;
    const totalDisbursement = option1Amount + option2Amount;
    
    if (Math.abs(balance - totalDisbursement) > 0.01) {
      toast({
        title: 'Disbursement Mismatch',
        description: `Disbursement amount(s) of $${totalDisbursement.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} do not match the Balance to be Financed of $${balance.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        variant: 'destructive',
      });
      return;
    }
    
    setPreviewOpen(true);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    toast({
      title: 'Form Reset',
      description: 'All fields have been cleared.',
    });
  };

  const handleLoanTypeChange = (newType: LoanType) => {
    setLoanType(newType);
    setFormData(initialFormData);
  };

  return (
    <div className="space-y-6">
      {/* Loan Type Selector */}
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Select Loan Type</h2>
        <LoanTypeSelector value={loanType} onChange={handleLoanTypeChange} />
      </div>

      {/* Form - Only show when loan type is selected */}
      {loanType && config && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              {config.icon}
              <h1 className="text-2xl font-bold">{config.title}</h1>
            </div>
            <p className="text-muted-foreground">
              Fin One Pty Ltd | ABN: 80 139 719 903 | Australian Credit Licence: 387 528
            </p>
            <p className="text-sm text-muted-foreground">
              Phone: 1800 346 663 | Fax: (07) 4723 5466 | PO Box 3041, Hermit Park QLD 4812
            </p>
            <p className="text-xs text-muted-foreground mt-2">{config.description}</p>
          </div>

          {/* Form Sections */}
          <BuyerDetailsSection
            data={formData.buyer}
            onChange={(buyer) => setFormData({ ...formData, buyer })}
          />

          <AssetDetailsSection
            data={formData.asset}
            onChange={(asset) => setFormData({ ...formData, asset })}
            loanType={loanType}
          />

          <InvoiceDetailsSection
            data={formData.invoice}
            onChange={(invoice) => setFormData({ ...formData, invoice })}
          />

          <DisbursementSection
            data={formData.disbursement}
            onChange={(disbursement) => setFormData({ ...formData, disbursement })}
          />


          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset Form
            </Button>
            <Button type="submit">
              <Eye className="mr-2 h-4 w-4" />
              Preview & Download Invoice
            </Button>
          </div>

          {/* Invoice Preview Dialog */}
          <InvoicePreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            formData={formData}
            loanType={loanType}
          />
        </form>
      )}
    </div>
  );
}
