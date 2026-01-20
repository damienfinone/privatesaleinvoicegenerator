import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, MapPin, X } from 'lucide-react';
import { FieldDefinition, Coordinate } from '@/lib/coordinateConfig';
import { cn } from '@/lib/utils';

interface FieldListProps {
  fields: FieldDefinition[];
  coordinates: Record<string, Coordinate>;
  selectedField: string | null;
  onSelectField: (fieldId: string) => void;
  onClearCoordinate: (fieldId: string) => void;
}

export function FieldList({ 
  fields, 
  coordinates, 
  selectedField, 
  onSelectField,
  onClearCoordinate 
}: FieldListProps) {
  // Group fields by category
  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldDefinition[]>);

  const assignedCount = Object.keys(coordinates).length;
  const totalCount = fields.length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold mb-2">Form Fields</h3>
        <div className="flex items-center gap-2">
          <Badge variant={assignedCount === totalCount ? "default" : "secondary"}>
            {assignedCount} / {totalCount} mapped
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click a field, then click on the PDF to set its position
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(groupedFields).map(([category, categoryFields]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="space-y-1">
                {categoryFields.map((field) => {
                  const hasCoord = coordinates[field.id];
                  const isSelected = selectedField === field.id;
                  
                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group",
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : hasCoord 
                            ? "bg-accent/50 hover:bg-accent" 
                            : "hover:bg-muted"
                      )}
                      onClick={() => onSelectField(field.id)}
                    >
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        {hasCoord ? (
                          <Check className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <MapPin className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                        )}
                        <span className="text-sm truncate">{field.label}</span>
                      </div>
                      
                      {hasCoord && (
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "text-xs font-mono",
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            ({hasCoord.x.toFixed(0)}, {hasCoord.y.toFixed(0)})
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity",
                              isSelected && "hover:bg-primary-foreground/20"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearCoordinate(field.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
