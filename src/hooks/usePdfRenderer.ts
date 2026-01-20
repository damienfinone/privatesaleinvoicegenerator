import { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { LoanType } from '@/components/private-sale/LoanTypeSelector';
import { TEMPLATE_PATHS, PDF_WIDTH, PDF_HEIGHT } from '@/lib/coordinateConfig';

export function usePdfRenderer(loanType: LoanType) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderPdf = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const templatePath = TEMPLATE_PATHS[loanType];
      const response = await fetch(templatePath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPages()[0];
      
      // Get actual page dimensions
      const { width, height } = page.getSize();
      console.log(`PDF dimensions for ${loanType}: ${width} x ${height}`);
      
      // Convert PDF to blob URL for display
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfDataUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render PDF');
      console.error('PDF render error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loanType]);

  useEffect(() => {
    renderPdf();
    
    return () => {
      if (pdfDataUrl) {
        URL.revokeObjectURL(pdfDataUrl);
      }
    };
  }, [loanType]);

  return { pdfDataUrl, isLoading, error, renderPdf };
}
