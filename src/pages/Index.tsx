import { PrivateSaleForm } from '@/components/private-sale/PrivateSaleForm';
import { ReportExtractionErrorDialog } from '@/components/private-sale/ReportExtractionErrorDialog';

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end mb-4">
          <ReportExtractionErrorDialog />
        </div>
        <PrivateSaleForm />
      </div>
    </div>
  );
};

export default Index;
