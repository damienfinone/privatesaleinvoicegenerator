import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoanType } from '@/components/private-sale/LoanTypeSelector';
import { usePdfRenderer } from '@/hooks/usePdfRenderer';
import { getFieldsForTemplate, Coordinate } from '@/lib/coordinateConfig';
import { PdfViewer } from '@/components/coordinate-picker/PdfViewer';
import { FieldList } from '@/components/coordinate-picker/FieldList';
import { CoordinateDisplay } from '@/components/coordinate-picker/CoordinateDisplay';
import { ExportPanel } from '@/components/coordinate-picker/ExportPanel';
import { toast } from 'sonner';

export default function CoordinatePicker() {
  const [loanType, setLoanType] = useState<LoanType>('consumer');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Record<LoanType, Record<string, Coordinate>>>({
    consumer: {},
    commercial: {},
    boat: {},
    'commercial-boat': {},
  });
  
  const [mouseCoords, setMouseCoords] = useState<{
    x: number | null;
    y: number | null;
    pdfY: number | null;
    scale: number;
  }>({ x: null, y: null, pdfY: null, scale: 1 });

  const { pdfImageUrl, isLoading, error, dimensions } = usePdfRenderer(loanType);
  const fields = getFieldsForTemplate(loanType);
  const currentCoordinates = coordinates[loanType];

  const handleLoanTypeChange = (value: LoanType) => {
    setLoanType(value);
    setSelectedField(null);
  };

  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(selectedField === fieldId ? null : fieldId);
  };

  const handleCoordinateClick = useCallback((x: number, y: number, pdfY: number) => {
    if (!selectedField) return;

    setCoordinates(prev => ({
      ...prev,
      [loanType]: {
        ...prev[loanType],
        [selectedField]: { x, y: pdfY },
      },
    }));

    toast.success(`Set ${selectedField} to (${x.toFixed(2)}, ${pdfY.toFixed(2)})`);
    
    // Auto-advance to next unmapped field
    const currentIndex = fields.findIndex(f => f.id === selectedField);
    const nextUnmapped = fields.slice(currentIndex + 1).find(f => !coordinates[loanType][f.id]);
    
    if (nextUnmapped) {
      setSelectedField(nextUnmapped.id);
    } else {
      setSelectedField(null);
    }
  }, [selectedField, loanType, fields, coordinates]);

  const handleMouseMove = useCallback((x: number | null, y: number | null, pdfY: number | null, scale: number) => {
    setMouseCoords({ x, y, pdfY, scale });
  }, []);

  const handleClearCoordinate = (fieldId: string) => {
    setCoordinates(prev => {
      const newCoords = { ...prev[loanType] };
      delete newCoords[fieldId];
      return { ...prev, [loanType]: newCoords };
    });
  };

  const handleClearAll = () => {
    setCoordinates(prev => ({
      ...prev,
      [loanType]: {},
    }));
    toast.info('All coordinates cleared');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">PDF Coordinate Picker</h1>
          </div>
        </div>
        
        <Select value={loanType} onValueChange={handleLoanTypeChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consumer">Consumer Vehicle</SelectItem>
            <SelectItem value="commercial">Commercial Vehicle</SelectItem>
            <SelectItem value="boat">Consumer Watercraft</SelectItem>
            <SelectItem value="commercial-boat">Commercial Watercraft</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Field List */}
        <aside className="w-72 border-r border-border bg-card flex flex-col">
          <FieldList
            fields={fields}
            coordinates={currentCoordinates}
            selectedField={selectedField}
            onSelectField={handleFieldSelect}
            onClearCoordinate={handleClearCoordinate}
          />
        </aside>

        {/* PDF Viewer */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <PdfViewer
              pdfUrl={pdfImageUrl}
              isLoading={isLoading}
              error={error}
              coordinates={currentCoordinates}
              selectedField={selectedField}
              pdfDimensions={dimensions}
              onCoordinateClick={handleCoordinateClick}
              onMouseMove={handleMouseMove}
            />
          </div>
        </main>

        {/* Right sidebar - Coordinate info & Export */}
        <aside className="w-80 border-l border-border bg-card p-4 flex flex-col gap-4">
          <CoordinateDisplay
            mouseX={mouseCoords.x}
            mouseY={mouseCoords.y}
            pdfY={mouseCoords.pdfY}
            scale={mouseCoords.scale}
          />
          
          <ExportPanel
            coordinates={currentCoordinates}
            loanType={loanType}
            onClearAll={handleClearAll}
          />
        </aside>
      </div>
    </div>
  );
}
