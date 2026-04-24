
## Current blocker

The uploads are not what’s blocking preview/download anymore.

Based on the current code and your screenshot, the likely blocking field is **Registration Expiry** in Asset Details. The form validator only accepts:
- `DD/MM/YYYY`
- or `YYYY-MM-DD`

In your screenshot it appears filled with `RegExpiry`, which is non-empty but not a valid date.

## Why this is not obvious

The submit logic blocks preview whenever any validator fails, but the UI only shows a red border for some fields when they are empty. For **Registration Expiry**, the code blocks submission for an invalid non-empty value, yet the field styling only turns red when it is blank.

So the form can fail with:
- generic toast: `Required Fields Missing`
- no clear inline error on the actual blocking field

That mismatch is why it feels like uploads are still mandatory.

## Implementation plan

1. **Fix invalid-value highlighting**
   - Update `AssetDetailsSection.tsx` so `Registration Expiry` shows destructive styling when the value is present but invalid, not only when empty.
   - Add an inline helper message like:
     - `Enter date as DD/MM/YYYY or YYYY-MM-DD`

2. **Improve submit feedback**
   - Update `PrivateSaleForm.tsx` so the submit toast is more specific than “Required Fields Missing”.
   - Show a clearer message such as:
     - `Please fix the highlighted fields before previewing`
   - Optionally surface the first blocking field name in the toast.

3. **Audit other hidden blockers**
   - Review other validators where non-empty invalid values can block submission without obvious UI feedback.
   - Most important candidates:
     - vehicle registration expiry
     - watercraft registration expiry if validated elsewhere
     - any date/format-driven fields that currently only style empties

4. **Keep VIN non-blocking**
   - Preserve the current VIN behavior:
     - warning only
     - no preview/download block

## Files to update

- `src/components/private-sale/PrivateSaleForm.tsx`
- `src/components/private-sale/AssetDetailsSection.tsx`

## Expected result

After this change:
- missing uploads will stay optional
- preview/download will only be blocked by real required-field or format issues
- the exact blocking field will be visually obvious
- in your shown example, `Registration Expiry` would clearly display as the problem instead of looking like an upload requirement
