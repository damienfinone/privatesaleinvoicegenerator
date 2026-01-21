import { ReactNode } from 'react';

interface InvoiceLayoutProps {
  title: string;
  children: ReactNode;
}

export function InvoiceLayout({ title, children }: InvoiceLayoutProps) {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black p-8 font-sans text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="font-semibold">Fin One Pty Ltd</p>
        <p className="text-xs">ABN: 80 139 719 903 | Australian Credit Licence: 387 528</p>
        <p className="text-xs">Phone: 1800 346 663 | Fax: (07) 4723 5466</p>
        <p className="text-xs">PO Box 3041, Hermit Park QLD 4812</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-center text-gray-600">
        <p>This document is a tax invoice for GST purposes where applicable.</p>
      </div>
    </div>
  );
}
