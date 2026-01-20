import { useState, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { LoanType } from '@/components/private-sale/LoanTypeSelector';
import { TEMPLATE_PATHS } from '@/lib/coordinateConfig';

// Set the worker source for pdfjs-dist v3
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface Dimensions {
  width: number;
  height: number;
}

export function usePdfRenderer(loanType: LoanType) {
  const [pdfImageUrl, setPdfImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 595, height: 842 });

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
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
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
      const pdfWidth = viewport.width / scale;
      const pdfHeight = viewport.height / scale;
      setDimensions({ width: pdfWidth, height: pdfHeight });
      
      console.log(`PDF rendered for ${loanType}: ${pdfWidth} x ${pdfHeight}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render PDF');
      console.error('PDF render error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loanType]);

  useEffect(() => {
    renderPdf();
  }, [renderPdf]);

  return { pdfImageUrl, isLoading, error, dimensions, renderPdf };
}
