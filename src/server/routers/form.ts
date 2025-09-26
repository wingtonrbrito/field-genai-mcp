import { z } from 'zod';
import { router, publicProcedure } from '../api/trpc';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const populateFromDocumentSchema = z.object({
  documentBase64: z.string(),
  documentType: z.enum(['pdf', 'image']),
});

export const formRouter = router({
  populateFromDocument: publicProcedure
    .input(populateFromDocumentSchema)
    .mutation(async ({ input }) => {
      const { documentBase64, documentType } = input;

      try {
        // Initialize Gemini AI
        const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('Gemini API key not configured');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let extractedText = '';

        // Try Document AI if configured
        if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PROCESSOR_ID) {
          try {
            const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
              ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
              : undefined;

            const client = new DocumentProcessorServiceClient({
              credentials,
              apiEndpoint: 'us-documentai.googleapis.com',
            });

            const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/us/processors/${process.env.GOOGLE_CLOUD_PROCESSOR_ID}`;

            const request = {
              name,
              rawDocument: {
                content: documentBase64,
                mimeType: documentType === 'pdf' ? 'application/pdf' : 'image/png',
              },
            };

            const [result] = await client.processDocument(request);
            extractedText = result.document?.text || '';
          } catch (docAIError) {
            console.log('Document AI not available, using Gemini vision directly');
          }
        }

        // Use Gemini to extract form fields
        const prompt = `
          Analyze this document ${extractedText ? 'text' : 'image'} and extract information that would fill out a simple contact form.

          ${extractedText ? `Document text: ${extractedText}` : ''}

          Extract the following information if available:
          - First Name
          - Last Name
          - Phone Number
          - Email Address
          - Physical/Mailing Address

          Return the data as a JSON object with these exact keys:
          {
            "firstName": "...",
            "lastName": "...",
            "phone": "...",
            "email": "...",
            "address": "..."
          }

          If you can't find specific information, use null for that field.
          Look for any names, contact information, addresses, etc. in the document.
          If you find a full name but can't distinguish first/last, make your best guess at splitting it.

          Return ONLY the JSON object, no additional text or markdown.
        `;

        let result;
        if (extractedText) {
          // Use text-only model if we have extracted text
          result = await model.generateContent(prompt);
        } else {
          // Use vision model for direct image analysis
          const imagePart = {
            inlineData: {
              data: documentBase64,
              mimeType: documentType === 'pdf' ? 'application/pdf' : 'image/png',
            },
          };
          result = await model.generateContent([prompt, imagePart]);
        }

        const response = await result.response;
        const text = response.text();

        // Clean up the response and parse JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse AI response');
        }

        const extractedData = JSON.parse(jsonMatch[0]);

        return {
          success: true,
          data: {
            firstName: extractedData.firstName || '',
            lastName: extractedData.lastName || '',
            phone: extractedData.phone || '',
            email: extractedData.email || '',
            address: extractedData.address || '',
          },
        };
      } catch (error) {
        console.error('Document processing error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to process document');
      }
    }),
});