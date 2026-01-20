import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Download, Trash2 } from 'lucide-react';
import { Coordinate } from '@/lib/coordinateConfig';
import { LoanType } from '@/components/private-sale/LoanTypeSelector';
import { toast } from 'sonner';

interface ExportPanelProps {
  coordinates: Record<string, Coordinate>;
  loanType: LoanType;
  onClearAll: () => void;
}

export function ExportPanel({ coordinates, loanType, onClearAll }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);

  const getTemplateName = () => {
    switch (loanType) {
      case 'consumer':
        return 'CONSUMER_COORDINATES';
      case 'commercial':
        return 'COMMERCIAL_COORDINATES';
      case 'boat':
        return 'WATERCRAFT_COORDINATES';
    }
  };

  const generateCode = () => {
    const entries = Object.entries(coordinates);
    if (entries.length === 0) {
      return '// No coordinates mapped yet';
    }

    const lines = entries.map(([fieldId, coord]) => {
      return `  ${fieldId}: { x: ${coord.x.toFixed(2)}, y: ${coord.y.toFixed(2)} },`;
    });

    return `const ${getTemplateName()} = {\n${lines.join('\n')}\n};`;
  };

  const code = generateCode();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${loanType}_coordinates.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Export Coordinates</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              disabled={Object.keys(coordinates).length === 0}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleDownload}
              disabled={Object.keys(coordinates).length === 0}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onClearAll}
              disabled={Object.keys(coordinates).length === 0}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={code}
          readOnly
          className="font-mono text-xs h-40 resize-none"
        />
      </CardContent>
    </Card>
  );
}
