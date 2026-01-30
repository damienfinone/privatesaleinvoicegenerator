import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BuyerDetails } from '@/types/privateSaleForm';
import { cn } from '@/lib/utils';

interface BuyerDetailsSectionProps {
  data: BuyerDetails;
  onChange: (data: BuyerDetails) => void;
  validationErrors: Set<string>;
}

// Australian phone number validation
// Accepts: 04XX XXX XXX, 0X XXXX XXXX, +61 X XXXX XXXX, with or without spaces/dashes
const isValidAustralianPhone = (phone: string): boolean => {
  if (!phone) return true; // Empty is valid (not required)
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Mobile: 04XXXXXXXX or +614XXXXXXXX
  // Landline: 0[2378]XXXXXXXX or +61[2378]XXXXXXXX
  const mobileRegex = /^(?:04|\+?614)\d{8}$/;
  const landlineRegex = /^(?:0[2378]|\+?61[2378])\d{8}$/;
  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
};

export function BuyerDetailsSection({ data, onChange, validationErrors }: BuyerDetailsSectionProps) {
  const [touched, setTouched] = useState(false);
  
  const handleChange = (field: keyof BuyerDetails, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const phoneError = touched && data.contactNumber && !isValidAustralianPhone(data.contactNumber);
  
  const hasError = (field: string) => validationErrors.has(field);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Buyer's Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="buyerName">Buyer's Name <span className="text-destructive">*</span></Label>
            <Input
              id="buyerName"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter buyer's full name"
              className={cn(hasError('buyer.name') && !data.name.trim() && 'border-destructive focus-visible:ring-destructive')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyerContact">Buyer's Contact Number <span className="text-destructive">*</span></Label>
            <Input
              id="buyerContact"
              value={data.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. 0412 345 678"
              className={cn(
                (phoneError || (hasError('buyer.contactNumber') && (!data.contactNumber.trim() || !isValidAustralianPhone(data.contactNumber)))) && 
                'border-destructive focus-visible:ring-destructive'
              )}
            />
            {phoneError && (
              <p className="text-xs text-destructive">
                Please enter a valid Australian phone number
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyerAddress">Buyer's Address <span className="text-destructive">*</span></Label>
          <Input
            id="buyerAddress"
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter buyer's address"
            className={cn(hasError('buyer.address') && !data.address.trim() && 'border-destructive focus-visible:ring-destructive')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
