import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, fileBase64, mimeType, extractionType } = await req.json();
    
    // Support both old pdfBase64 param and new fileBase64 param
    const base64Data = fileBase64 || pdfBase64;
    const contentType = mimeType || 'application/pdf';

    if (!base64Data) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractionPrompt = '';
    
    switch (extractionType) {
      case 'asset_details':
        extractionPrompt = `Analyze this PDF document and extract asset/vehicle/watercraft details. Return a JSON object with these fields (use empty string if not found):
{
  "hull": {
    "make": "",
    "model": "",
    "series": "",
    "registration": "",
    "registrationExpiry": "",
    "buildDate": "",
    "hin": "",
    "colour": "",
    "fuelType": "",
    "bodyType": ""
  },
  "trailer": {
    "make": "",
    "model": "",
    "series": "",
    "registration": "",
    "registrationExpiry": "",
    "buildDate": ""
  },
  "motor": {
    "make": "",
    "model": "",
    "series": "",
    "engineSize": "",
    "buildDate": "",
    "engineNumber": ""
  }
}

Field mapping hints:
- "hin" = VIN/Chassis number (vehicle identification number)
- "fuelType" = Fuel type (e.g., Diesel, Petrol, Electric, Hybrid) - look for "Fuel" field
- "bodyType" = Body shape or body type (e.g., Sedan, SUV, Prime Mover, Utility) - look for "Body shape" field
- "buildDate" = Year or build date

Only return the JSON object, no other text.`;
        break;
      
      case 'hull_details':
        extractionPrompt = `Analyze this boat/ship registration PDF document and extract hull details. Return a JSON object with these fields (use empty string if not found):
{
  "make": "",
  "model": "",
  "registration": "",
  "registrationExpiry": "",
  "buildDate": "",
  "hin": "",
  "colour": "",
  "bodyType": "",
  "hullMaterial": "",
  "length": ""
}

Field mapping hints for Queensland boat registration documents:
- "make" = Make (e.g., BROOKER, QUINTREX, STACER)
- "model" = Model (e.g., RUNABOUT, SPORTSMAN)
- "registration" = Registration number (e.g., AGW 20Q)
- "registrationExpiry" = Next registration expiry date or Registration Due Date
- "buildDate" = Year field (e.g., 2009)
- "hin" = Hull serial no (e.g., AUBMPL0897I808) - this is the Hull Identification Number
- "colour" = Colour (e.g., BLU for blue, WHT for white)
- "bodyType" = Body shape (e.g., OPEN/DINGHY/RUNABOUT)
- "hullMaterial" = Hull material type (e.g., ALUMINIUM, FIBREGLASS)
- "length" = Length in metres

Only return the JSON object, no other text.`;
        break;
      
      case 'trailer_details':
        extractionPrompt = `Analyze this trailer registration PDF document and extract trailer details. Return a JSON object with these fields (use empty string if not found):
{
  "make": "",
  "model": "",
  "registration": "",
  "registrationExpiry": "",
  "buildDate": "",
  "vin": "",
  "atm": ""
}

Field mapping hints for Queensland trailer registration documents:
- "make" = Vehicle make (e.g., BROOKER, QUINTREX) - often shown after "Vehicle:" label
- "model" = Model if available
- "registration" = Registration number (e.g., FP1627)
- "registrationExpiry" = Next registration expiry date (look for 12 months row)
- "buildDate" = Year of manufacture if shown
- "vin" = VIN or chassis number if present
- "atm" = Aggregate Trailer Mass (e.g., "ATM UP TO 1.02T" means 1.02 tonnes)

Only return the JSON object, no other text.`;
        break;
        extractionPrompt = `Analyze this PDF document which contains proof of a bank account. Extract the banking details. Return a JSON object with these fields (use empty string if not found):
{
  "accountName": "",
  "bsbNumber": "",
  "accountNumber": "",
  "bank": ""
}
Only return the JSON object, no other text.`;
        break;
      
      case 'payout_letter_bank':
        extractionPrompt = `Analyze this PDF document which is a payout letter from a financier. Extract ALL payment details - the letter may contain bank transfer details, BPAY details, or both. Return a JSON object with these fields (use empty string if not found):
{
  "accountName": "",
  "bsbNumber": "",
  "accountNumber": "",
  "bank": "",
  "billerCode": "",
  "referenceNumber": "",
  "payoutAmount": ""
}
Look for:
- accountName: The name of the lender/financier who issued the payout letter. Usually found in the document header, letterhead, logo area, or footer (e.g., "Macquarie Leasing", "ANZ", "Westpac", "Finance One", etc.)
- Bank transfer details: BSB, account number
- BPAY details: biller code (usually 4-6 digits), reference number (customer reference)
- Payout/settlement amount: the total amount to pay
Only return the JSON object, no other text.`;
        break;
      
      case 'payout_letter_bpay':
        extractionPrompt = `Analyze this PDF document which is a payout letter with BPAY details. Extract the BPAY information. Return a JSON object with these fields (use empty string if not found):
{
  "accountName": "",
  "billerCode": "",
  "referenceNumber": "",
  "bank": "",
  "payoutAmount": ""
}
Only return the JSON object, no other text.`;
        break;
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid extraction type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Processing document for extraction type: ${extractionType}, contentType: ${contentType}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: extractionPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${contentType};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: `AI processing failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';
    
    console.log('AI Response:', content);

    // Parse the JSON from the response
    let extractedData;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      extractedData = JSON.parse(jsonStr);
      
      // Normalize BSB number: remove spaces and hyphens, keep only digits
      if (extractedData.bsbNumber) {
        extractedData.bsbNumber = extractedData.bsbNumber.replace(/[\s\-]/g, '');
        console.log('Normalized BSB:', extractedData.bsbNumber);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return raw content if parsing fails
      extractedData = { raw: content };
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
