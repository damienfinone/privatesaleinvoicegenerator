import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ship, Briefcase, User, Eye } from 'lucide-react';
import { PrivateSaleFormData, initialFormData } from '@/types/privateSaleForm';
import { BuyerDetailsSection } from './BuyerDetailsSection';
import { AssetDetailsSection } from './AssetDetailsSection';
import { InvoiceDetailsSection } from './InvoiceDetailsSection';
import { DisbursementSection } from './DisbursementSection';
import { LoanTypeSelector, LoanType } from './LoanTypeSelector';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { useToast } from '@/hooks/use-toast';

// Australian phone number validation
const isValidAustralianPhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const mobileRegex = /^(?:04|\+?614)\d{8}$/;
  const landlineRegex = /^(?:0[2378]|\+?61[2378])\d{8}$/;
  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
};

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
    description: 'For consumer boat and watercraft financing',
  },
  'commercial-boat': {
    title: 'Commercial Vendor Tax Invoice – Watercraft',
    icon: <Ship className="h-8 w-8 text-primary" />,
    description: 'For commercial boat and watercraft financing',
  },
};

export function PrivateSaleForm() {
  const [loanType, setLoanType] = useState<LoanType | null>(null);
  const [division, setDivision] = useState<'consumer' | 'commercial' | null>(null);
  const [formData, setFormData] = useState<PrivateSaleFormData>(initialFormData);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isUnderFinance, setIsUnderFinance] = useState<boolean | null>(null);
  const [hasVendorUpload, setHasVendorUpload] = useState(false);
  const [hasFinancierUpload, setHasFinancierUpload] = useState(false);
  const [hasAssetUpload, setHasAssetUpload] = useState(false);
  const { toast } = useToast();

  const config = loanType ? loanTypeConfig[loanType] : null;
  
  // Determine if we should show the form (loan type fully selected)
  const isLoanTypeFullySelected = loanType !== null;

  const validateBuyerDetails = (): string | null => {
    const { name, contactNumber, address } = formData.buyer;
    if (!name.trim()) return "Buyer's Name is required";
    if (!contactNumber.trim()) return "Buyer's Contact Number is required";
    if (!isValidAustralianPhone(contactNumber)) return "Please enter a valid Australian phone number";
    if (!address.trim()) return "Buyer's Address is required";
    return null;
  };

  // Validate AU date format (DD/MM/YYYY)
  const isValidAuDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const auMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (auMatch) {
      const [, day, month, year] = auMatch;
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return false;
      return true;
    }
    // Also accept ISO format (YYYY-MM-DD)
    const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) return true;
    return false;
  };

  const validateAssetDetails = (): string | null => {
    if (!hasAssetUpload) return 'Please upload an Asset Document';
    
    const { hull, motor } = formData.asset;
    const isWatercraft = loanType === 'boat' || loanType === 'commercial-boat';
    
    // For vehicle loans (commercial/consumer)
    if (!isWatercraft) {
      if (!hull.make.trim()) return 'Vehicle Make is required';
      if (!hull.model.trim()) return 'Vehicle Model is required';
      if (!hull.colour.trim()) return 'Vehicle Colour is required';
      if (!hull.buildDate.trim()) return 'Vehicle Build Date/Year is required';
      if (!hull.fuelType.trim()) return 'Vehicle Fuel Type is required';
      if (!hull.registration.trim()) return 'Vehicle Registration is required';
      if (!hull.registrationExpiry.trim()) return 'Vehicle Registration Expiry is required';
      if (!isValidAuDate(hull.registrationExpiry)) return 'Registration Expiry must be a valid date (DD/MM/YYYY)';
      if (!hull.hin.trim()) return 'Vehicle VIN is required';
      if (!motor.engineNumber.trim()) return 'Vehicle Engine Number is required';
      if (!hull.bodyType.trim()) return 'Vehicle Body Type is required';
      if (!hull.odometer.trim()) return 'Vehicle Odometer Reading is required';
      if (!hull.transmission.trim()) return 'Vehicle Transmission is required';
    } else {
      // For boat loans - validate hull details
      if (!hull.make.trim()) return 'Hull Make is required';
      if (!hull.model.trim()) return 'Hull Model is required';
      if (!hull.colour.trim()) return 'Hull Colour is required';
      if (!hull.buildDate.trim()) return 'Hull Build Date is required';
      if (!hull.registration.trim()) return 'Hull Registration is required';
      if (!hull.registrationExpiry.trim()) return 'Hull Registration Expiry is required';
      if (!isValidAuDate(hull.registrationExpiry)) return 'Hull Registration Expiry must be a valid date (DD/MM/YYYY)';
      if (!hull.hin.trim()) return 'Hull Identification Number (HIN) is required';
    }
    return null;
  };

  const validateDisbursement = (): string | null => {
    if (isUnderFinance === null) {
      return 'Please answer whether the asset is currently under finance';
    }

    const balance = parseFloat(formData.invoice.balanceToBeFinanced.replace(/[^0-9.]/g, '')) || 0;
    const amountPayable = parseFloat(formData.disbursement.bpay.amount.replace(/[^0-9.]/g, '')) || 0;
    const needsVendorPayment = isUnderFinance && amountPayable > 0 && amountPayable < balance;

    // If under finance, validate financier details
    if (isUnderFinance) {
      if (!hasFinancierUpload) {
        return 'Please upload the payout letter from the financier';
      }
      
      const { amount: bpayAmount, billerCode, referenceNumber } = formData.disbursement.bpay;
      const { accountName, bsbNumber, accountNumber, bank } = formData.disbursement.payoutBank;
      
      if (!bpayAmount) {
        return 'Please enter the Amount Payable from the payout letter';
      }

      const hasBpayDetails = billerCode && referenceNumber;
      const hasBankDetails = accountName && bsbNumber && accountNumber && bank;

      if (!hasBpayDetails && !hasBankDetails) {
        return 'Please fill in either BPAY details (Biller Code + Reference) OR bank account details (all 4 fields) for the financier';
      }

      if (hasBankDetails && !/^\d{6}$/.test(bsbNumber)) {
        return 'Financier BSB must be exactly 6 digits';
      }
    }

    // Validate vendor details if NOT under finance OR if there's remaining balance
    if (!isUnderFinance || needsVendorPayment) {
      if (!hasVendorUpload) {
        return 'Please upload proof of vendor\'s nominated bank account';
      }
      const { accountName, bsbNumber, accountNumber, bank } = formData.disbursement.bankAccount;
      if (!accountName || !bsbNumber || !accountNumber || !bank) {
        return 'Please fill in all vendor bank account fields (Account Name, BSB, Account Number, Bank)';
      }
      if (!/^\d{6}$/.test(bsbNumber)) {
        return 'Vendor BSB must be exactly 6 digits';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanType) return;
    
    // Validate buyer details
    const buyerError = validateBuyerDetails();
    if (buyerError) {
      toast({
        title: 'Buyer Details Validation Error',
        description: buyerError,
        variant: 'destructive',
      });
      return;
    }

    // Validate asset details
    const assetError = validateAssetDetails();
    if (assetError) {
      toast({
        title: 'Asset Details Validation Error',
        description: assetError,
        variant: 'destructive',
      });
      return;
    }
    
    // Validate invoice details (Purchase Price is mandatory)
    const purchasePrice = parseFloat(formData.invoice.purchasePrice.replace(/[^0-9.]/g, ''));
    if (!formData.invoice.purchasePrice.trim() || isNaN(purchasePrice) || purchasePrice <= 0) {
      toast({
        title: 'Invoice Details Validation Error',
        description: 'Purchase Price is required and must be greater than zero',
        variant: 'destructive',
      });
      return;
    }

    // Validate disbursement section
    const disbursementError = validateDisbursement();
    if (disbursementError) {
      toast({
        title: 'Disbursement Validation Error',
        description: disbursementError,
        variant: 'destructive',
      });
      return;
    }
    
    // Validate: if under finance and amount payable > balance, show error
    if (isUnderFinance) {
      const balance = parseFloat(formData.invoice.balanceToBeFinanced.replace(/[^0-9.]/g, '')) || 0;
      const amountPayable = parseFloat(formData.disbursement.bpay.amount.replace(/[^0-9.]/g, '')) || 0;
      
      if (amountPayable > balance) {
        toast({
          title: 'Amount Payable Exceeds Balance',
          description: 'The Amount Payable cannot be greater than the Balance to be Financed.',
          variant: 'destructive',
        });
        return;
      }
    }
    setPreviewOpen(true);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setLoanType(null);
    setDivision(null);
    setIsUnderFinance(null);
    setHasVendorUpload(false);
    setHasFinancierUpload(false);
    setHasAssetUpload(false);
    toast({
      title: 'Form Reset',
      description: 'All fields have been cleared.',
    });
  };

  const handleLoanTypeChange = (newType: LoanType) => {
    // Determine the new division
    const newDivision = newType === 'commercial' ? 'commercial' : 'consumer';
    
    // If switching divisions, reset everything
    if (newDivision !== division) {
      setDivision(newDivision);
      setFormData(initialFormData);
      setIsUnderFinance(null);
      setHasVendorUpload(false);
      setHasFinancierUpload(false);
      setHasAssetUpload(false);
    }
    
    setLoanType(newType);
  };

  const handleBackToDivision = () => {
    setLoanType(null);
    setDivision(null);
    setFormData(initialFormData);
    setIsUnderFinance(null);
    setHasVendorUpload(false);
    setHasFinancierUpload(false);
    setHasAssetUpload(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center">Private Sale Vendor Invoice Generator</h1>

      {/* Loan Type Selector */}
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Select Loan Type</h2>
        <LoanTypeSelector 
          value={loanType} 
          onChange={handleLoanTypeChange}
          division={division}
          onDivisionChange={setDivision}
          onBackToDivision={handleBackToDivision}
        />
      </div>

      {/* Form - Only show when loan type is fully selected */}
      {isLoanTypeFullySelected && config && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <BuyerDetailsSection
            data={formData.buyer}
            onChange={(buyer) => setFormData({ ...formData, buyer })}
          />

          <AssetDetailsSection
            data={formData.asset}
            onChange={(asset) => setFormData({ ...formData, asset })}
            loanType={loanType}
            hasUpload={hasAssetUpload}
            onUploadChange={setHasAssetUpload}
          />

          <InvoiceDetailsSection
            data={formData.invoice}
            onChange={(invoice) => setFormData({ ...formData, invoice })}
          />

          <DisbursementSection
            data={formData.disbursement}
            onChange={(disbursement) => setFormData({ ...formData, disbursement })}
            isUnderFinance={isUnderFinance}
            onIsUnderFinanceChange={setIsUnderFinance}
            balanceToBeFinanced={formData.invoice.balanceToBeFinanced}
            hasVendorUpload={hasVendorUpload}
            onVendorUploadChange={setHasVendorUpload}
            hasFinancierUpload={hasFinancierUpload}
            onFinancierUploadChange={setHasFinancierUpload}
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
            isUnderFinance={isUnderFinance}
          />
        </form>
      )}
    </div>
  );
}
