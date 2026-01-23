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

const assetTypeOptions: { value: AssetType; label: string; icon: React.ReactNode }[] = [
  {
    value: 'vehicle',
    label: 'Vehicle',
    icon: <Car className="h-5 w-5" />,
  },
  {
    value: 'watercraft',
    label: 'Watercraft',
    icon: <Ship className="h-5 w-5" />,
  },
];

export function LoanTypeSelector({ 
  value, 
  onChange, 
  division, 
  onDivisionChange,
}: LoanTypeSelectorProps) {
  
  const handleDivisionSelect = (selectedDivision: Division) => {
    // If clicking the same division, do nothing
    if (selectedDivision === division) return;
    
    // Reset loan type when changing division
    onDivisionChange(selectedDivision);
  };

  const handleAssetTypeSelect = (assetType: AssetType) => {
    if (division === 'consumer') {
      onChange(assetType === 'vehicle' ? 'consumer' : 'boat');
    } else if (division === 'commercial') {
      onChange(assetType === 'vehicle' ? 'commercial' : 'commercial-boat');
    }
  };

  // Determine current asset type from loan type value
  const currentAssetType: AssetType | null = 
    value === 'consumer' || value === 'commercial' ? 'vehicle' :
    value === 'boat' || value === 'commercial-boat' ? 'watercraft' : null;

  return (
    <div className="space-y-4">
      {/* Step 1: Division selection (always visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {divisionOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleDivisionSelect(option.value)}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all bg-white",
              "hover:border-primary hover:shadow-lg",
              division === option.value
                ? "border-primary shadow-md"
                : "border-muted-foreground/25"
            )}
          >
            <img 
              src={option.logo} 
              alt={option.alt} 
              className="h-12 md:h-16 w-auto object-contain"
            />
          </button>
        ))}
      </div>

      {/* Step 2: Asset type selection (only visible after division selected) */}
      {division !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assetTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleAssetTypeSelect(option.value)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all",
                "hover:border-primary hover:bg-primary/5",
                currentAssetType === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/25 text-muted-foreground"
              )}
            >
              <div className={cn(
                currentAssetType === option.value ? "text-primary" : "text-muted-foreground"
              )}>
                {option.icon}
              </div>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
