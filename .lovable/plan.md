

## Report Extraction Error Feature

Add a button in the top-right of the form page that opens a dialog allowing users to report incorrect document extractions. The report (with the uploaded document attached as a download link) gets emailed to damien.oliver@financeone.com.au.

### User Flow

1. User clicks "Report extraction error" button (top-right of the page header)
2. Dialog opens with:
   - File upload (PDF or image, same accepted types as existing uploads)
   - Multiline text input: "What fields were extracted incorrectly?"
   - Submit button
3. On submit:
   - Document is uploaded to a private storage bucket
   - A signed URL (valid 7 days) is generated
   - Email is sent to damien.oliver@financeone.com.au with the description and document download link
   - User sees success toast, dialog closes

### Technical Implementation

**1. Storage**
- Create a private storage bucket `extraction-error-reports`
- RLS: allow public uploads (anyone using the form can submit a report); reads restricted to service role
- Files stored under `reports/{timestamp}-{filename}`

**2. Email Infrastructure (Lovable Cloud built-in)**
- Check email domain status — if not configured, prompt the user to set up a sender domain via the email setup dialog (prerequisite)
- Run `setup_email_infra` to create queues, tables, cron job
- Run `scaffold_transactional_email` to create the `send-transactional-email` function
- Create a new template `_shared/transactional-email-templates/extraction-error-report.tsx`:
  - Subject: "Extraction Error Report - [timestamp]"
  - Body: shows the description text and a "Download document" button linking to the signed URL
  - Register in `registry.ts`
- Note: Damien will be the recipient (not the form submitter), so we pass `recipientEmail: 'damien.oliver@financeone.com.au'` when invoking the function

**3. Frontend**
- New component `src/components/private-sale/ReportExtractionErrorDialog.tsx`:
  - Trigger button (variant="outline", with a flag/alert icon) placed at the top-right of `Index.tsx` header area
  - Dialog with file input (using existing `getAcceptString()` and `capture="environment"` for mobile camera support, consistent with other uploads)
  - Textarea for the field description (zod-validated: non-empty, max 2000 chars)
  - Submit handler:
    1. Upload file to storage bucket via `supabase.storage.from('extraction-error-reports').upload(...)`
    2. Generate signed URL via `createSignedUrl(path, 60 * 60 * 24 * 7)`
    3. Invoke `send-transactional-email` with template name `extraction-error-report`, recipient `damien.oliver@financeone.com.au`, idempotency key `extraction-error-{uuid}`, and `templateData: { description, documentUrl, fileName }`
    4. Show success toast, reset form, close dialog
  - Loading state on submit button; disable while uploading/sending
- Update `src/pages/Index.tsx` to render the button in the header

### Files to Create / Modify

- Create: `src/components/private-sale/ReportExtractionErrorDialog.tsx`
- Modify: `src/pages/Index.tsx` (add button to header)
- Create: storage bucket migration + RLS policies
- Create: `supabase/functions/_shared/transactional-email-templates/extraction-error-report.tsx`
- Modify: `supabase/functions/_shared/transactional-email-templates/registry.ts` (register new template)
- Deploy: `send-transactional-email` edge function

### Prerequisites Note

This feature requires an email sender domain to be configured. If one isn't set up yet, you'll be prompted to set it up first (one-time step) before the email infrastructure can be scaffolded.

