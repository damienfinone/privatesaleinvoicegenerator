import { PrivateSaleFormData } from '@/types/privateSaleForm';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { InvoiceLayout } from './InvoiceLayout';
import { InvoiceSection, FieldRow, TwoColumnFields } from './InvoiceSection';

interface ConsumerInvoiceProps {
  data: PrivateSaleFormData;
}

export function ConsumerInvoice({ data }: ConsumerInvoiceProps) {
  return (
    <InvoiceLayout title="Consumer Vendor Tax Invoice">
      {/* Buyer Details */}
      <InvoiceSection title="Buyer Details">
        <FieldRow label="Name" value={data.buyer.name} />
        <FieldRow label="Address" value={data.buyer.address} />
        <FieldRow label="Contact Number" value={data.buyer.contactNumber} />
      </InvoiceSection>

      {/* Vehicle Details */}
      <InvoiceSection title="Vehicle Details">
        <TwoColumnFields
          fields={[
            { label: 'Make', value: data.asset.hull.make },
            { label: 'Model', value: data.asset.hull.model },
            { label: 'Series', value: data.asset.hull.series },
            { label: 'Body Type', value: data.asset.hull.bodyType },
            { label: 'Registration', value: data.asset.hull.registration },
            { label: 'Registration Expiry', value: formatDate(data.asset.hull.registrationExpiry) },
            { label: 'Build Date', value: formatDate(data.asset.hull.buildDate) },
            { label: 'VIN/Chassis', value: data.asset.hull.hin },
            { label: 'Colour', value: data.asset.hull.colour },
            { label: 'Fuel Type', value: data.asset.hull.fuelType },
            { label: 'Odometer', value: data.asset.hull.odometer },
            { label: 'Transmission', value: data.asset.hull.transmission },
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
