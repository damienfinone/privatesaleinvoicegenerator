import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Eye, Loader2 } from 'lucide-react';
import { PrivateSaleFormData } from '@/types/privateSaleForm';

type LoanType = 'commercial' | 'consumer' | 'boat' | 'commercial-boat';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PrivateSaleFormData;
  loanType: LoanType;
  isUnderFinance: boolean | null;
}

const fmt = (v: string) => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return '$0.00';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);
};

const fmtDate = (v: string) => {
  if (!v) return '—';
  try {
    // Check if already in AU format (DD/MM/YYYY)
    const auMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (auMatch) {
      return v; // Already formatted correctly
    }
    // Try ISO format (YYYY-MM-DD)
    const isoMatch = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    // Fallback: try parsing as Date
    const date = new Date(v);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-AU');
    }
    return v;
  } catch {
    return v;
  }
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-0.5">
      <span className="w-40 text-gray-600">{label}:</span>
      <span className="flex-1">{value || '—'}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: 'bold', 
        backgroundColor: '#e5e5e5', 
        padding: '4px 8px', 
        border: '1px solid #9ca3af',
        marginBottom: '4px',
        display: 'block',
        width: '100%',
        boxSizing: 'border-box' as const,
      }}>{title}</div>
      <div style={{ padding: '0 8px', fontSize: '12px' }}>{children}</div>
    </div>
  );
}

function DisbursementContent({ data, isUnderFinance }: { data: PrivateSaleFormData; isUnderFinance: boolean | null }) {
  const balance = parseFloat(data.invoice.balanceToBeFinanced.replace(/[^0-9.]/g, '')) || 0;
  const amountPayable = parseFloat(data.disbursement.bpay.amount.replace(/[^0-9.]/g, '')) || 0;
  const needsVendorPayment = isUnderFinance && amountPayable > 0 && amountPayable < balance;
  const vendorAmount = needsVendorPayment ? balance - amountPayable : balance;
  
  // For financier, determine if BPAY or Bank details are used
  const hasBpayDetails = data.disbursement.bpay.billerCode && data.disbursement.bpay.referenceNumber;
  const hasBankDetails = data.disbursement.payoutBank.accountName && data.disbursement.payoutBank.bsbNumber;
  
  return (
    <Section title="Disbursement Options for Settlement">
      {/* Financier payment - when under finance */}
      {isUnderFinance && (
        <>
          <div className="font-semibold text-xs mt-2 mb-1">Payee: Financier</div>
          
          {/* BPAY details */}
          {hasBpayDetails && (
            <>
              <div className="text-xs mb-1">Payment Method: BPAY</div>
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Biller Code" value={data.disbursement.bpay.billerCode} />
                <Field label="Reference Number" value={data.disbursement.bpay.referenceNumber} />
              </div>
            </>
          )}
          
          {/* Bank Account details (no BPAY) */}
          {!hasBpayDetails && hasBankDetails && (
            <>
              <div className="text-xs mb-1">Payment Method: Bank Account</div>
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Account Name" value={data.disbursement.payoutBank.accountName} />
                <Field label="Bank" value={data.disbursement.payoutBank.bank} />
                <Field label="BSB Number" value={data.disbursement.payoutBank.bsbNumber} />
                <Field label="Account Number" value={data.disbursement.payoutBank.accountNumber} />
              </div>
            </>
          )}
          
          <Field label="Amount Payable" value={fmt(data.disbursement.bpay.amount)} />
        </>
      )}
      
      {/* Vendor payment - when NOT under finance OR when there's remaining balance */}
      {(!isUnderFinance || needsVendorPayment) && (
        <>
          <div className="font-semibold text-xs mt-2 mb-1">Payee: Vendor</div>
          <div className="text-xs mb-1">Payment Method: Bank Account</div>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Account Name" value={data.disbursement.bankAccount.accountName} />
            <Field label="Bank" value={data.disbursement.bankAccount.bank} />
            <Field label="BSB Number" value={data.disbursement.bankAccount.bsbNumber} />
            <Field label="Account Number" value={data.disbursement.bankAccount.accountNumber} />
          </div>
          <Field label="Amount" value={fmt(needsVendorPayment ? vendorAmount.toString() : data.invoice.balanceToBeFinanced)} />
        </>
      )}
    </Section>
  );
}

function ConsumerContent({ data, isUnderFinance }: { data: PrivateSaleFormData; isUnderFinance: boolean | null }) {
  return (
    <>
      <Section title="Buyer's Details">
        <Field label="Buyer's Name" value={data.buyer.name} />
        <Field label="Buyer's Address" value={data.buyer.address} />
        <Field label="Buyer's Contact Number" value={data.buyer.contactNumber} />
      </Section>

      <Section title="Asset Details">
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Make" value={data.asset.hull.make} />
          <Field label="Model" value={data.asset.hull.model} />
          <Field label="Series" value={data.asset.hull.series} />
          <Field label="Colour" value={data.asset.hull.colour} />
          <Field label="Build Date" value={data.asset.hull.buildDate || '—'} />
          <Field label="Fuel Type" value={data.asset.hull.fuelType} />
          <Field label="Registration" value={data.asset.hull.registration} />
          <Field label="Registration Expiry" value={fmtDate(data.asset.hull.registrationExpiry)} />
          <Field label="Identification Number" value={data.asset.hull.hin} />
          <Field label="Body Type" value={data.asset.hull.bodyType} />
          <Field label="Engine Number" value={data.asset.motor.engineNumber} />
          <Field label="Transmission" value={data.asset.hull.transmission} />
          <Field label="Odometer Reading" value={data.asset.hull.odometer} />
        </div>
      </Section>

      <Section title="Invoice Price">
        <Field label="Purchase Price" value={fmt(data.invoice.purchasePrice)} />
        <Field label="Deposit Amount" value={fmt(data.invoice.depositAmount)} />
        <Field label="Balance to be financed" value={fmt(data.invoice.balanceToBeFinanced)} />
      </Section>

      <DisbursementContent data={data} isUnderFinance={isUnderFinance} />
    </>
  );
}

function WatercraftContent({ data, isUnderFinance }: { data: PrivateSaleFormData; isUnderFinance: boolean | null }) {
  return (
    <>
      <Section title="Buyer's Details">
        <Field label="Buyer's Name" value={data.buyer.name} />
        <Field label="Buyer's Address" value={data.buyer.address} />
        <Field label="Buyer's Contact Number" value={data.buyer.contactNumber} />
      </Section>

      <Section title="Hull Details">
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Make" value={data.asset.hull.make} />
          <Field label="Model" value={data.asset.hull.model} />
          <Field label="Series" value={data.asset.hull.series} />
          <Field label="Colour" value={data.asset.hull.colour} />
          <Field label="Registration" value={data.asset.hull.registration} />
          <Field label="Registration Expiry" value={fmtDate(data.asset.hull.registrationExpiry)} />
          <Field label="Build Date" value={data.asset.hull.buildDate || '—'} />
          <Field label="HIN" value={data.asset.hull.hin} />
        </div>
      </Section>

      <Section title="Trailer Details">
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Make" value={data.asset.trailer.make} />
          <Field label="Model" value={data.asset.trailer.model} />
          <Field label="VIN" value={data.asset.trailer.vin} />
          <Field label="Registration" value={data.asset.trailer.registration} />
          <Field label="Registration Expiry" value={fmtDate(data.asset.trailer.registrationExpiry)} />
          <Field label="Build Date" value={data.asset.trailer.buildDate || '—'} />
        </div>
      </Section>

      <Section title="Motor Details">
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Make" value={data.asset.motor.make} />
          <Field label="Model" value={data.asset.motor.model} />
          <Field label="Engine Size" value={data.asset.motor.engineSize} />
          <Field label="Build Date" value={data.asset.motor.buildDate || '—'} />
          <Field label="Engine Number" value={data.asset.motor.engineNumber} />
        </div>
      </Section>

      <Section title="Invoice Price">
        <Field label="Purchase Price" value={fmt(data.invoice.purchasePrice)} />
        <Field label="Deposit Amount" value={fmt(data.invoice.depositAmount)} />
        <Field label="Balance to be financed" value={fmt(data.invoice.balanceToBeFinanced)} />
      </Section>

      <DisbursementContent data={data} isUnderFinance={isUnderFinance} />
    </>
  );
}

export function InvoicePreviewDialog({ open, onOpenChange, formData, loanType, isUnderFinance }: InvoicePreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const isWatercraft = loanType === 'boat' || loanType === 'commercial-boat';
  const isCommercial = loanType === 'commercial' || loanType === 'commercial-boat';
  
  const title = isWatercraft 
    ? (isCommercial ? 'COMMERCIAL VENDOR TAX INVOICE – WATERCRAFT' : 'VENDOR TAX INVOICE – WATERCRAFT')
    : isCommercial 
      ? 'COMMERCIAL VENDOR TAX INVOICE' 
      : 'VENDOR TAX INVOICE';

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(contentRef.current, { 
        scale: 1.5, // Reduced from 2 for smaller file size
        backgroundColor: '#fff',
        useCORS: true,
        logging: false,
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      const r = Math.min(w / canvas.width, h / canvas.height);
      // Use JPEG with compression for smaller file size
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, canvas.width * r, canvas.height * r);
      const label = isWatercraft 
        ? (isCommercial ? 'Commercial_Watercraft' : 'Consumer_Watercraft')
        : (isCommercial ? 'Commercial' : 'Consumer');
      pdf.save(`${label}_Vendor_Tax_Invoice.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Invoice Preview
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto border rounded bg-gray-100 p-4">
          <div ref={contentRef} className="bg-white text-black p-8 w-[210mm] mx-auto shadow-lg font-sans text-xs leading-relaxed">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h1 className="text-2xl font-bold mb-1" style={{ letterSpacing: '0.05em' }}>
                {isCommercial ? 'Finance One Commercial Pty Ltd' : 'Finance One Pty Ltd'}
              </h1>
              <p className="text-xs" style={{ letterSpacing: '0.02em' }}>
                {isCommercial ? 'ABN: 18 634 900 548' : 'ABN: 80 139 719 903'}
              </p>
              {!isCommercial && (
                <p className="text-xs" style={{ letterSpacing: '0.02em' }}>Australian Credit Licence: 387 528</p>
              )}
              <p className="text-xs" style={{ letterSpacing: '0.02em' }}>Phone: 1800 346 663 &nbsp;|&nbsp; Fax: (07) 4723 5466</p>
              <p className="text-xs" style={{ letterSpacing: '0.02em' }}>PO Box 3041, Hermit Park QLD 4812</p>
              <h2 className="text-lg font-bold mt-3 border-t border-b border-gray-400 py-2" style={{ letterSpacing: '0.02em' }}>{title}</h2>
            </div>

            {/* Content based on loan type */}
            {isWatercraft ? (
              <WatercraftContent data={formData} isUnderFinance={isUnderFinance} />
            ) : (
              <ConsumerContent data={formData} isUnderFinance={isUnderFinance} />
            )}

            {/* Footer */}
            <div className="mt-6 pt-2 border-t border-gray-300 text-center text-[10px] text-gray-500">
              Finance One – Vendor Tax Invoice
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleDownload} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
