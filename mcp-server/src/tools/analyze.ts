import { getStorage } from '../storage/uploadcare.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeDocumentTool(args: any) {
  const { documentId, fields = [] } = args;
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

    const content = await storage.getDocumentContent(documentId);
    if (!content) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not retrieve content for document ${documentId}.`,
          },
        ],
      };
    }

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: 'text',
            text: 'AI analysis not available. Please configure Gemini API key.',
          },
        ],
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fieldsToExtract = fields.length > 0
      ? fields
      : ['firstName', 'lastName', 'email', 'phone', 'address', 'company', 'jobTitle'];

    const prompt = `
      Analyze this document and extract the following information:
      ${fieldsToExtract.map(field => `- ${field}`).join('\n')}

      Also identify:
      - Document type (invoice, contract, form, letter, etc.)
      - Key entities mentioned
      - Any dates found
      - Any monetary amounts
      - Overall document purpose

      Return the analysis as a structured JSON object.
      If a field is not found, use null.
    `;

    let result;
    if (document.mimeType.startsWith('image/') || document.mimeType === 'application/pdf') {
      const imagePart = {
        inlineData: {
          data: content.toString('base64'),
          mimeType: document.mimeType,
        },
      };
      result = await model.generateContent([prompt, imagePart]);
    } else {
      // For text documents
      const textContent = content.toString('utf-8');
      result = await model.generateContent(`${prompt}\n\nDocument content:\n${textContent}`);
    }

    const response = result.response.text();

    // Try to parse as JSON
    let analysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { rawResponse: response };
      }
    } catch {
      analysis = { rawResponse: response };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Document Analysis for ${document.filename}:\n\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error analyzing document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}