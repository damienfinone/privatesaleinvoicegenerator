import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorDetails } from '@/types/privateSaleForm';

interface VendorDetailsSectionProps {
  data: VendorDetails;
  onChange: (data: VendorDetails) => void;
}

export function VendorDetailsSection({ data, onChange }: VendorDetailsSectionProps) {
  const handleChange = (field: keyof VendorDetails, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vendor's Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-w-md">
          <Label htmlFor="vendorName">Vendor's Name</Label>
          <Input
            id="vendorName"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter vendor's name"
          />
        </div>
      </CardContent>
    </Card>
  );
}
