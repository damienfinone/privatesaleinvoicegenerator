import { ReactNode } from 'react';

interface InvoiceSectionProps {
  title: string;
  children: ReactNode;
}

export function InvoiceSection({ title, children }: InvoiceSectionProps) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold bg-gray-100 px-2 py-1 border border-gray-300 mb-2">
        {title}
      </h2>
      <div className="px-2">
        {children}
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex border-b border-gray-200 py-1">
      <span className="w-1/3 text-gray-600 text-xs">{label}:</span>
      <span className="w-2/3 text-xs">{value || '—'}</span>
    </div>
  );
}

interface TwoColumnFieldsProps {
  fields: Array<{ label: string; value: string }>;
}

export function TwoColumnFields({ fields }: TwoColumnFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4">
      {fields.map((field, index) => (
        <FieldRow key={index} label={field.label} value={field.value} />
      ))}
    </div>
  );
}
