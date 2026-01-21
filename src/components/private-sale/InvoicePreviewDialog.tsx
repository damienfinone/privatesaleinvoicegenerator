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

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    buyer: { name: string; address: string; contactNumber: string };
    asset: {
      hull: { make: string; model: string; hin: string; registration: string; odometer: string; colour: string };
      trailer: { make: string; model: string; registration: string };
      motor: { make: string; model: string; engineNumber: string };
    };
    invoice: { purchasePrice: string; depositAmount: string; balanceToBeFinanced: string };
    disbursement: { bankAccount: { accountName: string; bsbNumber: string; accountNumber: string; amount: string } };
    vendor: { name: string; dateSigned: string };
  };
  loanType: 'commercial' | 'consumer' | 'boat';
}

export function InvoicePreviewDialog({ open, onOpenChange, formData, loanType }: InvoicePreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const fmt = (v: string) => {
    const n = parseFloat(v.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`;
  };

  const title = loanType === 'boat' ? 'Vendor Tax Invoice – Watercraft' : loanType === 'commercial' ? 'Commercial Vendor Tax Invoice' : 'Consumer Vendor Tax Invoice';

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
      pdf.save(`${loanType === 'boat' ? 'Watercraft' : loanType === 'commercial' ? 'Commercial' : 'Consumer'}_Invoice.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Invoice Preview</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto border rounded bg-gray-50 p-4">
          <div ref={contentRef} className="bg-white text-black p-6 w-[210mm] mx-auto shadow-lg font-sans text-sm">
            <div className="text-center border-b-2 border-black pb-3 mb-4">
              <h1 className="text-lg font-bold">{title}</h1>
              <p className="font-semibold">Fin One Pty Ltd</p>
              <p className="text-xs">ABN: 80 139 719 903 | Australian Credit Licence: 387 528</p>
            </div>
            <div className="mb-3"><div className="text-xs font-bold bg-gray-100 px-2 py-1 border mb-1">Buyer</div><div className="px-2 text-xs"><div>Name: {formData.buyer.name || '—'}</div><div>Address: {formData.buyer.address || '—'}</div></div></div>
            <div className="mb-3"><div className="text-xs font-bold bg-gray-100 px-2 py-1 border mb-1">{loanType === 'boat' ? 'Hull' : 'Vehicle'}</div><div className="px-2 text-xs"><div>Make: {formData.asset.hull.make || '—'}</div><div>Model: {formData.asset.hull.model || '—'}</div></div></div>
            <div className="mb-3"><div className="text-xs font-bold bg-gray-100 px-2 py-1 border mb-1">Price</div><div className="px-2 text-xs"><div>Purchase: {fmt(formData.invoice.purchasePrice)}</div><div>Balance: {fmt(formData.invoice.balanceToBeFinanced)}</div></div></div>
            <div className="mb-3"><div className="text-xs font-bold bg-gray-100 px-2 py-1 border mb-1">Vendor</div><div className="px-2 text-xs"><div>Name: {formData.vendor.name || '—'}</div></div></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleDownload} disabled={generating}>{generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
