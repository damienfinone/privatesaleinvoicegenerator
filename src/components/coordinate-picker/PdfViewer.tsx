import { useRef, useState, useCallback, useEffect } from 'react';
import { Coordinate } from '@/lib/coordinateConfig';
import { PDF_WIDTH, PDF_HEIGHT } from '@/lib/coordinateConfig';
import { cn } from '@/lib/utils';

interface PdfViewerProps {
  pdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
  coordinates: Record<string, Coordinate>;
  selectedField: string | null;
  onCoordinateClick: (x: number, y: number, pdfY: number) => void;
  onMouseMove: (x: number | null, y: number | null, pdfY: number | null, scale: number) => void;
}

export function PdfViewer({
  pdfUrl,
  isLoading,
  error,
  coordinates,
  selectedField,
  onCoordinateClick,
  onMouseMove,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate scale based on container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
        
        // Calculate scale to fit PDF in container with some padding
        const padding = 40;
        const availableWidth = rect.width - padding;
        const availableHeight = rect.height - padding;
        
        const scaleX = availableWidth / PDF_WIDTH;
        const scaleY = availableHeight / PDF_HEIGHT;
        
        setScale(Math.min(scaleX, scaleY, 1.5)); // Max scale of 1.5
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pdfDisplayWidth = PDF_WIDTH * scale;
    const pdfDisplayHeight = PDF_HEIGHT * scale;
    
    // Calculate offset to center the PDF
    const offsetX = (rect.width - pdfDisplayWidth) / 2;
    const offsetY = (rect.height - pdfDisplayHeight) / 2;
    
    // Get mouse position relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is within PDF bounds
    if (
      mouseX >= offsetX && 
      mouseX <= offsetX + pdfDisplayWidth &&
      mouseY >= offsetY && 
      mouseY <= offsetY + pdfDisplayHeight
    ) {
      // Convert to PDF coordinates
      const pdfX = (mouseX - offsetX) / scale;
      const pdfYFromTop = (mouseY - offsetY) / scale;
      const pdfY = PDF_HEIGHT - pdfYFromTop; // Convert to PDF coordinate system (origin at bottom-left)
      
      onMouseMove(pdfX, pdfYFromTop, pdfY, scale);
    } else {
      onMouseMove(null, null, null, scale);
    }
  }, [scale, onMouseMove]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !selectedField) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pdfDisplayWidth = PDF_WIDTH * scale;
    const pdfDisplayHeight = PDF_HEIGHT * scale;
    
    const offsetX = (rect.width - pdfDisplayWidth) / 2;
    const offsetY = (rect.height - pdfDisplayHeight) / 2;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (
      mouseX >= offsetX && 
      mouseX <= offsetX + pdfDisplayWidth &&
      mouseY >= offsetY && 
      mouseY <= offsetY + pdfDisplayHeight
    ) {
      const pdfX = (mouseX - offsetX) / scale;
      const pdfYFromTop = (mouseY - offsetY) / scale;
      const pdfY = PDF_HEIGHT - pdfYFromTop;
      
      onCoordinateClick(pdfX, pdfYFromTop, pdfY);
    }
  }, [scale, selectedField, onCoordinateClick]);

  const handleMouseLeave = useCallback(() => {
    onMouseMove(null, null, null, scale);
  }, [scale, onMouseMove]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PDF template...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-destructive">
          <p>Error loading PDF: {error}</p>
        </div>
      </div>
    );
  }

  const pdfDisplayWidth = PDF_WIDTH * scale;
  const pdfDisplayHeight = PDF_HEIGHT * scale;
  const offsetX = (containerSize.width - pdfDisplayWidth) / 2;
  const offsetY = (containerSize.height - pdfDisplayHeight) / 2;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-muted/30",
        selectedField ? "cursor-crosshair" : "cursor-default"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {pdfUrl && (
        <>
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="absolute border-0 shadow-lg rounded-md pointer-events-none"
            style={{
              width: pdfDisplayWidth,
              height: pdfDisplayHeight,
              left: offsetX,
              top: offsetY,
            }}
            title="PDF Template"
          />
          
          {/* Coordinate markers overlay */}
          <div 
            className="absolute pointer-events-none"
            style={{
              width: pdfDisplayWidth,
              height: pdfDisplayHeight,
              left: offsetX,
              top: offsetY,
            }}
          >
            {Object.entries(coordinates).map(([fieldId, coord]) => {
              // Convert PDF Y to display Y
              const displayX = coord.x * scale;
              const displayY = (PDF_HEIGHT - coord.y) * scale;
              
              return (
                <div
                  key={fieldId}
                  className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-primary border-2 border-primary-foreground shadow-md"
                  style={{
                    left: displayX,
                    top: displayY,
                  }}
                  title={fieldId}
                />
              );
            })}
          </div>
        </>
      )}
      
      {/* Selection hint */}
      {selectedField && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg">
          Click on PDF to place: <strong>{selectedField}</strong>
        </div>
      )}
    </div>
  );
}
