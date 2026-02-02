import { supabase } from '@/integrations/supabase/client';

export type ExtractionType = 'asset_details' | 'hull_details' | 'motor_details' | 'trailer_details' | 'bank_account' | 'payout_letter_bank' | 'payout_letter_bpay';

const SUPPORTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export function isValidFileType(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type) || file.type.startsWith('image/');
}

export function getAcceptString(): string {
  return '.pdf,image/*';
}

export async function parseDocument(file: File, extractionType: ExtractionType) {
  // Convert file to base64
  const base64 = await fileToBase64(file);
  const mimeType = file.type || 'application/octet-stream';
  
  const { data, error } = await supabase.functions.invoke('parse-pdf', {
    body: { 
      fileBase64: base64,
      mimeType,
      extractionType 
    },
  });

  if (error) {
    console.error('Error parsing document:', error);
    throw new Error(error.message || 'Failed to parse document');
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to extract data from document');
  }

  return data.data;
}

// Legacy function name for backwards compatibility
export const parsePdf = parseDocument;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
