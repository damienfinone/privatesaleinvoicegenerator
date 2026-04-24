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
  const [hullIncluded, setHullIncluded] = useState<boolean>(true);
  const [motorIncluded, setMotorIncluded] = useState<boolean>(true);
  const [trailerIncluded, setTrailerIncluded] = useState<boolean>(true);
  const [hasVendorUpload, setHasVendorUpload] = useState(false);
  const [hasFinancierUpload, setHasFinancierUpload] = useState(false);
  const [hasAssetUpload, setHasAssetUpload] = useState(false);
  const [hasHullUpload, setHasHullUpload] = useState(false);
  const [hasMotorUpload, setHasMotorUpload] = useState(false);
  const [hasTrailerUpload, setHasTrailerUpload] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const config = loanType ? loanTypeConfig[loanType] : null;
  
  // Determine if we should show the form (loan type fully selected)
  const isLoanTypeFullySelected = loanType !== null;

  const validateBuyerDetails = (): string[] => {
    const errors: string[] = [];
    const { name, contactNumber, address } = formData.buyer;
    if (!name.trim()) errors.push('buyer.name');
    if (!contactNumber.trim()) errors.push('buyer.contactNumber');
    else if (!isValidAustralianPhone(contactNumber)) errors.push('buyer.contactNumber');
    if (!address.trim()) errors.push('buyer.address');
    return errors;
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

  const validateAssetDetails = (): string[] => {
    const errors: string[] = [];
    const isWatercraft = loanType === 'boat' || loanType === 'commercial-boat';
    // Document uploads are optional — no validation enforced.

    const { hull, motor } = formData.asset;
    
    // For vehicle loans (commercial/consumer)
    if (!isWatercraft) {
      if (!hull.make.trim()) errors.push('asset.hull.make');
      if (!hull.model.trim()) errors.push('asset.hull.model');
      if (!hull.colour.trim()) errors.push('asset.hull.colour');
      if (!hull.buildDate.trim()) errors.push('asset.hull.buildDate');
      if (!hull.fuelType.trim()) errors.push('asset.hull.fuelType');
      if (!hull.registration.trim()) errors.push('asset.hull.registration');
      if (!hull.registrationExpiry.trim()) errors.push('asset.hull.registrationExpiry');
      else if (!isValidAuDate(hull.registrationExpiry)) errors.push('asset.hull.registrationExpiry');
      if (!hull.hin.trim()) errors.push('asset.hull.hin');
      if (!motor.engineNumber.trim()) errors.push('asset.motor.engineNumber');
      if (!hull.bodyType.trim()) errors.push('asset.hull.bodyType');
      if (!hull.odometer.trim()) errors.push('asset.hull.odometer');
      if (!hull.transmission.trim()) errors.push('asset.hull.transmission');
    } else {
      // For boat loans - validate hull details only if hull is included
      if (hullIncluded) {
        if (!hull.make.trim()) errors.push('asset.hull.make');
        if (!hull.model.trim()) errors.push('asset.hull.model');
        if (!hull.buildDate.trim()) errors.push('asset.hull.buildDate');
        if (!hull.registration.trim()) errors.push('asset.hull.registration');
        if (!hull.identificationType.trim()) errors.push('asset.hull.identificationType');
        if (!hull.hin.trim()) errors.push('asset.hull.hin');
      }
      
      // Validate trailer details only if trailer is included
      if (trailerIncluded) {
        const { trailer } = formData.asset;
        if (!trailer.make.trim()) errors.push('asset.trailer.make');
        if (!trailer.model.trim()) errors.push('asset.trailer.model');
        if (!trailer.registration.trim()) errors.push('asset.trailer.registration');
        if (!trailer.buildDate.trim()) errors.push('asset.trailer.buildDate');
        if (!trailer.vin.trim()) errors.push('asset.trailer.vin');
      }
      
      // Validate motor details only if motor is included
      if (motorIncluded) {
        if (!motor.make.trim()) errors.push('asset.motor.make');
        if (!motor.model.trim()) errors.push('asset.motor.model');
        if (!motor.buildDate.trim()) errors.push('asset.motor.buildDate');
        if (!motor.engineNumber.trim()) errors.push('asset.motor.engineNumber');
      }
    }
    return errors;
  };

  const validateInvoiceDetails = (): string[] => {
    const errors: string[] = [];
    const purchasePrice = parseFloat(formData.invoice.purchasePrice.replace(/[^0-9.]/g, ''));
    if (!formData.invoice.purchasePrice.trim() || isNaN(purchasePrice) || purchasePrice <= 0) {
      errors.push('invoice.purchasePrice');
    }
    return errors;
  };

  const validateDisbursement = (): string[] => {
    const errors: string[] = [];
    
    if (isUnderFinance === null) {
      errors.push('disbursement.isUnderFinance');
      return errors;
    }

    const balance = parseFloat(formData.invoice.balanceToBeFinanced.replace(/[^0-9.]/g, '')) || 0;
    const amountPayable = parseFloat(formData.disbursement.bpay.amount.replace(/[^0-9.]/g, '')) || 0;
    const needsVendorPayment = isUnderFinance && amountPayable > 0 && amountPayable < balance;

    // If under finance, validate financier details
    // If under finance, validate financier details (upload optional)
    if (isUnderFinance) {

      const { amount: bpayAmount, billerCode, referenceNumber } = formData.disbursement.bpay;
      const { accountName, bsbNumber, accountNumber, bank } = formData.disbursement.payoutBank;
      
      if (!bpayAmount) {
        errors.push('disbursement.bpay.amount');
      }

      const hasBpayDetails = billerCode && referenceNumber;
      const hasBankDetails = accountName && bsbNumber && accountNumber && bank;

      if (!hasBpayDetails && !hasBankDetails) {
        // Mark all fields as needing attention
        if (!billerCode) errors.push('disbursement.bpay.billerCode');
        if (!referenceNumber) errors.push('disbursement.bpay.referenceNumber');
        if (!accountName) errors.push('disbursement.payoutBank.accountName');
        if (!bsbNumber) errors.push('disbursement.payoutBank.bsbNumber');
        if (!accountNumber) errors.push('disbursement.payoutBank.accountNumber');
        if (!bank) errors.push('disbursement.payoutBank.bank');
      }

      if (hasBankDetails && bsbNumber && !/^\d{6}$/.test(bsbNumber)) {
        errors.push('disbursement.payoutBank.bsbNumber');
      }
    }

    // Validate vendor details if NOT under finance OR if there's remaining balance
    if (!isUnderFinance || needsVendorPayment) {
      // upload optional
      const { accountName, bsbNumber, accountNumber, bank } = formData.disbursement.bankAccount;
      if (!accountName) errors.push('disbursement.bankAccount.accountName');
      if (!bsbNumber) errors.push('disbursement.bankAccount.bsbNumber');
      if (!accountNumber) errors.push('disbursement.bankAccount.accountNumber');
      if (!bank) errors.push('disbursement.bankAccount.bank');
      
      if (bsbNumber && !/^\d{6}$/.test(bsbNumber)) {
        errors.push('disbursement.bankAccount.bsbNumber');
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanType) return;
    
    // Collect all validation errors
    const allErrors: string[] = [
      ...validateBuyerDetails(),
      ...validateAssetDetails(),
      ...validateInvoiceDetails(),
      ...validateDisbursement(),
    ];
    
    if (allErrors.length > 0) {
      setValidationErrors(new Set(allErrors));
      toast({
        title: 'Required Fields Missing',
        description: 'Please complete all fields marked with an asterisk (*)',
        variant: 'destructive',
      });
      return;
    }
    
    // Clear any previous validation errors
    setValidationErrors(new Set());
    
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
    setHullIncluded(true);
    setMotorIncluded(true);
    setTrailerIncluded(true);
    setHasVendorUpload(false);
    setHasFinancierUpload(false);
    setHasAssetUpload(false);
    setHasHullUpload(false);
    setHasMotorUpload(false);
    setHasTrailerUpload(false);
    setValidationErrors(new Set());
    toast({
      title: 'Form Reset',
      description: 'All fields have been cleared.',
    });
  };

  const handleDivisionChange = (newDivision: 'consumer' | 'commercial' | null) => {
    if (newDivision !== division) {
      setDivision(newDivision);
      // Preserve asset type selection - just update the loan type to match new division
      if (loanType) {
        const isWatercraft = loanType === 'boat' || loanType === 'commercial-boat';
        if (isWatercraft) {
          setLoanType(newDivision === 'commercial' ? 'commercial-boat' : 'boat');
        } else {
          setLoanType(newDivision === 'commercial' ? 'commercial' : 'consumer');
        }
      }
      // Keep all form data - only the branding changes
    }
  };

  const handleLoanTypeChange = (newType: LoanType) => {
    // Determine the new division from the loan type
    const newDivision = (newType === 'commercial' || newType === 'commercial-boat') ? 'commercial' : 'consumer';
    setDivision(newDivision);
    
    // Check if switching between vehicle and watercraft (different asset types)
    const currentIsWatercraft = loanType === 'boat' || loanType === 'commercial-boat';
    const newIsWatercraft = newType === 'boat' || newType === 'commercial-boat';
    
    // Only reset form data if switching between vehicle and watercraft
    if (loanType !== null && currentIsWatercraft !== newIsWatercraft) {
      setFormData(initialFormData);
      setIsUnderFinance(null);
      setHullIncluded(true);
      setMotorIncluded(true);
      setTrailerIncluded(true);
      setHasVendorUpload(false);
      setHasFinancierUpload(false);
      setHasAssetUpload(false);
      setHasHullUpload(false);
      setHasMotorUpload(false);
      setHasTrailerUpload(false);
    }
    
    setLoanType(newType);
  };

  const handleBackToDivision = () => {
    // Only reset the division selection, keep the rest
    setLoanType(null);
    setDivision(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center">Private Sale Vendor Invoice Generator</h1>

      {/* Loan Type Selector */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Select Loan Type</h2>
        <LoanTypeSelector 
          value={loanType} 
          onChange={handleLoanTypeChange}
          division={division}
          onDivisionChange={handleDivisionChange}
          onBackToDivision={handleBackToDivision}
        />
      </div>

      {/* Form - Only show when loan type is fully selected */}
      {isLoanTypeFullySelected && config && (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <BuyerDetailsSection
            data={formData.buyer}
            onChange={(buyer) => setFormData(prev => ({ ...prev, buyer }))}
            validationErrors={validationErrors}
          />

          <AssetDetailsSection
            data={formData.asset}
            onChange={(asset) => setFormData(prev => ({ ...prev, asset }))}
            loanType={loanType}
            hasUpload={hasAssetUpload}
            onUploadChange={setHasAssetUpload}
            hullIncluded={hullIncluded}
            onHullIncludedChange={setHullIncluded}
            hasHullUpload={hasHullUpload}
            onHullUploadChange={setHasHullUpload}
            motorIncluded={motorIncluded}
            onMotorIncludedChange={setMotorIncluded}
            hasMotorUpload={hasMotorUpload}
            onMotorUploadChange={setHasMotorUpload}
            trailerIncluded={trailerIncluded}
            onTrailerIncludedChange={setTrailerIncluded}
            hasTrailerUpload={hasTrailerUpload}
            onTrailerUploadChange={setHasTrailerUpload}
            validationErrors={validationErrors}
          />

          <InvoiceDetailsSection
            data={formData.invoice}
            onChange={(invoice) => setFormData(prev => ({ ...prev, invoice }))}
            validationErrors={validationErrors}
          />

          <DisbursementSection
            data={formData.disbursement}
            onChange={(disbursement) => setFormData(prev => ({ ...prev, disbursement }))}
            isUnderFinance={isUnderFinance}
            onIsUnderFinanceChange={setIsUnderFinance}
            balanceToBeFinanced={formData.invoice.balanceToBeFinanced}
            hasVendorUpload={hasVendorUpload}
            onVendorUploadChange={setHasVendorUpload}
            hasFinancierUpload={hasFinancierUpload}
            onFinancierUploadChange={setHasFinancierUpload}
            validationErrors={validationErrors}
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
            trailerIncluded={trailerIncluded}
          />
        </form>
      )}
    </div>
  );
}
