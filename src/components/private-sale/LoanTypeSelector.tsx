import { Briefcase, User, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoanType = 'commercial' | 'consumer' | 'boat';

interface LoanTypeSelectorProps {
  value: LoanType | null;
  onChange: (value: LoanType) => void;
}

const loanTypeOptions: { value: LoanType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'consumer',
    label: 'Consumer',
    description: 'Personal vehicle financing',
    icon: <User className="h-8 w-8" />,
  },
  {
    value: 'commercial',
    label: 'Commercial',
    description: 'Business & commercial vehicles',
    icon: <Briefcase className="h-8 w-8" />,
  },
  {
    value: 'boat',
    label: 'Watercraft',
    description: 'Boat & watercraft financing',
    icon: <Ship className="h-8 w-8" />,
  },
];

export function LoanTypeSelector({ value, onChange }: LoanTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {loanTypeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all",
            "hover:border-primary hover:bg-primary/5",
            value === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted-foreground/25 text-muted-foreground"
          )}
        >
          <div className={cn(
            "mb-3",
            value === option.value ? "text-primary" : "text-muted-foreground"
          )}>
            {option.icon}
          </div>
          <span className="font-semibold text-lg">{option.label}</span>
          <span className="text-xs text-center mt-1 opacity-75">{option.description}</span>
        </button>
      ))}
    </div>
  );
}
