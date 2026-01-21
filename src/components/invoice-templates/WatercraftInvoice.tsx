import { PrivateSaleFormData } from '@/types/privateSaleForm';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { InvoiceLayout } from './InvoiceLayout';
import { InvoiceSection, FieldRow, TwoColumnFields } from './InvoiceSection';

interface WatercraftInvoiceProps {
  data: PrivateSaleFormData;
}

export function WatercraftInvoice({ data }: WatercraftInvoiceProps) {
  return (
    <InvoiceLayout title="Vendor Tax Invoice – Watercraft">
      {/* Buyer Details */}
      <InvoiceSection title="Buyer Details">
        <FieldRow label="Name" value={data.buyer.name} />
        <FieldRow label="Address" value={data.buyer.address} />
        <FieldRow label="Contact Number" value={data.buyer.contactNumber} />
      </InvoiceSection>

      {/* Hull Details */}
      <InvoiceSection title="Hull Details">
        <TwoColumnFields
          fields={[
            { label: 'Make', value: data.asset.hull.make },
            { label: 'Model', value: data.asset.hull.model },
            { label: 'Series', value: data.asset.hull.series },
            { label: 'Registration', value: data.asset.hull.registration },
            { label: 'Registration Expiry', value: formatDate(data.asset.hull.registrationExpiry) },
            { label: 'Build Date', value: formatDate(data.asset.hull.buildDate) },
            { label: 'HIN', value: data.asset.hull.hin },
            { label: 'Colour', value: data.asset.hull.colour },
          ]}
        />
      </InvoiceSection>

      {/* Trailer Details */}
      <InvoiceSection title="Trailer Details">
        <TwoColumnFields
          fields={[
            { label: 'Make', value: data.asset.trailer.make },
            { label: 'Model', value: data.asset.trailer.model },
            { label: 'Series', value: data.asset.trailer.series },
            { label: 'Registration', value: data.asset.trailer.registration },
            { label: 'Registration Expiry', value: formatDate(data.asset.trailer.registrationExpiry) },
            { label: 'Build Date', value: formatDate(data.asset.trailer.buildDate) },
          ]}
        />
      </InvoiceSection>

      {/* Motor Details */}
      <InvoiceSection title="Motor Details">
        <TwoColumnFields
          fields={[
            { label: 'Make', value: data.asset.motor.make },
            { label: 'Model', value: data.asset.motor.model },
            { label: 'Series', value: data.asset.motor.series },
            { label: 'Engine Size', value: data.asset.motor.engineSize },
            { label: 'Build Date', value: formatDate(data.asset.motor.buildDate) },
            { label: 'Engine Number', value: data.asset.motor.engineNumber },
          ]}
        />
      </InvoiceSection>

      {/* Invoice Price */}
      <InvoiceSection title="Invoice Price">
        <FieldRow label="Purchase Price" value={formatCurrency(data.invoice.purchasePrice)} />
        <FieldRow label="Deposit Amount" value={formatCurrency(data.invoice.depositAmount)} />
        <FieldRow label="Balance to be Financed" value={formatCurrency(data.invoice.balanceToBeFinanced)} />
      </InvoiceSection>

      {/* Disbursement */}
      <InvoiceSection title="Disbursement Details">
        <div className="text-xs font-semibold mb-1">Bank Account</div>
        <TwoColumnFields
          fields={[
            { label: 'Account Name', value: data.disbursement.bankAccount.accountName },
            { label: 'BSB', value: data.disbursement.bankAccount.bsbNumber },
            { label: 'Account Number', value: data.disbursement.bankAccount.accountNumber },
            { label: 'Amount', value: formatCurrency(data.disbursement.bankAccount.amount) },
          ]}
        />
      </InvoiceSection>

      {/* Vendor Details */}
      <InvoiceSection title="Vendor Declaration">
        <FieldRow label="Vendor Name" value={data.vendor.name} />
        <FieldRow label="Date Signed" value={formatDate(data.vendor.dateSigned)} />
      </InvoiceSection>
    </InvoiceLayout>
  );
}
