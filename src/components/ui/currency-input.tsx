import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
}

export function CurrencyInput({ 
  id, 
  value, 
  onChange, 
  placeholder = "0.00", 
  required,
  className,
  readOnly 
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Format number with commas for display
  const formatWithCommas = (val: string) => {
    if (!val) return '';
    const cleaned = val.replace(/[^0-9.]/g, '');
    if (!cleaned) return '';
    
    const parts = cleaned.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Parse formatted currency back to raw number string
  const parseCurrency = (val: string) => {
    return val.replace(/[^0-9.]/g, '');
  };

  // Format with $ prefix for display when not focused
  const getDisplayValue = () => {
    if (isFocused) {
      return formatWithCommas(value);
    }
    const formatted = formatWithCommas(value);
    if (!formatted) return '';
    return `$${formatted}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    // Remove $ if user types it
    const cleanedInput = inputVal.replace(/^\$/, '');
    onChange(parseCurrency(cleanedInput));
  };

  return (
    <Input
      id={id}
      value={getDisplayValue()}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      className={cn(readOnly && "bg-muted", className)}
    />
  );
}
