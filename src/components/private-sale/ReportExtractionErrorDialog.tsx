import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAcceptString, isValidFileType } from '@/lib/pdfParser';

const schema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Please describe what was extracted incorrectly')
    .max(2000, 'Description must be 2000 characters or fewer'),
});

export function ReportExtractionErrorDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFile(null);
    setDescription('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!isValidFileType(selected)) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload a PDF or image.',
        variant: 'destructive',
      });
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    const parsed = schema.safeParse({ description });
    if (!parsed.success) {
      toast({
        title: 'Invalid input',
        description: parsed.error.issues[0]?.message ?? 'Check the form.',
        variant: 'destructive',
      });
      return;
    }
    if (!file) {
      toast({
        title: 'Document required',
        description: 'Please upload the document that was extracted incorrectly.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `reports/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('extraction-error-reports')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { error: fnError } = await supabase.functions.invoke(
        'send-extraction-error-report',
        {
          body: {
            description: parsed.data.description,
            storagePath: path,
            fileName: file.name,
          },
        },
      );
      if (fnError) throw fnError;

      toast({
        title: 'Report submitted',
        description: 'Thanks — the extraction issue has been reported.',
      });
      reset();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Failed to submit report',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="mr-2" />
          Report extraction error
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report extraction error</DialogTitle>
          <DialogDescription>
            Upload the document and describe which fields were extracted incorrectly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-file">Upload document</Label>
            <input
              id="report-file"
              type="file"
              accept={getAcceptString()}
              capture="environment"
              onChange={handleFileChange}
              disabled={submitting}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
            />
            {file && (
              <p className="text-xs text-muted-foreground truncate">Selected: {file.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">What fields were extracted incorrectly?</Label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The hull HIN was wrong, the engine HP was missing..."
              rows={5}
              maxLength={2000}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/2000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 animate-spin" />}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
