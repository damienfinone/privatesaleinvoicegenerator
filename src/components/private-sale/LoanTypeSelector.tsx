import { Car, Ship, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import consumerLogo from '@/assets/financeone-consumer-logo.svg';
import commercialLogo from '@/assets/financeone-commercial-logo.svg';

export type LoanType = 'commercial' | 'consumer' | 'boat';
export type Division = 'consumer' | 'commercial';

interface LoanTypeSelectorProps {
  value: LoanType | null;
  onChange: (value: LoanType) => void;
  division: Division | null;
  onDivisionChange: (division: Division | null) => void;
  onBackToDivision: () => void;
}

const divisionOptions: { value: Division; logo: string; alt: string }[] = [
  {
    value: 'consumer',
    logo: consumerLogo,
    alt: 'Finance One Consumer',
  },
  {
    value: 'commercial',
    logo: commercialLogo,
    alt: 'Finance One Commercial',
  },
];

const consumerSubOptions: { value: LoanType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'consumer',
    label: 'Vehicle',
    description: 'Car, motorcycle & personal vehicles',
    icon: <Car className="h-8 w-8" />,
  },
  {
    value: 'boat',
    label: 'Watercraft',
    description: 'Boat & watercraft financing',
    icon: <Ship className="h-8 w-8" />,
  },
];

export function LoanTypeSelector({ 
  value, 
  onChange, 
  division, 
  onDivisionChange,
  onBackToDivision 
}: LoanTypeSelectorProps) {
  
  const handleDivisionSelect = (selectedDivision: Division) => {
    if (selectedDivision === 'commercial') {
      // Commercial only has vehicle, so select it directly
      onDivisionChange('commercial');
      onChange('commercial');
    } else {
      // For consumer, show sub-options
      onDivisionChange('consumer');
    }
  };

  const handleSubOptionSelect = (loanType: LoanType) => {
    onChange(loanType);
  };

  // Show consumer sub-options when consumer division is selected but loan type not fully chosen
  const showConsumerSubOptions = division === 'consumer';

  if (!showConsumerSubOptions) {
    // Step 1: Division selection
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {divisionOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleDivisionSelect(option.value)}
            className={cn(
              "flex flex-col items-center justify-center p-8 rounded-lg border-2 transition-all bg-white",
              "hover:border-primary hover:shadow-lg",
              division === option.value
                ? "border-primary shadow-md"
                : "border-muted-foreground/25"
            )}
          >
            <img 
              src={option.logo} 
              alt={option.alt} 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </button>
        ))}
      </div>
    );
  }

  // Step 2: Consumer sub-options (Vehicle or Watercraft)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBackToDivision}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <span className="text-sm text-muted-foreground">Select asset type for Consumer</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consumerSubOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSubOptionSelect(option.value)}
            className={cn(
              "flex flex-col items-center justify-center p-8 rounded-lg border-2 transition-all",
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
    </div>
  );
}
