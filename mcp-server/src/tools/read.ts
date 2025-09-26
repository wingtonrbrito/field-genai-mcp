import { getStorage } from '../storage/uploadcare.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export async function readDocumentTool(args: any) {
  const { documentId, extractText = true } = args;
  const storage = getStorage();

  try {
    const document = await storage.getDocument(documentId);
    if (!document) {
      return {
        content: [
          {
            type: 'text',
            text: `Document with ID ${documentId} not found.`,
          },
        ],
      };
    }

    let extractedText = '';

    if (extractText) {
      const content = await storage.getDocumentContent(documentId);
      if (content) {
        // Try Document AI first if configured
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
                content: content.toString('base64'),
                mimeType: document.mimeType,
              },
            };

            const [result] = await client.processDocument(request);
            extractedText = result.document?.text || '';
          } catch (error) {
            console.error('Document AI extraction failed:', error);
          }
        }

        // Fallback to Gemini Vision if needed
        if (!extractedText && (document.mimeType.startsWith('image/') || document.mimeType === 'application/pdf')) {
          try {
            const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
            if (apiKey) {
              const genAI = new GoogleGenerativeAI(apiKey);
              const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

              const imagePart = {
                inlineData: {
                  data: content.toString('base64'),
                  mimeType: document.mimeType,
                },
              };

              const result = await model.generateContent([
                "Extract all text from this document. Return only the extracted text.",
                imagePart
              ]);

              extractedText = result.response.text();
            }
          } catch (error) {
            console.error('Gemini extraction failed:', error);
          }
        }
      }
    }

    const response = `Document: ${document.filename}
ID: ${document.id}
Size: ${(document.size / 1024).toFixed(2)} KB
Type: ${document.mimeType}
Uploaded: ${document.uploadDate.toLocaleString()}
URL: ${document.url}

${extractedText ? `Extracted Text:\n${extractedText.substring(0, 3000)}${extractedText.length > 3000 ? '...' : ''}` : 'Text extraction not requested or failed.'}`;

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error reading document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}