import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { AssetDetails } from '@/types/privateSaleForm';
import { parsePdf } from '@/lib/pdfParser';
import { useToast } from '@/hooks/use-toast';
import { LoanType } from './LoanTypeSelector';

interface AssetDetailsSectionProps {
  data: AssetDetails;
  onChange: (data: AssetDetails) => void;
  loanType: LoanType;
  hasUpload: boolean;
  onUploadChange: (hasUpload: boolean) => void;
}

export function AssetDetailsSection({ data, onChange, loanType, hasUpload, onUploadChange }: AssetDetailsSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const isBoatLoan = loanType === 'boat';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const extractedData = await parsePdf(file, 'asset_details');
      
      onChange({
        hull: {
          make: extractedData.hull?.make || data.hull.make,
          model: extractedData.hull?.model || data.hull.model,
          series: extractedData.hull?.series || data.hull.series,
          registration: extractedData.hull?.registration || data.hull.registration,
          registrationExpiry: extractedData.hull?.registrationExpiry || data.hull.registrationExpiry,
          buildDate: extractedData.hull?.buildDate || data.hull.buildDate,
          hin: extractedData.hull?.hin || data.hull.hin,
          colour: extractedData.hull?.colour || data.hull.colour,
          fuelType: extractedData.hull?.fuelType || data.hull.fuelType,
          bodyType: extractedData.hull?.bodyType || data.hull.bodyType,
          odometer: extractedData.hull?.odometer || data.hull.odometer,
          transmission: extractedData.hull?.transmission || data.hull.transmission,
        },
        trailer: {
          make: extractedData.trailer?.make || data.trailer.make,
          model: extractedData.trailer?.model || data.trailer.model,
          series: extractedData.trailer?.series || data.trailer.series,
          registration: extractedData.trailer?.registration || data.trailer.registration,
          registrationExpiry: extractedData.trailer?.registrationExpiry || data.trailer.registrationExpiry,
          buildDate: extractedData.trailer?.buildDate || data.trailer.buildDate,
        },
        motor: {
          make: extractedData.motor?.make || data.motor.make,
          model: extractedData.motor?.model || data.motor.model,
          series: extractedData.motor?.series || data.motor.series,
          engineSize: extractedData.motor?.engineSize || data.motor.engineSize,
          buildDate: extractedData.motor?.buildDate || data.motor.buildDate,
          engineNumber: extractedData.motor?.engineNumber || data.motor.engineNumber,
        },
      });

      onUploadChange(true);
      toast({
        title: 'PDF processed successfully',
        description: 'Asset details have been extracted and populated',
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Error processing PDF',
        description: error instanceof Error ? error.message : 'Failed to extract data',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleHullChange = (field: keyof typeof data.hull, value: string) => {
    onChange({ ...data, hull: { ...data.hull, [field]: value } });
  };

  const handleTrailerChange = (field: keyof typeof data.trailer, value: string) => {
    onChange({ ...data, trailer: { ...data.trailer, [field]: value } });
  };

  const handleMotorChange = (field: keyof typeof data.motor, value: string) => {
    onChange({ ...data, motor: { ...data.motor, [field]: value } });
  };

  // For Commercial/Consumer loans, show simplified vehicle fields
  const renderVehicleFields = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm text-muted-foreground">Vehicle Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleMake">Make <span className="text-destructive">*</span></Label>
          <Input id="vehicleMake" value={data.hull.make} onChange={(e) => handleHullChange('make', e.target.value)} placeholder="e.g. Toyota" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleModel">Model <span className="text-destructive">*</span></Label>
          <Input id="vehicleModel" value={data.hull.model} onChange={(e) => handleHullChange('model', e.target.value)} placeholder="e.g. Hilux" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleSeries">Series/Variant</Label>
          <Input id="vehicleSeries" value={data.hull.series} onChange={(e) => handleHullChange('series', e.target.value)} placeholder="e.g. SR5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleColour">Colour <span className="text-destructive">*</span></Label>
          <Input id="vehicleColour" value={data.hull.colour} onChange={(e) => handleHullChange('colour', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleBuildDate">Build Date / Year <span className="text-destructive">*</span></Label>
          <Input id="vehicleBuildDate" value={data.hull.buildDate} onChange={(e) => handleHullChange('buildDate', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleFuelType">Fuel Type <span className="text-destructive">*</span></Label>
          <Input id="vehicleFuelType" value={data.hull.fuelType} onChange={(e) => handleHullChange('fuelType', e.target.value)} placeholder="e.g. Diesel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleRego">Registration <span className="text-destructive">*</span></Label>
          <Input id="vehicleRego" value={data.hull.registration} onChange={(e) => handleHullChange('registration', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleRegoExpiry">Registration Expiry <span className="text-destructive">*</span></Label>
          <Input id="vehicleRegoExpiry" value={data.hull.registrationExpiry} onChange={(e) => handleHullChange('registrationExpiry', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleVin">Identification Number (VIN) <span className="text-destructive">*</span></Label>
          <Input id="vehicleVin" value={data.hull.hin} onChange={(e) => handleHullChange('hin', e.target.value)} placeholder="Vehicle Identification Number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleEngineNumber">Engine Number <span className="text-destructive">*</span></Label>
          <Input id="vehicleEngineNumber" value={data.motor.engineNumber} onChange={(e) => handleMotorChange('engineNumber', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleBodyType">Body Type <span className="text-destructive">*</span></Label>
          <Input id="vehicleBodyType" value={data.hull.bodyType} onChange={(e) => handleHullChange('bodyType', e.target.value)} placeholder="e.g. Sedan, SUV" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleOdometer">Odometer Reading</Label>
          <Input id="vehicleOdometer" value={data.hull.odometer} onChange={(e) => handleHullChange('odometer', e.target.value)} placeholder="e.g. 50000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleTransmission">Transmission</Label>
          <Input id="vehicleTransmission" value={data.hull.transmission} onChange={(e) => handleHullChange('transmission', e.target.value)} placeholder="Auto / Manual" />
        </div>
      </div>
    </div>
  );

  // For Boat loans, show hull/trailer/motor fields
  const renderBoatFields = () => (
    <>
      {/* Hull Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground">Hull Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hullMake">Make <span className="text-destructive">*</span></Label>
            <Input id="hullMake" value={data.hull.make} onChange={(e) => handleHullChange('make', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hullModel">Model <span className="text-destructive">*</span></Label>
            <Input id="hullModel" value={data.hull.model} onChange={(e) => handleHullChange('model', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hullSeries">Series</Label>
            <Input id="hullSeries" value={data.hull.series} onChange={(e) => handleHullChange('series', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hullRego">Registration <span className="text-destructive">*</span></Label>
            <Input id="hullRego" value={data.hull.registration} onChange={(e) => handleHullChange('registration', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hullRegoExpiry">Registration Expiry <span className="text-destructive">*</span></Label>
            <Input id="hullRegoExpiry" value={data.hull.registrationExpiry} onChange={(e) => handleHullChange('registrationExpiry', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hullBuildDate">Build Date <span className="text-destructive">*</span></Label>
            <Input id="hullBuildDate" value={data.hull.buildDate} onChange={(e) => handleHullChange('buildDate', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hullHin">Hull Identification Number (HIN) <span className="text-destructive">*</span></Label>
            <Input id="hullHin" value={data.hull.hin} onChange={(e) => handleHullChange('hin', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hullColour">Colour <span className="text-destructive">*</span></Label>
            <Input id="hullColour" value={data.hull.colour} onChange={(e) => handleHullChange('colour', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Trailer Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground">Trailer Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trailerMake">Make</Label>
            <Input id="trailerMake" value={data.trailer.make} onChange={(e) => handleTrailerChange('make', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trailerModel">Model</Label>
            <Input id="trailerModel" value={data.trailer.model} onChange={(e) => handleTrailerChange('model', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trailerSeries">Series</Label>
            <Input id="trailerSeries" value={data.trailer.series} onChange={(e) => handleTrailerChange('series', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trailerRego">Registration</Label>
            <Input id="trailerRego" value={data.trailer.registration} onChange={(e) => handleTrailerChange('registration', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trailerRegoExpiry">Registration Expiry</Label>
            <Input id="trailerRegoExpiry" value={data.trailer.registrationExpiry} onChange={(e) => handleTrailerChange('registrationExpiry', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trailerBuildDate">Build Date</Label>
            <Input id="trailerBuildDate" value={data.trailer.buildDate} onChange={(e) => handleTrailerChange('buildDate', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Motor Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground">Motor Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="motorMake">Make</Label>
            <Input id="motorMake" value={data.motor.make} onChange={(e) => handleMotorChange('make', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motorModel">Model</Label>
            <Input id="motorModel" value={data.motor.model} onChange={(e) => handleMotorChange('model', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motorSeries">Series</Label>
            <Input id="motorSeries" value={data.motor.series} onChange={(e) => handleMotorChange('series', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motorEngineSize">Engine Size</Label>
            <Input id="motorEngineSize" value={data.motor.engineSize} onChange={(e) => handleMotorChange('engineSize', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motorBuildDate">Build Date</Label>
            <Input id="motorBuildDate" value={data.motor.buildDate} onChange={(e) => handleMotorChange('buildDate', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motorEngineNumber">Engine Number</Label>
            <Input id="motorEngineNumber" value={data.motor.engineNumber} onChange={(e) => handleMotorChange('engineNumber', e.target.value)} />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Asset Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PDF Upload */}
        <Label htmlFor="assetPdf" className="cursor-pointer block">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              {hasUpload ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : isUploading ? (
                <Loader2 className="h-5 w-5 text-muted-foreground flex-shrink-0 animate-spin" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">Upload Asset Document <span className="text-destructive">*</span></p>
                <p className="text-xs text-muted-foreground">Fields below will be auto-populated</p>
              </div>
            </div>
            <Input
              id="assetPdf"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </Label>

        {isBoatLoan ? renderBoatFields() : renderVehicleFields()}
      </CardContent>
    </Card>
  );
}
