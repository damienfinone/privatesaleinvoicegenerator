import { Card, CardContent } from '@/components/ui/card';
import { Crosshair, MousePointer2 } from 'lucide-react';

interface CoordinateDisplayProps {
  mouseX: number | null;
  mouseY: number | null;
  pdfY: number | null;
  scale: number;
}

export function CoordinateDisplay({ mouseX, mouseY, pdfY, scale }: CoordinateDisplayProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crosshair className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Live Coordinates</span>
        </div>
        
        {mouseX !== null && mouseY !== null && pdfY !== null ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">X:</span>
                <span className="ml-2 font-mono font-bold text-primary">
                  {mouseX.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Y (PDF):</span>
                <span className="ml-2 font-mono font-bold text-primary">
                  {pdfY.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Scale: {(scale * 100).toFixed(0)}% | Y from top: {mouseY.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointer2 className="h-4 w-4" />
            <span>Hover over the PDF to see coordinates</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
