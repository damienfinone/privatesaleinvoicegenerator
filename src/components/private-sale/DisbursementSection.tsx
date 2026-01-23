import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { DisbursementOptions } from '@/types/privateSaleForm';
import { parsePdf, ExtractionType } from '@/lib/pdfParser';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DisbursementSectionProps {
  data: DisbursementOptions;
  onChange: (data: DisbursementOptions) => void;
  isUnderFinance: boolean | null;
  onIsUnderFinanceChange: (value: boolean) => void;
  balanceToBeFinanced: string;
  hasVendorUpload: boolean;
  onVendorUploadChange: (uploaded: boolean) => void;
  hasFinancierUpload: boolean;
  onFinancierUploadChange: (uploaded: boolean) => void;
}

const parseAmount = (value: string): number => {
  const n = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
};

export function DisbursementSection({ 
  data, 
  onChange, 
  isUnderFinance,
  onIsUnderFinanceChange,
  balanceToBeFinanced,
  hasVendorUpload,
  onVendorUploadChange,
  hasFinancierUpload,
  onFinancierUploadChange
}: DisbursementSectionProps) {
  const [uploadingOption, setUploadingOption] = useState<string | null>(null);
  const [successOption, setSuccessOption] = useState<string | null>(null);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const { toast } = useToast();

  const balance = parseAmount(balanceToBeFinanced);
  const amountPayable = parseAmount(data.bpay.amount);
  
  // Calculate if vendor payment is also needed (when Amount Payable < Balance)
  const needsVendorPayment = isUnderFinance === true && amountPayable > 0 && amountPayable < balance;
  const vendorAmount = needsVendorPayment ? balance - amountPayable : balance;

  // Check if both bank and BPAY details are complete (for financier)
  const hasBankDetails = data.payoutBank.accountName && data.payoutBank.bsbNumber && 
                         data.payoutBank.accountNumber && data.payoutBank.bank;
  const hasBpayDetails = data.bpay.billerCode && data.bpay.referenceNumber;

  const handleSelectPaymentMethod = (method: 'bank' | 'bpay') => {
    if (method === 'bank') {
      onChange({
        ...data,
        bpay: {
          ...data.bpay,
          billerCode: '',
          referenceNumber: '',
        },
      });
      toast({
        title: 'Bank Account Selected',
        description: 'BPAY fields have been cleared.',
      });
    } else {
      onChange({
        ...data,
        payoutBank: {
          ...data.payoutBank,
          accountName: '',
          bsbNumber: '',
          accountNumber: '',
          bank: '',
        },
      });
      toast({
        title: 'BPAY Selected',
        description: 'Bank account fields have been cleared.',
      });
    }
    setShowPaymentMethodDialog(false);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    option: 'bankAccount' | 'payoutBank',
    extractionType: ExtractionType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    setUploadingOption(option);
    setSuccessOption(null);

    try {
      const extractedData = await parsePdf(file, extractionType);
      
      if (option === 'bankAccount') {
        onChange({
          ...data,
          bankAccount: {
            accountName: extractedData.accountName || data.bankAccount.accountName,
            bsbNumber: extractedData.bsbNumber || data.bankAccount.bsbNumber,
            accountNumber: extractedData.accountNumber || data.bankAccount.accountNumber,
            bank: extractedData.bank || data.bankAccount.bank,
          },
        });
        onVendorUploadChange(true);
      } else if (option === 'payoutBank') {
        onChange({
          ...data,
          payoutBank: {
            accountName: extractedData.accountName || data.payoutBank.accountName,
            bsbNumber: extractedData.bsbNumber || data.payoutBank.bsbNumber,
            accountNumber: extractedData.accountNumber || data.payoutBank.accountNumber,
            bank: extractedData.bank || data.payoutBank.bank,
            amount: extractedData.payoutAmount || data.payoutBank.amount,
          },
          bpay: {
            ...data.bpay,
            billerCode: extractedData.billerCode || data.bpay.billerCode,
            referenceNumber: extractedData.referenceNumber || data.bpay.referenceNumber,
            amount: extractedData.payoutAmount || data.bpay.amount,
          },
        });
        onFinancierUploadChange(true);
      }

      setSuccessOption(option);
      
      const fieldsPopulated: string[] = [];
      if (extractedData.accountName) fieldsPopulated.push('Account Name');
      if (extractedData.bsbNumber) fieldsPopulated.push('BSB');
      if (extractedData.accountNumber) fieldsPopulated.push('Account Number');
      if (extractedData.bank) fieldsPopulated.push('Bank');
      if (extractedData.billerCode) fieldsPopulated.push('Biller Code');
      if (extractedData.referenceNumber) fieldsPopulated.push('Reference Number');
      if (extractedData.payoutAmount) fieldsPopulated.push('Amount');
      
      toast({
        title: 'PDF processed successfully',
        description: fieldsPopulated.length > 0 
          ? `Extracted: ${fieldsPopulated.join(', ')}`
          : 'No details could be extracted from this PDF. Please enter manually.',
        variant: fieldsPopulated.length > 0 ? 'default' : 'destructive',
      });

      // Check if both bank and BPAY are now complete (for financier payout letter)
      if (option === 'payoutBank') {
        const updatedBankDetails = (extractedData.accountName || data.payoutBank.accountName) && 
                                   (extractedData.bsbNumber || data.payoutBank.bsbNumber) && 
                                   (extractedData.accountNumber || data.payoutBank.accountNumber) && 
                                   (extractedData.bank || data.payoutBank.bank);
        const updatedBpayDetails = (extractedData.billerCode || data.bpay.billerCode) && 
                                   (extractedData.referenceNumber || data.bpay.referenceNumber);
        
        if (updatedBankDetails && updatedBpayDetails) {
          setShowPaymentMethodDialog(true);
        }
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Error processing PDF',
        description: error instanceof Error ? error.message : 'Failed to extract data',
        variant: 'destructive',
      });
    } finally {
      setUploadingOption(null);
    }
  };

  // Normalize BSB: remove spaces/hyphens and validate
  const normalizeBsb = (value: string) => value.replace(/[\s\-]/g, '');
  const getBsbError = (value: string) => {
    if (!value) return null;
    const normalized = normalizeBsb(value);
    if (normalized.length > 0 && !/^\d*$/.test(normalized)) return 'BSB must contain only numbers';
    if (normalized.length > 0 && normalized.length !== 6) return 'BSB must be exactly 6 digits';
    return null;
  };

  const handleBankAccountChange = (field: keyof typeof data.bankAccount, value: string) => {
    const finalValue = field === 'bsbNumber' ? normalizeBsb(value) : value;
    onChange({ ...data, bankAccount: { ...data.bankAccount, [field]: finalValue } });
  };

  const handlePayoutBankChange = (field: keyof typeof data.payoutBank, value: string) => {
    const finalValue = field === 'bsbNumber' ? normalizeBsb(value) : value;
    const newData = { ...data, payoutBank: { ...data.payoutBank, [field]: finalValue } };
    onChange(newData);
    
    const updatedBankDetails = newData.payoutBank.accountName && newData.payoutBank.bsbNumber && 
                               newData.payoutBank.accountNumber && newData.payoutBank.bank;
    if (updatedBankDetails && hasBpayDetails) {
      setShowPaymentMethodDialog(true);
    }
  };

  const handleBpayChange = (field: keyof typeof data.bpay, value: string) => {
    const newData = { ...data, bpay: { ...data.bpay, [field]: value } };
    onChange(newData);
    
    if (field === 'billerCode' || field === 'referenceNumber') {
      const updatedBpayDetails = (field === 'billerCode' ? value : newData.bpay.billerCode) && 
                                 (field === 'referenceNumber' ? value : newData.bpay.referenceNumber);
      if (hasBankDetails && updatedBpayDetails) {
        setShowPaymentMethodDialog(true);
      }
    }
  };

  const UploadButton = ({ 
    option, 
    extractionType, 
    inputId,
    description = "Upload PDF to auto-populate"
  }: { 
    option: 'bankAccount' | 'payoutBank'; 
    extractionType: ExtractionType;
    inputId: string;
    description?: string;
  }) => (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-4">
        {successOption === option ? (
          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{description}</p>
        </div>
        <Label htmlFor={inputId} className="cursor-pointer">
          <Button variant="outline" size="sm" disabled={uploadingOption === option} asChild>
            <span>
              {uploadingOption === option ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Choose PDF'
              )}
            </span>
          </Button>
        </Label>
        <Input
          id={inputId}
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileUpload(e, option, extractionType)}
          className="hidden"
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Disbursement Options for Settlement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Is Asset Under Finance? */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Is the asset currently under finance? <span className="text-destructive">*</span></Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={isUnderFinance === false ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onIsUnderFinanceChange(false)}
            >
              No
            </Button>
            <Button
              type="button"
              variant={isUnderFinance === true ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onIsUnderFinanceChange(true)}
            >
              Yes
            </Button>
          </div>
        </div>

        {/* Financier Section - Only when asset IS under finance */}
        {isUnderFinance === true && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Financier Payout Details</h4>
            <UploadButton 
              option="payoutBank" 
              extractionType="payout_letter_bank" 
              inputId="payoutBankPdf" 
              description="Upload payout letter from the current financier (fields below will be auto-populated)" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pb_accountName">Account Name</Label>
                <Input
                  id="pb_accountName"
                  value={data.payoutBank.accountName}
                  onChange={(e) => handlePayoutBankChange('accountName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pb_bsb">BSB Number</Label>
                <Input
                  id="pb_bsb"
                  value={data.payoutBank.bsbNumber}
                  onChange={(e) => handlePayoutBankChange('bsbNumber', e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className={getBsbError(data.payoutBank.bsbNumber) ? 'border-destructive' : ''}
                />
                {getBsbError(data.payoutBank.bsbNumber) && (
                  <p className="text-xs text-destructive">{getBsbError(data.payoutBank.bsbNumber)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pb_accountNumber">Account Number</Label>
                <Input
                  id="pb_accountNumber"
                  value={data.payoutBank.accountNumber}
                  onChange={(e) => handlePayoutBankChange('accountNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pb_bank">Bank Name</Label>
                <Input
                  id="pb_bank"
                  value={data.payoutBank.bank}
                  onChange={(e) => handlePayoutBankChange('bank', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bpay_billerCode">Biller Code (BPAY only)</Label>
                <Input
                  id="bpay_billerCode"
                  value={data.bpay.billerCode}
                  onChange={(e) => handleBpayChange('billerCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpay_reference">Reference Number (BPAY only)</Label>
                <Input
                  id="bpay_reference"
                  value={data.bpay.referenceNumber}
                  onChange={(e) => handleBpayChange('referenceNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpay_amount">Amount Payable <span className="text-destructive">*</span></Label>
                <Input
                  id="bpay_amount"
                  value={data.bpay.amount}
                  onChange={(e) => handleBpayChange('amount', e.target.value)}
                  placeholder="$0.00"
                />
              </div>
            </div>

            {/* Alert when vendor payment is also needed */}
            {needsVendorPayment && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The Amount Payable ({formatCurrency(amountPayable)}) is less than the Balance to be Financed ({formatCurrency(balance)}). 
                  The remaining {formatCurrency(vendorAmount)} will be paid to the vendor. Please provide vendor bank details below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Vendor Section - When NOT under finance OR when there's a remaining balance */}
        {(isUnderFinance === false || needsVendorPayment) && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">
              Vendor Bank Account Details
              {needsVendorPayment && (
                <span className="font-normal text-muted-foreground ml-2">
                  (Remaining amount: {formatCurrency(vendorAmount)})
                </span>
              )}
            </h4>
            <UploadButton 
              option="bankAccount" 
              extractionType="bank_account" 
              inputId="bankAccountPdf" 
              description="Upload proof of vendor's nominated bank account (fields below will be auto-populated)" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ba_accountName">Account Name <span className="text-destructive">*</span></Label>
                <Input
                  id="ba_accountName"
                  value={data.bankAccount.accountName}
                  onChange={(e) => handleBankAccountChange('accountName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba_bsb">BSB Number <span className="text-destructive">*</span></Label>
                <Input
                  id="ba_bsb"
                  value={data.bankAccount.bsbNumber}
                  onChange={(e) => handleBankAccountChange('bsbNumber', e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className={getBsbError(data.bankAccount.bsbNumber) ? 'border-destructive' : ''}
                />
                {getBsbError(data.bankAccount.bsbNumber) && (
                  <p className="text-xs text-destructive">{getBsbError(data.bankAccount.bsbNumber)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba_accountNumber">Account Number <span className="text-destructive">*</span></Label>
                <Input
                  id="ba_accountNumber"
                  value={data.bankAccount.accountNumber}
                  onChange={(e) => handleBankAccountChange('accountNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba_bank">Bank Name <span className="text-destructive">*</span></Label>
                <Input
                  id="ba_bank"
                  value={data.bankAccount.bank}
                  onChange={(e) => handleBankAccountChange('bank', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Payment Method Selection Dialog */}
      <AlertDialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Both bank account and BPAY information has been provided. Please select which to proceed with (unnecessary fields will be cleared).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => handleSelectPaymentMethod('bank')}>
              Bank Account
            </Button>
            <Button onClick={() => handleSelectPaymentMethod('bpay')}>
              BPAY
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
