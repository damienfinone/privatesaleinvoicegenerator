## Goal

Route all document-extraction AI calls through **your** Google Gemini API key (under your business contract) and remove the Lovable AI Gateway path entirely. No fallback.

## Scope

Only the `parse-pdf` edge function uses an LLM. No other AI calls exist in the project.

## Changes

### 1. Add your Gemini API key as a secret
- Request a new secret `GEMINI_API_KEY` (you paste it in a secure form; not stored in code).
- Source: Google AI Studio (https://aistudio.google.com/apikey) using your business GCP project — ensure the project has billing enabled so the paid tier applies (paid tier = data not used for training per Google's API terms).

### 2. Rewrite `supabase/functions/parse-pdf/index.ts`
- Replace the call to `https://ai.gateway.lovable.dev/v1/chat/completions` (OpenAI-compatible shape) with a direct call to Google's native Generative Language API:
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
  - Request body uses Google's native `contents`/`parts` shape with `inline_data` for the base64 file (instead of OpenAI's `image_url`).
- Read key from `Deno.env.get('GEMINI_API_KEY')`. If missing → return a clear 500 error: "Gemini API key not configured" (no silent fallback).
- Remove all references to `LOVABLE_API_KEY` in this function.
- Keep all existing extraction prompts and field schemas unchanged.
- Keep BSB normalization and JSON parsing logic unchanged.

### 3. Leave `LOVABLE_API_KEY` alone
- It's auto-managed by Lovable and used by the platform itself. It's no longer called by your app code after this change, but no need to delete it.

## What does NOT change

- Frontend (`pdfParser.ts`, all form components, preview/PDF).
- Field mappings, extraction prompts, model behavior (still Gemini 2.5 Flash, just under your contract).
- Edge function signature — same `{ fileBase64, mimeType, extractionType }` input, same `{ success, data }` output.

## Data-flow after change

```
Browser → Supabase Edge Function (parse-pdf) → Google Generative Language API (your key, your GCP project)
```

No Lovable infrastructure touches the document payload.

## Verification

After deploy, upload one test document of each type (payout letter, rego paper, bank statement) and confirm extraction still populates the form correctly. Check edge function logs for any auth (401/403) errors from Google.

## Notes on Google's terms

- **Paid tier** (billing enabled on your GCP project): prompts/responses are NOT used to train Google models, per https://ai.google.dev/gemini-api/terms.
- **Free tier**: data MAY be used for product improvement. Make sure billing is enabled on the GCP project tied to your API key.
- For stricter guarantees (DPA, zero retention, regional data residency), use Vertex AI instead of the Gemini API — that's a larger change; let me know if you need it and I'll plan it separately.
