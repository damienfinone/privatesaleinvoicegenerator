import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BuyerDetails } from '@/types/privateSaleForm';

interface BuyerDetailsSectionProps {
  data: BuyerDetails;
  onChange: (data: BuyerDetails) => void;
}

export function BuyerDetailsSection({ data, onChange }: BuyerDetailsSectionProps) {
  const handleChange = (field: keyof BuyerDetails, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Buyer's Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="buyerName">Buyer's Name</Label>
            <Input
              id="buyerName"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter buyer's full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyerContact">Buyer's Contact Number</Label>
            <Input
              id="buyerContact"
              value={data.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
              placeholder="Enter contact number"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyerAddress">Buyer's Address</Label>
          <Input
            id="buyerAddress"
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter buyer's address"
          />
        </div>
      </CardContent>
    </Card>
  );
}
