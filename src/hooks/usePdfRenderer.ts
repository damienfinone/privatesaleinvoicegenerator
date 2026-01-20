import { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { LoanType } from '@/components/private-sale/LoanTypeSelector';
import { TEMPLATE_PATHS, PDF_HEIGHT } from '@/lib/coordinateConfig';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

export function usePdfRenderer(loanType: LoanType) {
  const [pdfImageUrl, setPdfImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 595, height: 842 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      
      // Load the PDF using pdf.js
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      // Get the viewport at scale 2 for better quality
      const scale = 2;
      const viewport = page.getViewport({ scale });
      
      // Create a canvas to render the PDF
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render the PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      // Convert canvas to image URL
      const imageUrl = canvas.toDataURL('image/png');
      setPdfImageUrl(imageUrl);
      
      // Store actual PDF dimensions (at scale 1)
      setDimensions({
        width: viewport.width / scale,
        height: viewport.height / scale,
      });
      
      console.log(`PDF rendered for ${loanType}: ${viewport.width / scale} x ${viewport.height / scale}`);
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
      if (pdfImageUrl && pdfImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfImageUrl);
      }
    };
  }, [loanType]);

  return { pdfImageUrl, isLoading, error, dimensions, renderPdf };
}
