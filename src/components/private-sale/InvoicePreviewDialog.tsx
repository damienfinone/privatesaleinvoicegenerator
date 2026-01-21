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

type LoanType = 'commercial' | 'consumer' | 'boat';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PrivateSaleFormData;
  loanType: LoanType;
}

const fmt = (v: string) => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`;
};

const fmtDate = (v: string) => {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleDateString('en-AU');
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
    <div className="mb-3">
      <div className="text-xs font-bold bg-gray-200 px-2 py-1 border border-gray-400 mb-1">{title}</div>
      <div className="px-2 text-xs">{children}</div>
    </div>
  );
}

function ConsumerContent({ data }: { data: PrivateSaleFormData }) {
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
          <Field label="Build Date" value={fmtDate(data.asset.hull.buildDate)} />
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

      <Section title="Disbursement Options for Settlement">
        <div className="font-semibold text-xs mt-1 mb-1">Bank Account Details:</div>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Account Name" value={data.disbursement.bankAccount.accountName} />
          <Field label="Bank" value={data.disbursement.bankAccount.bank} />
          <Field label="BSB Number" value={data.disbursement.bankAccount.bsbNumber} />
          <Field label="Account Number" value={data.disbursement.bankAccount.accountNumber} />
          <Field label="Amount" value={fmt(data.disbursement.bankAccount.amount)} />
        </div>

        {data.disbursement.payoutBank.accountName && (
          <>
            <div className="font-semibold text-xs mt-2 mb-1">Payout Letter - Bank Account Details:</div>
            <div className="grid grid-cols-2 gap-x-4">
              <Field label="Account Name" value={data.disbursement.payoutBank.accountName} />
              <Field label="Bank" value={data.disbursement.payoutBank.bank} />
              <Field label="BSB Number" value={data.disbursement.payoutBank.bsbNumber} />
              <Field label="Account Number" value={data.disbursement.payoutBank.accountNumber} />
              <Field label="Amount" value={fmt(data.disbursement.payoutBank.amount)} />
            </div>
          </>
        )}

        {data.disbursement.bpay.billerCode && (
          <>
            <div className="font-semibold text-xs mt-2 mb-1">Payout Letter - BPAY Details:</div>
            <div className="grid grid-cols-2 gap-x-4">
              <Field label="Account Name" value={data.disbursement.bpay.accountName} />
              <Field label="Bank" value={data.disbursement.bpay.bank} />
              <Field label="Biller Code" value={data.disbursement.bpay.billerCode} />
              <Field label="Reference Number" value={data.disbursement.bpay.referenceNumber} />
              <Field label="Amount" value={fmt(data.disbursement.bpay.amount)} />
            </div>
          </>
        )}
      </Section>

      <Section title="Vendor Declaration">
        <Field label="Vendor Name" value={data.vendor.name} />
        <Field label="Date Signed" value={fmtDate(data.vendor.dateSigned)} />
      </Section>
    </>
  );
}

function WatercraftContent({ data }: { data: PrivateSaleFormData }) {
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
          <Field label="Build Date" value={fmtDate(data.asset.hull.buildDate)} />
          <Field label="HIN" value={data.asset.hull.hin} />
        </div>
      </Section>

      <Section title="Trailer Details">
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Make" value={data.asset.trailer.make} />
          <Field label="Model" value={data.asset.trailer.model} />
          <Field label="Series" value={data.asset.trailer.series} />
          <Field label="Registration" value={data.asset.trailer.registration} />
          <Field label="Registration Expiry" value={fmtDate(data.asset.trailer.registrationExpiry)} />
          <Field label="Build Date" value={fmtDate(data.asset.trailer.buildDate)} />
        </div>
      </Section>

      <Section title="Motor Details">
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Make" value={data.asset.motor.make} />
          <Field label="Model" value={data.asset.motor.model} />
          <Field label="Series" value={data.asset.motor.series} />
          <Field label="Engine Size" value={data.asset.motor.engineSize} />
          <Field label="Build Date" value={fmtDate(data.asset.motor.buildDate)} />
          <Field label="Engine Number" value={data.asset.motor.engineNumber} />
        </div>
      </Section>

      <Section title="Invoice Price">
        <Field label="Purchase Price" value={fmt(data.invoice.purchasePrice)} />
        <Field label="Deposit Amount" value={fmt(data.invoice.depositAmount)} />
        <Field label="Balance to be financed" value={fmt(data.invoice.balanceToBeFinanced)} />
      </Section>

      <Section title="Disbursement Options for Settlement">
        <div className="font-semibold text-xs mt-1 mb-1">Bank Account Details:</div>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Account Name" value={data.disbursement.bankAccount.accountName} />
          <Field label="Bank" value={data.disbursement.bankAccount.bank} />
          <Field label="BSB Number" value={data.disbursement.bankAccount.bsbNumber} />
          <Field label="Account Number" value={data.disbursement.bankAccount.accountNumber} />
          <Field label="Amount" value={fmt(data.disbursement.bankAccount.amount)} />
        </div>
      </Section>

      <Section title="Vendor Declaration">
        <Field label="Vendor Name" value={data.vendor.name} />
        <Field label="Date Signed" value={fmtDate(data.vendor.dateSigned)} />
      </Section>
    </>
  );
}

export function InvoicePreviewDialog({ open, onOpenChange, formData, loanType }: InvoicePreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const title = loanType === 'boat' 
    ? 'VENDOR TAX INVOICE – WATERCRAFT' 
    : loanType === 'commercial' 
      ? 'COMMERCIAL VENDOR TAX INVOICE' 
      : 'VENDOR TAX INVOICE';

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, backgroundColor: '#fff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      const r = Math.min(w / canvas.width, h / canvas.height);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width * r, canvas.height * r);
      const label = loanType === 'boat' ? 'Watercraft' : loanType === 'commercial' ? 'Commercial' : 'Consumer';
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
              <h1 className="text-2xl font-bold mb-1">Fin One Pty Ltd</h1>
              <p className="text-xs">ABN: 80 139 719 903</p>
              <p className="text-xs">Australian Credit Licence: 387 528</p>
              <p className="text-xs">Phone: 1800 346 663 | Fax: (07) 4723 5466</p>
              <p className="text-xs">PO Box 3041, Hermit Park QLD 4812</p>
              <h2 className="text-lg font-bold mt-3 border-t border-b border-gray-400 py-2">{title}</h2>
            </div>

            {/* Content based on loan type */}
            {loanType === 'boat' ? (
              <WatercraftContent data={formData} />
            ) : (
              <ConsumerContent data={formData} />
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
