import { LoanType } from '@/components/private-sale/LoanTypeSelector';

export interface Coordinate {
  x: number;
  y: number;
}

export interface FieldDefinition {
  id: string;
  label: string;
  category: string;
}

// Field definitions for each template type
export const CONSUMER_FIELDS: FieldDefinition[] = [
  // Buyer's Details
  { id: 'buyerName', label: 'Buyer Name', category: "Buyer's Details" },
  { id: 'buyerAddress', label: 'Buyer Address', category: "Buyer's Details" },
  { id: 'buyerContact', label: 'Buyer Contact', category: "Buyer's Details" },
  
  // Asset Details - Left column
  { id: 'make', label: 'Make', category: 'Asset Details' },
  { id: 'series', label: 'Series', category: 'Asset Details' },
  { id: 'buildDate', label: 'Build Date', category: 'Asset Details' },
  { id: 'registration', label: 'Registration', category: 'Asset Details' },
  { id: 'vin', label: 'VIN', category: 'Asset Details' },
  { id: 'engineNumber', label: 'Engine Number', category: 'Asset Details' },
  { id: 'odometer', label: 'Odometer', category: 'Asset Details' },
  
  // Asset Details - Right column
  { id: 'model', label: 'Model', category: 'Asset Details' },
  { id: 'colour', label: 'Colour', category: 'Asset Details' },
  { id: 'fuelType', label: 'Fuel Type', category: 'Asset Details' },
  { id: 'registrationExpiry', label: 'Registration Expiry', category: 'Asset Details' },
  { id: 'bodyType', label: 'Body Type', category: 'Asset Details' },
  { id: 'transmission', label: 'Transmission', category: 'Asset Details' },
  
  // Invoice Price
  { id: 'purchasePrice', label: 'Purchase Price', category: 'Invoice Price' },
  { id: 'depositAmount', label: 'Deposit Amount', category: 'Invoice Price' },
  { id: 'balanceFinanced', label: 'Balance Financed', category: 'Invoice Price' },
  
  // Bank Account Details
  { id: 'bankAccountName', label: 'Account Name', category: 'Bank Account' },
  { id: 'bankBsb', label: 'BSB', category: 'Bank Account' },
  { id: 'bankAccountNumber', label: 'Account Number', category: 'Bank Account' },
  { id: 'bankBank', label: 'Bank', category: 'Bank Account' },
  { id: 'bankAmount', label: 'Amount', category: 'Bank Account' },
  
  // Payout Letter - Bank
  { id: 'payoutAccountName', label: 'Payout Account Name', category: 'Payout Bank' },
  { id: 'payoutBsb', label: 'Payout BSB', category: 'Payout Bank' },
  { id: 'payoutAccountNumber', label: 'Payout Account Number', category: 'Payout Bank' },
  { id: 'payoutBank', label: 'Payout Bank', category: 'Payout Bank' },
  { id: 'payoutAmount', label: 'Payout Amount', category: 'Payout Bank' },
  
  // BPAY
  { id: 'bpayAccountName', label: 'BPAY Account Name', category: 'BPAY' },
  { id: 'bpayBillerCode', label: 'BPAY Biller Code', category: 'BPAY' },
  { id: 'bpayReference', label: 'BPAY Reference', category: 'BPAY' },
  { id: 'bpayBank', label: 'BPAY Bank', category: 'BPAY' },
  { id: 'bpayAmount', label: 'BPAY Amount', category: 'BPAY' },
];

export const COMMERCIAL_FIELDS: FieldDefinition[] = [...CONSUMER_FIELDS];

export const WATERCRAFT_FIELDS: FieldDefinition[] = [
  // Buyer's Details
  { id: 'buyerName', label: 'Buyer Name', category: "Buyer's Details" },
  { id: 'buyerAddress', label: 'Buyer Address', category: "Buyer's Details" },
  { id: 'buyerContact', label: 'Buyer Contact', category: "Buyer's Details" },
  
  // Hull Details
  { id: 'hullMake', label: 'Hull Make', category: 'Hull Details' },
  { id: 'hullModel', label: 'Hull Model', category: 'Hull Details' },
  { id: 'hullSeries', label: 'Hull Series', category: 'Hull Details' },
  { id: 'hullRegistration', label: 'Hull Registration', category: 'Hull Details' },
  { id: 'hullRegExpiry', label: 'Hull Reg Expiry', category: 'Hull Details' },
  { id: 'hullBuildDate', label: 'Hull Build Date', category: 'Hull Details' },
  { id: 'hullHin', label: 'Hull HIN', category: 'Hull Details' },
  { id: 'hullColour', label: 'Hull Colour', category: 'Hull Details' },
  
  // Trailer Details
  { id: 'trailerMake', label: 'Trailer Make', category: 'Trailer Details' },
  { id: 'trailerModel', label: 'Trailer Model', category: 'Trailer Details' },
  { id: 'trailerSeries', label: 'Trailer Series', category: 'Trailer Details' },
  { id: 'trailerRegistration', label: 'Trailer Registration', category: 'Trailer Details' },
  { id: 'trailerRegExpiry', label: 'Trailer Reg Expiry', category: 'Trailer Details' },
  { id: 'trailerBuildDate', label: 'Trailer Build Date', category: 'Trailer Details' },
  { id: 'trailerVin', label: 'Trailer VIN', category: 'Trailer Details' },
  
  // Motor Details
  { id: 'motorMake', label: 'Motor Make', category: 'Motor Details' },
  { id: 'motorModel', label: 'Motor Model', category: 'Motor Details' },
  { id: 'motorSeries', label: 'Motor Series', category: 'Motor Details' },
  { id: 'motorEngineSize', label: 'Motor Engine Size', category: 'Motor Details' },
  { id: 'motorBuildDate', label: 'Motor Build Date', category: 'Motor Details' },
  { id: 'motorEngineNumber', label: 'Motor Engine Number', category: 'Motor Details' },
  
  // Invoice Price
  { id: 'purchasePrice', label: 'Purchase Price', category: 'Invoice Price' },
  { id: 'depositAmount', label: 'Deposit Amount', category: 'Invoice Price' },
  { id: 'balanceFinanced', label: 'Balance Financed', category: 'Invoice Price' },
  
  // Bank Account Details
  { id: 'bankAccountName', label: 'Account Name', category: 'Bank Account' },
  { id: 'bankBsb', label: 'BSB', category: 'Bank Account' },
  { id: 'bankAccountNumber', label: 'Account Number', category: 'Bank Account' },
  { id: 'bankBank', label: 'Bank', category: 'Bank Account' },
  { id: 'bankAmount', label: 'Amount', category: 'Bank Account' },
  
  // Payout Letter - Bank
  { id: 'payoutAccountName', label: 'Payout Account Name', category: 'Payout Bank' },
  { id: 'payoutBsb', label: 'Payout BSB', category: 'Payout Bank' },
  { id: 'payoutAccountNumber', label: 'Payout Account Number', category: 'Payout Bank' },
  { id: 'payoutBank', label: 'Payout Bank', category: 'Payout Bank' },
  { id: 'payoutAmount', label: 'Payout Amount', category: 'Payout Bank' },
  
  // BPAY
  { id: 'bpayAccountName', label: 'BPAY Account Name', category: 'BPAY' },
  { id: 'bpayBillerCode', label: 'BPAY Biller Code', category: 'BPAY' },
  { id: 'bpayReference', label: 'BPAY Reference', category: 'BPAY' },
  { id: 'bpayBank', label: 'BPAY Bank', category: 'BPAY' },
  { id: 'bpayAmount', label: 'BPAY Amount', category: 'BPAY' },
  
  // Vendor
  { id: 'vendorName', label: 'Vendor Name', category: 'Vendor' },
];

export function getFieldsForTemplate(loanType: LoanType): FieldDefinition[] {
  switch (loanType) {
    case 'consumer':
      return CONSUMER_FIELDS;
    case 'commercial':
      return COMMERCIAL_FIELDS;
    case 'boat':
      return WATERCRAFT_FIELDS;
    default:
      return CONSUMER_FIELDS;
  }
}

export const TEMPLATE_PATHS: Record<LoanType, string> = {
  commercial: '/templates/Commercial_Vendor_Tax_Invoice.pdf',
  consumer: '/templates/Consumer_Vendor_Tax_Invoice.pdf',
  boat: '/templates/Watercraft_Vendor_Tax_Invoice.pdf',
};

// PDF dimensions (A4 at 72 DPI)
export const PDF_WIDTH = 595;
export const PDF_HEIGHT = 842;
