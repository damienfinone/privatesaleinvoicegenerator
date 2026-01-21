import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle, User, Building2 } from 'lucide-react';
import { DisbursementOptions } from '@/types/privateSaleForm';
import { parsePdf, ExtractionType } from '@/lib/pdfParser';
import { useToast } from '@/hooks/use-toast';

type DisbursementType = 'vendor' | 'financier';

interface DisbursementSectionProps {
  data: DisbursementOptions;
  onChange: (data: DisbursementOptions) => void;
}

export function DisbursementSection({ data, onChange }: DisbursementSectionProps) {
  const [uploadingOption, setUploadingOption] = useState<string | null>(null);
  const [successOption, setSuccessOption] = useState<string | null>(null);
  const [disbursementType, setDisbursementType] = useState<DisbursementType | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    option: 'bankAccount' | 'payoutBank' | 'bpay',
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
        });
      } else if (option === 'bpay') {
        onChange({
          ...data,
          bpay: {
            accountName: extractedData.accountName || data.bpay.accountName,
            billerCode: extractedData.billerCode || data.bpay.billerCode,
            referenceNumber: extractedData.referenceNumber || data.bpay.referenceNumber,
            bank: extractedData.bank || data.bpay.bank,
            amount: extractedData.payoutAmount || data.bpay.amount,
          },
        });
      }

      setSuccessOption(option);
      toast({
        title: 'PDF processed successfully',
        description: 'Banking details have been extracted and populated',
      });
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

  const handleBankAccountChange = (field: keyof typeof data.bankAccount, value: string) => {
    onChange({ ...data, bankAccount: { ...data.bankAccount, [field]: value } });
  };

  const handlePayoutBankChange = (field: keyof typeof data.payoutBank, value: string) => {
    onChange({ ...data, payoutBank: { ...data.payoutBank, [field]: value } });
  };

  const handleBpayChange = (field: keyof typeof data.bpay, value: string) => {
    onChange({ ...data, bpay: { ...data.bpay, [field]: value } });
  };

  const UploadButton = ({ 
    option, 
    extractionType, 
    inputId,
    description = "Upload PDF to auto-populate"
  }: { 
    option: 'bankAccount' | 'payoutBank' | 'bpay'; 
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
        {/* Type Selector Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant={disbursementType === 'vendor' ? 'default' : 'outline'}
            className="flex-1 h-16"
            onClick={() => setDisbursementType('vendor')}
          >
            <User className="mr-2 h-5 w-5" />
            Vendor
          </Button>
          <Button
            type="button"
            variant={disbursementType === 'financier' ? 'default' : 'outline'}
            className="flex-1 h-16"
            onClick={() => setDisbursementType('financier')}
          >
            <Building2 className="mr-2 h-5 w-5" />
            Financier
          </Button>
        </div>

        {/* Vendor: Bank Account Details */}
        {disbursementType === 'vendor' && (
          <div className="space-y-4">
            <h4 className="font-semibold">Vendor Bank Account Details</h4>
            <UploadButton 
              option="bankAccount" 
              extractionType="bank_account" 
              inputId="bankAccountPdf" 
              description="Upload proof of vendor's nominated bank account (fields below will be auto-populated)" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ba_accountName">Account Name</Label>
                <Input
                  id="ba_accountName"
                  value={data.bankAccount.accountName}
                  onChange={(e) => handleBankAccountChange('accountName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba_bsb">BSB Number</Label>
                <Input
                  id="ba_bsb"
                  value={data.bankAccount.bsbNumber}
                  onChange={(e) => handleBankAccountChange('bsbNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba_accountNumber">Account Number</Label>
                <Input
                  id="ba_accountNumber"
                  value={data.bankAccount.accountNumber}
                  onChange={(e) => handleBankAccountChange('accountNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba_bank">Bank/Financier</Label>
                <Input
                  id="ba_bank"
                  value={data.bankAccount.bank}
                  onChange={(e) => handleBankAccountChange('bank', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Financier: Payout Letter */}
        {disbursementType === 'financier' && (
          <div className="space-y-4">
            <h4 className="font-semibold">Payout Letter Details</h4>
            <UploadButton 
              option="payoutBank" 
              extractionType="payout_letter_bank" 
              inputId="payoutBankPdf" 
              description="Upload payout letter from another financier (fields below will be auto-populated)" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                />
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
              <div className="space-y-2">
                <Label htmlFor="pb_amount">Amount Payable</Label>
                <Input
                  id="pb_amount"
                  value={data.payoutBank.amount}
                  onChange={(e) => handlePayoutBankChange('amount', e.target.value)}
                />
              </div>
            </div>

            <div className="text-center font-semibold text-muted-foreground py-2">OR by BPAY</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bpay_billerCode">Biller Code</Label>
                <Input
                  id="bpay_billerCode"
                  value={data.bpay.billerCode}
                  onChange={(e) => handleBpayChange('billerCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpay_reference">Reference Number</Label>
                <Input
                  id="bpay_reference"
                  value={data.bpay.referenceNumber}
                  onChange={(e) => handleBpayChange('referenceNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
