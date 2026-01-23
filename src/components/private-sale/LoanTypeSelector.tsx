import { Car, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';
import consumerLogo from '@/assets/financeone-consumer-logo.svg';
import commercialLogo from '@/assets/financeone-commercial-logo.svg';

export type LoanType = 'commercial' | 'consumer' | 'boat' | 'commercial-boat';
export type Division = 'consumer' | 'commercial';
export type AssetType = 'vehicle' | 'watercraft';

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

const assetTypeOptions: { value: AssetType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'vehicle',
    label: 'Vehicle',
    description: 'Car, motorcycle & other vehicles',
    icon: <Car className="h-8 w-8" />,
  },
  {
    value: 'watercraft',
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
    onDivisionChange(selectedDivision);
  };

  const handleAssetTypeSelect = (assetType: AssetType) => {
    if (division === 'consumer') {
      onChange(assetType === 'vehicle' ? 'consumer' : 'boat');
    } else {
      onChange(assetType === 'vehicle' ? 'commercial' : 'commercial-boat');
    }
  };

  // Show asset type options when division is selected
  const showAssetTypeOptions = division !== null;

  if (!showAssetTypeOptions) {
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
              "border-muted-foreground/25"
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

  // Determine current asset type from loan type value
  const currentAssetType: AssetType | null = 
    value === 'consumer' || value === 'commercial' ? 'vehicle' :
    value === 'boat' || value === 'commercial-boat' ? 'watercraft' : null;

  // Step 2: Asset type selection (Vehicle or Watercraft)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {assetTypeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleAssetTypeSelect(option.value)}
          className={cn(
            "flex flex-col items-center justify-center p-8 rounded-lg border-2 transition-all",
            "hover:border-primary hover:bg-primary/5",
            currentAssetType === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted-foreground/25 text-muted-foreground"
          )}
        >
          <div className={cn(
            "mb-3",
            currentAssetType === option.value ? "text-primary" : "text-muted-foreground"
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
