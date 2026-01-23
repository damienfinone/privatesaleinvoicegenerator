export interface BuyerDetails {
  name: string;
  address: string;
  contactNumber: string;
}

export interface HullDetails {
  make: string;
  model: string;
  series: string;
  registration: string;
  registrationExpiry: string;
  buildDate: string;
  identificationType: string;
  hin: string;
  colour: string;
  // Vehicle-specific fields (used for Commercial/Consumer)
  fuelType: string;
  bodyType: string;
  odometer: string;
  transmission: string;
}

export interface TrailerDetails {
  make: string;
  model: string;
  registration: string;
  registrationExpiry: string;
  buildDate: string;
  vin: string;
}

export interface MotorDetails {
  make: string;
  model: string;
  series: string;
  engineSize: string;
  buildDate: string;
  engineNumber: string;
}

export interface AssetDetails {
  hull: HullDetails;
  trailer: TrailerDetails;
  motor: MotorDetails;
}

export interface InvoiceDetails {
  purchasePrice: string;
  depositAmount: string;
  balanceToBeFinanced: string;
}

export interface BankAccountDetails {
  accountName: string;
  bsbNumber: string;
  accountNumber: string;
  bank: string;
}

export interface PayoutBankDetails {
  accountName: string;
  bsbNumber: string;
  accountNumber: string;
  bank: string;
  amount: string;
}

export interface BpayDetails {
  accountName: string;
  billerCode: string;
  referenceNumber: string;
  bank: string;
  amount: string;
}

export interface DisbursementOptions {
  bankAccount: BankAccountDetails;
  payoutBank: PayoutBankDetails;
  bpay: BpayDetails;
}

export interface VendorDetails {
  name: string;
  signature: string;
  dateSigned: string;
}

export interface PrivateSaleFormData {
  buyer: BuyerDetails;
  asset: AssetDetails;
  invoice: InvoiceDetails;
  disbursement: DisbursementOptions;
  vendor: VendorDetails;
}

export const initialFormData: PrivateSaleFormData = {
  buyer: {
    name: '',
    address: '',
    contactNumber: '',
  },
  asset: {
    hull: {
      make: '',
      model: '',
      series: '',
      registration: '',
      registrationExpiry: '',
      buildDate: '',
      identificationType: '',
      hin: '',
      colour: '',
      fuelType: '',
      bodyType: '',
      odometer: '',
      transmission: '',
    },
    trailer: {
      make: '',
      model: '',
      registration: '',
      registrationExpiry: '',
      buildDate: '',
      vin: '',
    },
    motor: {
      make: '',
      model: '',
      series: '',
      engineSize: '',
      buildDate: '',
      engineNumber: '',
    },
  },
  invoice: {
    purchasePrice: '',
    depositAmount: '',
    balanceToBeFinanced: '',
  },
  disbursement: {
    bankAccount: {
      accountName: '',
      bsbNumber: '',
      accountNumber: '',
      bank: '',
    },
    payoutBank: {
      accountName: '',
      bsbNumber: '',
      accountNumber: '',
      bank: '',
      amount: '',
    },
    bpay: {
      accountName: '',
      billerCode: '',
      referenceNumber: '',
      bank: '',
      amount: '',
    },
  },
  vendor: {
    name: '',
    signature: '',
    dateSigned: '',
  },
};
