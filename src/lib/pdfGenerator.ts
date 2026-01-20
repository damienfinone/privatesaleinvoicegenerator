import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PrivateSaleFormData } from '@/types/privateSaleForm';
import { LoanType } from '@/components/private-sale/LoanTypeSelector';

const TEMPLATE_PATHS: Record<LoanType, string> = {
  commercial: '/templates/Commercial_Vendor_Tax_Invoice.pdf',
  consumer: '/templates/Consumer_Vendor_Tax_Invoice.pdf',
  boat: '/templates/Watercraft_Vendor_Tax_Invoice.pdf',
};

function formatCurrency(value: string): string {
  if (!value) return '';
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return value;
  return `$${num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Consumer Template - Exact coordinates from user measurements
// Y coordinates converted: PDF_Y = 842 - Y_from_top
const CONSUMER_COORDINATES = {
  // Buyer's Details
  buyerName: { x: 165.08, y: 677.73 },      // Y from top: 164.27
  buyerAddress: { x: 164.24, y: 651.45 },   // Y from top: 190.55
  buyerContact: { x: 165.22, y: 625.29 },   // Y from top: 216.71
  
  // Asset Details - Left column
  make: { x: 165.08, y: 578.22 },           // Y from top: 263.78
  series: { x: 165.07, y: 560.70 },         // Y from top: 281.30
  buildDate: { x: 165.07, y: 543.18 },      // Y from top: 298.82
  registration: { x: 165.06, y: 525.78 },   // Y from top: 316.22
  vin: { x: 165.06, y: 508.26 },            // Y from top: 333.74
  engineNumber: { x: 165.07, y: 490.86 },   // Y from top: 351.14
  odometer: { x: 165.07, y: 473.34 },       // Y from top: 368.66
  
  // Asset Details - Right column
  model: { x: 403.45, y: 578.22 },          // Y from top: 263.78
  colour: { x: 403.44, y: 560.70 },         // Y from top: 281.30
  fuelType: { x: 403.35, y: 543.18 },       // Y from top: 298.82
  registrationExpiry: { x: 403.35, y: 525.78 }, // Y from top: 316.22
  bodyType: { x: 403.35, y: 490.86 },       // Y from top: 351.14
  transmission: { x: 403.36, y: 473.34 },   // Y from top: 368.66
  
  // Invoice Price section
  purchasePrice: { x: 165.07, y: 420.50 },  // Y from top: 421.50
  depositAmount: { x: 403.35, y: 420.50 },  // Y from top: 421.50
  balanceFinanced: { x: 403.35, y: 403.10 }, // Y from top: 438.90
  
  // Bank Account Details
  bankAccountName: { x: 165.08, y: 362.06 }, // Y from top: 479.94
  bankBsb: { x: 165.08, y: 344.68 },        // Y from top: 497.32
  bankAccountNumber: { x: 403.35, y: 344.68 }, // Y from top: 497.32
  bankBank: { x: 165.19, y: 327.28 },       // Y from top: 514.72
  bankAmount: { x: 403.33, y: 327.28 },     // Y from top: 514.72
  
  // Payout Letter - Bank
  payoutAccountName: { x: 165.08, y: 283.69 }, // Y from top: 558.31
  payoutBsb: { x: 165.08, y: 266.17 },      // Y from top: 575.83
  payoutAccountNumber: { x: 403.35, y: 266.17 }, // Y from top: 575.83
  payoutBank: { x: 165.19, y: 248.53 },     // Y from top: 593.47
  payoutAmount: { x: 403.33, y: 248.53 },   // Y from top: 593.47
  
  // Payout Letter - BPAY
  bpayAccountName: { x: 165.08, y: 205.09 }, // Y from top: 636.91
  bpayBillerCode: { x: 165.07, y: 187.69 }, // Y from top: 654.31
  bpayReference: { x: 403.32, y: 187.69 },  // Y from top: 654.31
  bpayBank: { x: 165.19, y: 170.17 },       // Y from top: 671.83
  bpayAmount: { x: 403.33, y: 170.17 },     // Y from top: 671.83
};

// Commercial Template - Corrected Y coordinates
const COMMERCIAL_COORDINATES = {
  // Buyer's Details
  buyerName: { x: 145, y: 641 },       // Was 666
  buyerAddress: { x: 145, y: 619 },    // Was 644
  buyerContact: { x: 175, y: 598 },    // Was 623
  
  // Asset Details table
  // Left column
  make: { x: 80, y: 555 },             // Was 580
  series: { x: 80, y: 535 },           // Was 560
  buildDate: { x: 100, y: 515 },       // Was 540
  registration: { x: 110, y: 495 },    // Was 520
  vin: { x: 155, y: 475 },             // Was 500
  engineNumber: { x: 120, y: 455 },    // Was 480
  odometer: { x: 135, y: 435 },        // Was 460
  
  // Right column  
  model: { x: 355, y: 555 },           // Was 580
  colour: { x: 355, y: 535 },          // Was 560
  fuelType: { x: 355, y: 515 },        // Was 540
  registrationExpiry: { x: 400, y: 495 }, // Was 520
  bodyType: { x: 355, y: 475 },        // Was 500
  transmission: { x: 385, y: 435 },    // Was 460
  
  // Invoice Price
  purchasePrice: { x: 130, y: 388 },   // Was 413
  depositAmount: { x: 400, y: 388 },   // Was 413
  balanceFinanced: { x: 385, y: 368 }, // Was 393
  
  // Bank Account Details
  bankAccountName: { x: 115, y: 321 }, // Was 346
  bankBsb: { x: 105, y: 304 },         // Was 329
  bankAccountNumber: { x: 125, y: 287 }, // Was 312
  bankBank: { x: 75, y: 270 },         // Was 295
  bankAmount: { x: 90, y: 253 },       // Was 278
  
  // Payout Letter - Bank
  payoutAccountName: { x: 115, y: 217 }, // Was 242
  payoutBsb: { x: 105, y: 200 },       // Was 225
  payoutAccountNumber: { x: 125, y: 183 }, // Was 208
  payoutBank: { x: 75, y: 166 },       // Was 191
  payoutAmount: { x: 90, y: 149 },     // Was 174
  
  // Payout Letter - BPAY
  bpayAccountName: { x: 115, y: 113 }, // Was 138
  bpayBillerCode: { x: 100, y: 96 },   // Was 121
  bpayReference: { x: 130, y: 79 },    // Was 104
  bpayBank: { x: 75, y: 62 },          // Was 87
  bpayAmount: { x: 90, y: 45 },        // Was 70
};

// Watercraft Template - Corrected Y coordinates
const WATERCRAFT_COORDINATES = {
  // Buyer's Details
  buyerName: { x: 145, y: 688 },       // Was 713
  buyerAddress: { x: 145, y: 668 },    // Was 693
  buyerContact: { x: 175, y: 648 },    // Was 673
  
  // Asset Details - Hull (left side)
  hullMake: { x: 80, y: 603 },         // Was 628
  hullModel: { x: 80, y: 583 },        // Was 608
  hullSeries: { x: 80, y: 563 },       // Was 588
  hullRegistration: { x: 100, y: 543 }, // Was 568
  hullRegExpiry: { x: 135, y: 523 },   // Was 548
  hullBuildDate: { x: 100, y: 503 },   // Was 528
  hullHin: { x: 200, y: 483 },         // Was 508
  hullColour: { x: 80, y: 463 },       // Was 488
  
  // Asset Details - Trailer (right side)
  trailerMake: { x: 370, y: 603 },     // Was 628
  trailerModel: { x: 370, y: 583 },    // Was 608
  trailerSeries: { x: 370, y: 563 },   // Was 588
  trailerRegistration: { x: 390, y: 543 }, // Was 568
  trailerRegExpiry: { x: 425, y: 523 }, // Was 548
  trailerBuildDate: { x: 390, y: 503 }, // Was 528
  trailerVin: { x: 490, y: 483 },      // Was 508
  
  // Asset Details - Motor
  motorMake: { x: 80, y: 422 },        // Was 447
  motorModel: { x: 80, y: 402 },       // Was 427
  motorSeries: { x: 80, y: 382 },      // Was 407
  motorEngineSize: { x: 105, y: 362 }, // Was 387
  motorBuildDate: { x: 100, y: 342 },  // Was 367
  motorEngineNumber: { x: 120, y: 322 }, // Was 347
  
  // Invoice Price
  purchasePrice: { x: 400, y: 422 },   // Was 447
  depositAmount: { x: 400, y: 402 },   // Was 427
  balanceFinanced: { x: 420, y: 382 }, // Was 407
  
  // Bank Account Details
  bankAccountName: { x: 115, y: 285 }, // Was 310
  bankBsb: { x: 105, y: 268 },         // Was 293
  bankAccountNumber: { x: 125, y: 251 }, // Was 276
  bankBank: { x: 75, y: 234 },         // Was 259
  bankAmount: { x: 90, y: 217 },       // Was 242
  
  // Payout Letter - Bank
  payoutAccountName: { x: 115, y: 183 }, // Was 208
  payoutBsb: { x: 105, y: 166 },       // Was 191
  payoutAccountNumber: { x: 125, y: 149 }, // Was 174
  payoutBank: { x: 75, y: 132 },       // Was 157
  payoutAmount: { x: 90, y: 115 },     // Was 140
  
  // Payout Letter - BPAY
  bpayAccountName: { x: 115, y: 81 },  // Was 106
  bpayBillerCode: { x: 100, y: 64 },   // Was 89
  bpayReference: { x: 130, y: 47 },    // Was 72
  bpayBank: { x: 75, y: 30 },          // Was 55
  bpayAmount: { x: 90, y: 13 },        // Was 38
  
  // Vendor's Name
  vendorName: { x: 120, y: 81 },       // Was 106
};

async function fillConsumerPdf(pdfDoc: PDFDocument, formData: PrivateSaleFormData): Promise<void> {
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  const color = rgb(0, 0, 0);
  
  const coords = CONSUMER_COORDINATES;
  
  const drawText = (text: string, coord: { x: number; y: number }, size: number = fontSize) => {
    if (text) {
      page.drawText(text, { x: coord.x, y: coord.y, size, font, color });
    }
  };
  
  // Buyer's Details
  drawText(formData.buyer.name, coords.buyerName);
  drawText(formData.buyer.address, coords.buyerAddress);
  drawText(formData.buyer.contactNumber, coords.buyerContact);
  
  // Asset Details
  drawText(formData.asset.hull.make, coords.make);
  drawText(formData.asset.hull.model, coords.model);
  drawText(formData.asset.hull.series, coords.series);
  drawText(formData.asset.hull.colour, coords.colour);
  drawText(formData.asset.hull.buildDate, coords.buildDate);
  drawText(formData.asset.hull.fuelType, coords.fuelType);
  drawText(formData.asset.hull.registration, coords.registration);
  drawText(formData.asset.hull.registrationExpiry, coords.registrationExpiry);
  drawText(formData.asset.hull.hin, coords.vin);
  drawText(formData.asset.hull.bodyType, coords.bodyType);
  drawText(formData.asset.motor.engineNumber, coords.engineNumber);
  drawText(formData.asset.hull.transmission, coords.transmission);
  drawText(formData.asset.hull.odometer, coords.odometer);
  
  // Invoice Price
  drawText(formatCurrency(formData.invoice.purchasePrice), coords.purchasePrice);
  drawText(formatCurrency(formData.invoice.depositAmount), coords.depositAmount);
  drawText(formatCurrency(formData.invoice.balanceToBeFinanced), coords.balanceFinanced);
  
  // Bank Account Details
  drawText(formData.disbursement.bankAccount.accountName, coords.bankAccountName);
  drawText(formData.disbursement.bankAccount.bsbNumber, coords.bankBsb);
  drawText(formData.disbursement.bankAccount.accountNumber, coords.bankAccountNumber);
  drawText(formData.disbursement.bankAccount.bank, coords.bankBank);
  drawText(formatCurrency(formData.disbursement.bankAccount.amount), coords.bankAmount);
  
  // Payout Letter - Bank
  drawText(formData.disbursement.payoutBank.accountName, coords.payoutAccountName);
  drawText(formData.disbursement.payoutBank.bsbNumber, coords.payoutBsb);
  drawText(formData.disbursement.payoutBank.accountNumber, coords.payoutAccountNumber);
  drawText(formData.disbursement.payoutBank.bank, coords.payoutBank);
  drawText(formatCurrency(formData.disbursement.payoutBank.amount), coords.payoutAmount);
  
  // BPAY
  drawText(formData.disbursement.bpay.accountName, coords.bpayAccountName);
  drawText(formData.disbursement.bpay.billerCode, coords.bpayBillerCode);
  drawText(formData.disbursement.bpay.referenceNumber, coords.bpayReference);
  drawText(formData.disbursement.bpay.bank, coords.bpayBank);
  drawText(formatCurrency(formData.disbursement.bpay.amount), coords.bpayAmount);
}

async function fillCommercialPdf(pdfDoc: PDFDocument, formData: PrivateSaleFormData): Promise<void> {
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 9;
  const color = rgb(0, 0, 0);
  
  const coords = COMMERCIAL_COORDINATES;
  
  const drawText = (text: string, coord: { x: number; y: number }, size: number = fontSize) => {
    if (text) {
      page.drawText(text, { x: coord.x, y: coord.y, size, font, color });
    }
  };
  
  // Buyer's Details
  drawText(formData.buyer.name, coords.buyerName);
  drawText(formData.buyer.address, coords.buyerAddress);
  drawText(formData.buyer.contactNumber, coords.buyerContact);
  
  // Asset Details
  drawText(formData.asset.hull.make, coords.make);
  drawText(formData.asset.hull.model, coords.model);
  drawText(formData.asset.hull.series, coords.series);
  drawText(formData.asset.hull.colour, coords.colour);
  drawText(formData.asset.hull.buildDate, coords.buildDate);
  drawText(formData.asset.hull.fuelType, coords.fuelType);
  drawText(formData.asset.hull.registration, coords.registration);
  drawText(formData.asset.hull.registrationExpiry, coords.registrationExpiry);
  drawText(formData.asset.hull.hin, coords.vin);
  drawText(formData.asset.motor.engineNumber, coords.engineNumber);
  drawText(formData.asset.hull.bodyType, coords.bodyType);
  drawText(formData.asset.hull.odometer, coords.odometer);
  drawText(formData.asset.hull.transmission, coords.transmission);
  
  // Invoice Price
  drawText(formatCurrency(formData.invoice.purchasePrice), coords.purchasePrice);
  drawText(formatCurrency(formData.invoice.depositAmount), coords.depositAmount);
  drawText(formatCurrency(formData.invoice.balanceToBeFinanced), coords.balanceFinanced);
  
  // Bank Account Details
  drawText(formData.disbursement.bankAccount.accountName, coords.bankAccountName);
  drawText(formData.disbursement.bankAccount.bsbNumber, coords.bankBsb);
  drawText(formData.disbursement.bankAccount.accountNumber, coords.bankAccountNumber);
  drawText(formData.disbursement.bankAccount.bank, coords.bankBank);
  drawText(formatCurrency(formData.disbursement.bankAccount.amount), coords.bankAmount);
  
  // Payout Letter - Bank
  drawText(formData.disbursement.payoutBank.accountName, coords.payoutAccountName);
  drawText(formData.disbursement.payoutBank.bsbNumber, coords.payoutBsb);
  drawText(formData.disbursement.payoutBank.accountNumber, coords.payoutAccountNumber);
  drawText(formData.disbursement.payoutBank.bank, coords.payoutBank);
  drawText(formatCurrency(formData.disbursement.payoutBank.amount), coords.payoutAmount);
  
  // BPAY
  drawText(formData.disbursement.bpay.accountName, coords.bpayAccountName);
  drawText(formData.disbursement.bpay.billerCode, coords.bpayBillerCode);
  drawText(formData.disbursement.bpay.referenceNumber, coords.bpayReference);
  drawText(formData.disbursement.bpay.bank, coords.bpayBank);
  drawText(formatCurrency(formData.disbursement.bpay.amount), coords.bpayAmount);
}

async function fillWatercraftPdf(pdfDoc: PDFDocument, formData: PrivateSaleFormData): Promise<void> {
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 9;
  const color = rgb(0, 0, 0);
  
  const coords = WATERCRAFT_COORDINATES;
  
  const drawText = (text: string, coord: { x: number; y: number }, size: number = fontSize) => {
    if (text) {
      page.drawText(text, { x: coord.x, y: coord.y, size, font, color });
    }
  };
  
  // Buyer's Details
  drawText(formData.buyer.name, coords.buyerName);
  drawText(formData.buyer.address, coords.buyerAddress);
  drawText(formData.buyer.contactNumber, coords.buyerContact);
  
  // Hull Details
  drawText(formData.asset.hull.make, coords.hullMake);
  drawText(formData.asset.hull.model, coords.hullModel);
  drawText(formData.asset.hull.series, coords.hullSeries);
  drawText(formData.asset.hull.registration, coords.hullRegistration);
  drawText(formData.asset.hull.registrationExpiry, coords.hullRegExpiry);
  drawText(formData.asset.hull.buildDate, coords.hullBuildDate);
  drawText(formData.asset.hull.hin, coords.hullHin);
  drawText(formData.asset.hull.colour, coords.hullColour);
  
  // Trailer Details
  drawText(formData.asset.trailer.make, coords.trailerMake);
  drawText(formData.asset.trailer.model, coords.trailerModel);
  drawText(formData.asset.trailer.series, coords.trailerSeries);
  drawText(formData.asset.trailer.registration, coords.trailerRegistration);
  drawText(formData.asset.trailer.registrationExpiry, coords.trailerRegExpiry);
  drawText(formData.asset.trailer.buildDate, coords.trailerBuildDate);
  
  // Motor Details
  drawText(formData.asset.motor.make, coords.motorMake);
  drawText(formData.asset.motor.model, coords.motorModel);
  drawText(formData.asset.motor.series, coords.motorSeries);
  drawText(formData.asset.motor.engineSize, coords.motorEngineSize);
  drawText(formData.asset.motor.buildDate, coords.motorBuildDate);
  drawText(formData.asset.motor.engineNumber, coords.motorEngineNumber);
  
  // Invoice Price
  drawText(formatCurrency(formData.invoice.purchasePrice), coords.purchasePrice);
  drawText(formatCurrency(formData.invoice.depositAmount), coords.depositAmount);
  drawText(formatCurrency(formData.invoice.balanceToBeFinanced), coords.balanceFinanced);
  
  // Bank Account Details
  drawText(formData.disbursement.bankAccount.accountName, coords.bankAccountName);
  drawText(formData.disbursement.bankAccount.bsbNumber, coords.bankBsb);
  drawText(formData.disbursement.bankAccount.accountNumber, coords.bankAccountNumber);
  drawText(formData.disbursement.bankAccount.bank, coords.bankBank);
  drawText(formatCurrency(formData.disbursement.bankAccount.amount), coords.bankAmount);
  
  // Payout Letter - Bank
  drawText(formData.disbursement.payoutBank.accountName, coords.payoutAccountName);
  drawText(formData.disbursement.payoutBank.bsbNumber, coords.payoutBsb);
  drawText(formData.disbursement.payoutBank.accountNumber, coords.payoutAccountNumber);
  drawText(formData.disbursement.payoutBank.bank, coords.payoutBank);
  drawText(formatCurrency(formData.disbursement.payoutBank.amount), coords.payoutAmount);
  
  // BPAY
  drawText(formData.disbursement.bpay.accountName, coords.bpayAccountName);
  drawText(formData.disbursement.bpay.billerCode, coords.bpayBillerCode);
  drawText(formData.disbursement.bpay.referenceNumber, coords.bpayReference);
  drawText(formData.disbursement.bpay.bank, coords.bpayBank);
  drawText(formatCurrency(formData.disbursement.bpay.amount), coords.bpayAmount);
  
  // Vendor's Name
  drawText(formData.vendor.name, coords.vendorName);
}

export async function generatePdf(formData: PrivateSaleFormData, loanType: LoanType): Promise<void> {
  const templatePath = TEMPLATE_PATHS[loanType];
  
  // Fetch the PDF template
  const templateResponse = await fetch(templatePath);
  const templateBytes = await templateResponse.arrayBuffer();
  
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(templateBytes);
  
  // Fill in the form data based on loan type
  if (loanType === 'consumer') {
    await fillConsumerPdf(pdfDoc, formData);
  } else if (loanType === 'commercial') {
    await fillCommercialPdf(pdfDoc, formData);
  } else if (loanType === 'boat') {
    await fillWatercraftPdf(pdfDoc, formData);
  }
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  
  // Create a blob and download
  const uint8Array = new Uint8Array(pdfBytes);
  const blob = new Blob([uint8Array], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  // Generate filename
  const loanTypeLabel = loanType === 'boat' ? 'Watercraft' : loanType === 'commercial' ? 'Commercial' : 'Consumer';
  const buyerName = formData.buyer.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Vendor';
  const date = new Date().toISOString().split('T')[0];
  const filename = `Vendor_Tax_Invoice_${loanTypeLabel}_${buyerName}_${date}.pdf`;
  
  // Trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}