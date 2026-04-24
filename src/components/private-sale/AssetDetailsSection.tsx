import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle, Camera } from 'lucide-react';
import { AssetDetails } from '@/types/privateSaleForm';
import { parseDocument, isValidFileType, getAcceptString } from '@/lib/pdfParser';
import { useToast } from '@/hooks/use-toast';
import { LoanType } from './LoanTypeSelector';
import { cn } from '@/lib/utils';

interface AssetDetailsSectionProps {
  data: AssetDetails;
  onChange: (data: AssetDetails) => void;
  loanType: LoanType;
  hasUpload: boolean;
  onUploadChange: (hasUpload: boolean) => void;
  hullIncluded: boolean;
  onHullIncludedChange: (included: boolean) => void;
  hasHullUpload: boolean;
  onHullUploadChange: (hasUpload: boolean) => void;
  motorIncluded: boolean;
  onMotorIncludedChange: (included: boolean) => void;
  hasMotorUpload: boolean;
  onMotorUploadChange: (hasUpload: boolean) => void;
  trailerIncluded: boolean;
  onTrailerIncludedChange: (included: boolean) => void;
  hasTrailerUpload: boolean;
  onTrailerUploadChange: (hasUpload: boolean) => void;
  validationErrors: Set<string>;
}

export function AssetDetailsSection({ data, onChange, loanType, hasUpload, onUploadChange, hullIncluded, onHullIncludedChange, hasHullUpload, onHullUploadChange, motorIncluded, onMotorIncludedChange, hasMotorUpload, onMotorUploadChange, trailerIncluded, onTrailerIncludedChange, hasTrailerUpload, onTrailerUploadChange, validationErrors }: AssetDetailsSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingHull, setIsUploadingHull] = useState(false);
  const [isUploadingMotor, setIsUploadingMotor] = useState(false);
  const [isUploadingTrailer, setIsUploadingTrailer] = useState(false);
  const { toast } = useToast();
  
  // Keep a ref to the latest data to avoid stale closures in async handlers
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const isBoatLoan = loanType === 'boat' || loanType === 'commercial-boat';
  
  const hasError = (field: string) => validationErrors.has(field);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or image file (JPG, PNG, HEIC)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const extractedData = await parseDocument(file, 'asset_details');
      
      // Use ref to get the current state at the time extraction completes
      const currentData = dataRef.current;
      
      onChange({
        hull: {
          make: extractedData.hull?.make || currentData.hull.make,
          model: extractedData.hull?.model || currentData.hull.model,
          series: extractedData.hull?.series || currentData.hull.series,
          registration: extractedData.hull?.registration || currentData.hull.registration,
          registrationExpiry: extractedData.hull?.registrationExpiry || currentData.hull.registrationExpiry,
          buildDate: extractedData.hull?.buildDate || currentData.hull.buildDate,
          identificationType: extractedData.hull?.identificationType || currentData.hull.identificationType,
          hin: extractedData.hull?.hin || currentData.hull.hin,
          colour: extractedData.hull?.colour || currentData.hull.colour,
          fuelType: extractedData.hull?.fuelType || currentData.hull.fuelType,
          bodyType: extractedData.hull?.bodyType || currentData.hull.bodyType,
          odometer: extractedData.hull?.odometer || currentData.hull.odometer,
          transmission: extractedData.hull?.transmission || currentData.hull.transmission,
        },
        trailer: {
          make: extractedData.trailer?.make || currentData.trailer.make,
          model: extractedData.trailer?.model || currentData.trailer.model,
          registration: extractedData.trailer?.registration || currentData.trailer.registration,
          registrationExpiry: extractedData.trailer?.registrationExpiry || currentData.trailer.registrationExpiry,
          buildDate: extractedData.trailer?.buildDate || currentData.trailer.buildDate,
          vin: extractedData.trailer?.vin || currentData.trailer.vin,
        },
        motor: {
          make: extractedData.motor?.make || currentData.motor.make,
          model: extractedData.motor?.model || currentData.motor.model,
          series: extractedData.motor?.series || currentData.motor.series,
          engineSize: extractedData.motor?.engineSize || currentData.motor.engineSize,
          buildDate: extractedData.motor?.buildDate || currentData.motor.buildDate,
          engineNumber: extractedData.motor?.engineNumber || currentData.motor.engineNumber,
        },
      });

      onUploadChange(true);
      toast({
        title: 'Document processed successfully',
        description: 'Asset details have been extracted and populated',
      });
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: 'Error processing document',
        description: error instanceof Error ? error.message : 'Failed to extract data',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handler for watercraft-specific file uploads (hull, motor, trailer)
  const handleWatercraftFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hull' | 'motor' | 'trailer') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or image file (JPG, PNG, HEIC)',
        variant: 'destructive',
      });
      return;
    }

    const setLoading = type === 'hull' ? setIsUploadingHull : type === 'motor' ? setIsUploadingMotor : setIsUploadingTrailer;
    const setHasUpload = type === 'hull' ? onHullUploadChange : type === 'motor' ? onMotorUploadChange : onTrailerUploadChange;

    setLoading(true);

    try {
      if (type === 'hull') {
        const extractedData = await parseDocument(file, 'hull_details');
        const currentData = dataRef.current;
        
        onChange({
          ...currentData,
          hull: {
            ...currentData.hull,
            make: extractedData.make || currentData.hull.make,
            model: extractedData.model || currentData.hull.model,
            registration: extractedData.registration || currentData.hull.registration,
            registrationExpiry: extractedData.registrationExpiry || currentData.hull.registrationExpiry,
            buildDate: extractedData.buildDate || currentData.hull.buildDate,
            hin: extractedData.hin || currentData.hull.hin,
            colour: extractedData.colour || currentData.hull.colour,
            bodyType: extractedData.bodyType || currentData.hull.bodyType,
          },
        });
        
        const extractedFields: string[] = [];
        if (extractedData.make) extractedFields.push('Make');
        if (extractedData.model) extractedFields.push('Model');
        if (extractedData.registration) extractedFields.push('Registration');
        if (extractedData.registrationExpiry) extractedFields.push('Registration Expiry');
        if (extractedData.buildDate) extractedFields.push('Build Date');
        if (extractedData.hin) extractedFields.push('HIN');
        if (extractedData.colour) extractedFields.push('Colour');
        if (extractedData.bodyType) extractedFields.push('Body Type');

        setHasUpload(true);
        toast({
          title: 'Hull document processed',
          description: extractedFields.length > 0
            ? `Extracted: ${extractedFields.join(', ')}`
            : 'Document uploaded but no fields could be extracted',
        });
      } else if (type === 'trailer') {
        const extractedData = await parseDocument(file, 'trailer_details');
        const currentData = dataRef.current;
        
        onChange({
          ...currentData,
          trailer: {
            ...currentData.trailer,
            make: extractedData.make || currentData.trailer.make,
            model: extractedData.model || currentData.trailer.model,
            registration: extractedData.registration || currentData.trailer.registration,
            registrationExpiry: extractedData.registrationExpiry || currentData.trailer.registrationExpiry,
            buildDate: extractedData.buildDate || currentData.trailer.buildDate,
            vin: extractedData.vin || currentData.trailer.vin,
          },
        });
        
        const extractedFields: string[] = [];
        if (extractedData.make) extractedFields.push('Make');
        if (extractedData.model) extractedFields.push('Model');
        if (extractedData.registration) extractedFields.push('Registration');
        if (extractedData.registrationExpiry) extractedFields.push('Registration Expiry');
        if (extractedData.buildDate) extractedFields.push('Build Date');
        if (extractedData.vin) extractedFields.push('VIN');

        setHasUpload(true);
        toast({
          title: 'Trailer document processed',
          description: extractedFields.length > 0
            ? `Extracted: ${extractedFields.join(', ')}`
            : 'Document uploaded but no fields could be extracted',
        });
      } else if (type === 'motor') {
        const extractedData = await parseDocument(file, 'motor_details');
        const currentData = dataRef.current;
        
        onChange({
          ...currentData,
          motor: {
            ...currentData.motor,
            make: extractedData.make || currentData.motor.make,
            model: extractedData.model || currentData.motor.model,
            series: extractedData.series || currentData.motor.series,
            engineSize: extractedData.engineSize || currentData.motor.engineSize,
            buildDate: extractedData.buildDate || currentData.motor.buildDate,
            engineNumber: extractedData.engineNumber || currentData.motor.engineNumber,
          },
        });
        
        const extractedFields: string[] = [];
        if (extractedData.make) extractedFields.push('Make');
        if (extractedData.model) extractedFields.push('Model');
        if (extractedData.engineSize) extractedFields.push('Engine Size');
        if (extractedData.buildDate) extractedFields.push('Build Date');
        if (extractedData.engineNumber) extractedFields.push('Engine Number');

        setHasUpload(true);
        toast({
          title: 'Motor document processed',
          description: extractedFields.length > 0
            ? `Extracted: ${extractedFields.join(', ')}`
            : 'Document uploaded but no fields could be extracted',
        });
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: 'Error processing document',
        description: error instanceof Error ? error.message : 'Failed to extract data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleMake">Make <span className="text-destructive">*</span></Label>
          <Input id="vehicleMake" value={data.hull.make} onChange={(e) => handleHullChange('make', e.target.value)} placeholder="e.g. Toyota" className={cn(hasError('asset.hull.make') && !data.hull.make.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleModel">Model <span className="text-destructive">*</span></Label>
          <Input id="vehicleModel" value={data.hull.model} onChange={(e) => handleHullChange('model', e.target.value)} placeholder="e.g. Hilux" className={cn(hasError('asset.hull.model') && !data.hull.model.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleSeries">Series/Variant</Label>
          <Input id="vehicleSeries" value={data.hull.series} onChange={(e) => handleHullChange('series', e.target.value)} placeholder="e.g. SR5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleColour">Colour <span className="text-destructive">*</span></Label>
          <Input id="vehicleColour" value={data.hull.colour} onChange={(e) => handleHullChange('colour', e.target.value)} className={cn(hasError('asset.hull.colour') && !data.hull.colour.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleBuildDate">Build Date / Year <span className="text-destructive">*</span></Label>
          <Input id="vehicleBuildDate" value={data.hull.buildDate} onChange={(e) => handleHullChange('buildDate', e.target.value)} className={cn(hasError('asset.hull.buildDate') && !data.hull.buildDate.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleFuelType">Fuel Type <span className="text-destructive">*</span></Label>
          <Input id="vehicleFuelType" value={data.hull.fuelType} onChange={(e) => handleHullChange('fuelType', e.target.value)} placeholder="e.g. Diesel" className={cn(hasError('asset.hull.fuelType') && !data.hull.fuelType.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleRego">Registration <span className="text-destructive">*</span></Label>
          <Input id="vehicleRego" value={data.hull.registration} onChange={(e) => handleHullChange('registration', e.target.value)} className={cn(hasError('asset.hull.registration') && !data.hull.registration.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleRegoExpiry">Registration Expiry <span className="text-destructive">*</span></Label>
          <Input id="vehicleRegoExpiry" value={data.hull.registrationExpiry} onChange={(e) => handleHullChange('registrationExpiry', e.target.value)} className={cn(hasError('asset.hull.registrationExpiry') && !data.hull.registrationExpiry.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleVin">Identification Number (VIN) <span className="text-destructive">*</span></Label>
          <Input id="vehicleVin" value={data.hull.hin} onChange={(e) => handleHullChange('hin', e.target.value.toUpperCase())} placeholder="Vehicle Identification Number" className={cn(hasError('asset.hull.hin') && !data.hull.hin.trim() && 'border-destructive')} />
          {data.hull.hin.trim() && !/^[A-Z0-9]{17}$/.test(data.hull.hin.trim()) && (
            <p className="text-xs text-amber-600">VIN should be 17 characters, letters A–Z and digits 0–9 only.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleEngineNumber">Engine Number <span className="text-destructive">*</span></Label>
          <Input id="vehicleEngineNumber" value={data.motor.engineNumber} onChange={(e) => handleMotorChange('engineNumber', e.target.value)} className={cn(hasError('asset.motor.engineNumber') && !data.motor.engineNumber.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleBodyType">Body Type <span className="text-destructive">*</span></Label>
          <Input id="vehicleBodyType" value={data.hull.bodyType} onChange={(e) => handleHullChange('bodyType', e.target.value)} placeholder="e.g. Sedan, SUV" className={cn(hasError('asset.hull.bodyType') && !data.hull.bodyType.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleOdometer">Odometer Reading <span className="text-destructive">*</span></Label>
          <Input id="vehicleOdometer" value={data.hull.odometer} onChange={(e) => handleHullChange('odometer', e.target.value)} placeholder="e.g. 50000" className={cn(hasError('asset.hull.odometer') && !data.hull.odometer.trim() && 'border-destructive')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleTransmission">Transmission <span className="text-destructive">*</span></Label>
          <Input id="vehicleTransmission" value={data.hull.transmission} onChange={(e) => handleHullChange('transmission', e.target.value)} placeholder="Auto / Manual" className={cn(hasError('asset.hull.transmission') && !data.hull.transmission.trim() && 'border-destructive')} />
        </div>
      </div>
    </div>
  );

  // For Boat loans, show hull/trailer/motor fields
  const renderBoatFields = () => (
    <>
      {/* Hull Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Label>Hull included? <span className="text-destructive">*</span></Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onHullIncludedChange(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                hullIncluded === true
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onHullIncludedChange(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                hullIncluded === false
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              No
            </button>
          </div>
        </div>
        {hullIncluded && (
          <>
            {/* Hull Upload */}
            <Label htmlFor="hullPdf" className="cursor-pointer block">
              <div className={cn(
                "border-2 border-dashed rounded-lg p-4 hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors mb-4",
                hasError('asset.hull.upload') && !hasHullUpload ? "border-destructive" : "border-muted-foreground/25"
              )}>
                <div className="flex items-center gap-3">
                  {hasHullUpload ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : isUploadingHull ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground flex-shrink-0 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Upload Hull Document <span className="text-destructive">*</span></p>
                    <p className="text-xs text-muted-foreground">PDF or photo • Fields will be auto-populated</p>
                  </div>
                </div>
                <Input
                  id="hullPdf"
                  type="file"
                  accept={getAcceptString()}
                  capture="environment"
                  onChange={(e) => handleWatercraftFileUpload(e, 'hull')}
                  className="hidden"
                />
              </div>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hullMake">Make <span className="text-destructive">*</span></Label>
                <Input id="hullMake" value={data.hull.make} onChange={(e) => handleHullChange('make', e.target.value)} className={cn(hasError('asset.hull.make') && !data.hull.make.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hullModel">Model <span className="text-destructive">*</span></Label>
                <Input id="hullModel" value={data.hull.model} onChange={(e) => handleHullChange('model', e.target.value)} className={cn(hasError('asset.hull.model') && !data.hull.model.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hullRego">Registration <span className="text-destructive">*</span></Label>
                <Input id="hullRego" value={data.hull.registration} onChange={(e) => handleHullChange('registration', e.target.value)} className={cn(hasError('asset.hull.registration') && !data.hull.registration.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hullRegoExpiry">Registration Expiry</Label>
                <Input id="hullRegoExpiry" value={data.hull.registrationExpiry} onChange={(e) => handleHullChange('registrationExpiry', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hullBuildDate">Build Date <span className="text-destructive">*</span></Label>
                <Input id="hullBuildDate" value={data.hull.buildDate} onChange={(e) => handleHullChange('buildDate', e.target.value)} className={cn(hasError('asset.hull.buildDate') && !data.hull.buildDate.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hullColour">Colour</Label>
                <Input id="hullColour" value={data.hull.colour} onChange={(e) => handleHullChange('colour', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hullIdType">Identification Type <span className="text-destructive">*</span></Label>
                <Select value={data.hull.identificationType} onValueChange={(value) => handleHullChange('identificationType', value)}>
                  <SelectTrigger id="hullIdType" className={cn("bg-background", hasError('asset.hull.identificationType') && !data.hull.identificationType && 'border-destructive')}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="HIN">Hull Identification Number (HIN)</SelectItem>
                    <SelectItem value="SIN">Serial Identification Number (SIN)</SelectItem>
                    <SelectItem value="UVI">Unique Vessel Identifier (UVI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hullHin">{data.hull.identificationType || 'Identification'} Number <span className="text-destructive">*</span></Label>
                <Input id="hullHin" value={data.hull.hin} onChange={(e) => handleHullChange('hin', e.target.value)} placeholder="Enter identification number" className={cn(hasError('asset.hull.hin') && !data.hull.hin.trim() && 'border-destructive')} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Visual separator */}
      <div className="border-t border-border" />

      {/* Motor Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Label>Motor included? <span className="text-destructive">*</span></Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onMotorIncludedChange(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                motorIncluded === true
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onMotorIncludedChange(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                motorIncluded === false
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              No
            </button>
          </div>
        </div>
        {motorIncluded && (
          <>
            {/* Motor Upload */}
            <Label htmlFor="motorPdf" className="cursor-pointer block">
              <div className={cn(
                "border-2 border-dashed rounded-lg p-4 hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors mb-4",
                hasError('asset.motor.upload') && !hasMotorUpload ? "border-destructive" : "border-muted-foreground/25"
              )}>
                <div className="flex items-center gap-3">
                  {hasMotorUpload ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : isUploadingMotor ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground flex-shrink-0 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Upload Motor Document <span className="text-destructive">*</span></p>
                    <p className="text-xs text-muted-foreground">PDF or photo • Fields will be auto-populated</p>
                  </div>
                </div>
                <Input
                  id="motorPdf"
                  type="file"
                  accept={getAcceptString()}
                  capture="environment"
                  onChange={(e) => handleWatercraftFileUpload(e, 'motor')}
                  className="hidden"
                />
              </div>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motorMake">Make <span className="text-destructive">*</span></Label>
                <Input id="motorMake" value={data.motor.make} onChange={(e) => handleMotorChange('make', e.target.value)} className={cn(hasError('asset.motor.make') && !data.motor.make.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorModel">Model <span className="text-destructive">*</span></Label>
                <Input id="motorModel" value={data.motor.model} onChange={(e) => handleMotorChange('model', e.target.value)} className={cn(hasError('asset.motor.model') && !data.motor.model.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorEngineSize">Engine Size</Label>
                <Input id="motorEngineSize" value={data.motor.engineSize} onChange={(e) => handleMotorChange('engineSize', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorBuildDate">Build Date <span className="text-destructive">*</span></Label>
                <Input id="motorBuildDate" value={data.motor.buildDate} onChange={(e) => handleMotorChange('buildDate', e.target.value)} className={cn(hasError('asset.motor.buildDate') && !data.motor.buildDate.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorEngineNumber">Engine Number <span className="text-destructive">*</span></Label>
                <Input id="motorEngineNumber" value={data.motor.engineNumber} onChange={(e) => handleMotorChange('engineNumber', e.target.value)} className={cn(hasError('asset.motor.engineNumber') && !data.motor.engineNumber.trim() && 'border-destructive')} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Visual separator */}
      <div className="border-t border-border" />

      {/* Trailer Included Question */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Label>Trailer included? <span className="text-destructive">*</span></Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onTrailerIncludedChange(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                trailerIncluded === true
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onTrailerIncludedChange(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                trailerIncluded === false
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Trailer Fields - only show if trailer included */}
        {trailerIncluded === true && (
          <>
            {/* Trailer Upload */}
            <Label htmlFor="trailerPdf" className="cursor-pointer block">
              <div className={cn(
                "border-2 border-dashed rounded-lg p-4 hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors mb-4",
                hasError('asset.trailer.upload') && !hasTrailerUpload ? "border-destructive" : "border-muted-foreground/25"
              )}>
                <div className="flex items-center gap-3">
                  {hasTrailerUpload ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : isUploadingTrailer ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground flex-shrink-0 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Upload Trailer Document <span className="text-destructive">*</span></p>
                    <p className="text-xs text-muted-foreground">PDF or photo • Fields will be auto-populated</p>
                  </div>
                </div>
                <Input
                  id="trailerPdf"
                  type="file"
                  accept={getAcceptString()}
                  capture="environment"
                  onChange={(e) => handleWatercraftFileUpload(e, 'trailer')}
                  className="hidden"
                />
              </div>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trailerMake">Make <span className="text-destructive">*</span></Label>
                <Input id="trailerMake" value={data.trailer.make} onChange={(e) => handleTrailerChange('make', e.target.value)} className={cn(hasError('asset.trailer.make') && !data.trailer.make.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerModel">Model <span className="text-destructive">*</span></Label>
                <Input id="trailerModel" value={data.trailer.model} onChange={(e) => handleTrailerChange('model', e.target.value)} className={cn(hasError('asset.trailer.model') && !data.trailer.model.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerRego">Registration <span className="text-destructive">*</span></Label>
                <Input id="trailerRego" value={data.trailer.registration} onChange={(e) => handleTrailerChange('registration', e.target.value)} className={cn(hasError('asset.trailer.registration') && !data.trailer.registration.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerRegoExpiry">Registration Expiry</Label>
                <Input id="trailerRegoExpiry" value={data.trailer.registrationExpiry} onChange={(e) => handleTrailerChange('registrationExpiry', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerBuildDate">Build Date <span className="text-destructive">*</span></Label>
                <Input id="trailerBuildDate" value={data.trailer.buildDate} onChange={(e) => handleTrailerChange('buildDate', e.target.value)} className={cn(hasError('asset.trailer.buildDate') && !data.trailer.buildDate.trim() && 'border-destructive')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerVin">VIN <span className="text-destructive">*</span></Label>
                <Input id="trailerVin" value={data.trailer.vin} onChange={(e) => handleTrailerChange('vin', e.target.value)} className={cn(hasError('asset.trailer.vin') && !data.trailer.vin.trim() && 'border-destructive')} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Asset Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Single PDF Upload - only for vehicle loans */}
        {!isBoatLoan && (
          <Label htmlFor="assetPdf" className="cursor-pointer block">
            <div className={cn(
              "border-2 border-dashed rounded-lg p-4 hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors",
              hasError('asset.upload') && !hasUpload ? "border-destructive" : "border-muted-foreground/25"
            )}>
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
                  <p className="text-xs text-muted-foreground">PDF or photo • Fields will be auto-populated</p>
                </div>
              </div>
              <Input
                id="assetPdf"
                type="file"
                accept={getAcceptString()}
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </Label>
        )}

        {isBoatLoan ? renderBoatFields() : renderVehicleFields()}
      </CardContent>
    </Card>
  );
}
