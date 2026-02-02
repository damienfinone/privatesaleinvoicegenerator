import { supabase } from '@/integrations/supabase/client';

export type ExtractionType = 'asset_details' | 'hull_details' | 'motor_details' | 'trailer_details' | 'bank_account' | 'payout_letter_bank' | 'payout_letter_bpay';

export async function parsePdf(file: File, extractionType: ExtractionType) {
  // Convert file to base64
  const base64 = await fileToBase64(file);
  
  const { data, error } = await supabase.functions.invoke('parse-pdf', {
    body: { 
      pdfBase64: base64,
      extractionType 
    },
  });

  if (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(error.message || 'Failed to parse PDF');
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to extract data from PDF');
  }

  return data.data;
}

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
