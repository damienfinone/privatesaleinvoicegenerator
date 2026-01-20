import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type LoanType = 'commercial' | 'consumer' | 'boat';

interface LoanTypeSelectorProps {
  value: LoanType | null;
  onChange: (value: LoanType) => void;
}

const loanTypeLabels: Record<LoanType, string> = {
  commercial: 'Commercial',
  consumer: 'Consumer',
  boat: 'Boat Loan',
};

export function LoanTypeSelector({ value, onChange }: LoanTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="loan-type">Loan Type</Label>
      <Select value={value || ''} onValueChange={(v) => onChange(v as LoanType)}>
        <SelectTrigger id="loan-type" className="w-full md:w-[280px]">
          <SelectValue placeholder="Select loan type" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="commercial">{loanTypeLabels.commercial}</SelectItem>
          <SelectItem value="consumer">{loanTypeLabels.consumer}</SelectItem>
          <SelectItem value="boat">{loanTypeLabels.boat}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
