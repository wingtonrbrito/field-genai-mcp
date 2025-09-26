import { getStorage } from '../storage/uploadcare.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function compareDocumentsTool(args: any) {
  const { documentIds, purpose } = args;
  const storage = getStorage();

  try {
    if (!documentIds || documentIds.length < 2) {
      return {
        content: [
          {
            type: 'text',
            text: 'Please provide at least 2 document IDs to compare.',
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
            text: 'AI comparison not available. Please configure Gemini API key.',
          },
        ],
      };
    }

    // Fetch all documents
    const documents = await Promise.all(
      documentIds.map(async (id: string) => {
        const doc = await storage.getDocument(id);
        const content = doc ? await storage.getDocumentContent(id) : null;
        return { doc, content };
      })
    );

    // Filter out any failed fetches
    const validDocs = documents.filter(({ doc, content }) => doc && content);

    if (validDocs.length < 2) {
      return {
        content: [
          {
            type: 'text',
            text: 'Could not retrieve enough documents for comparison.',
          },
        ],
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build comparison prompt
    const prompt = `
      Compare the following ${validDocs.length} documents for this purpose: ${purpose}

      For each document, identify:
      1. Relevant information for the stated purpose
      2. Completeness of information
      3. Data quality and clarity
      4. Relevance score (1-10)

      Then recommend which document is best suited for: ${purpose}

      Documents to compare:
      ${validDocs.map((v, i) => `Document ${i + 1}: ${v.doc!.filename} (${v.doc!.id})`).join('\n')}

      Return a structured comparison with your recommendation.
    `;

    // Create content parts for all documents
    const contentParts = validDocs.map(({ doc, content }) => ({
      inlineData: {
        data: content!.toString('base64'),
        mimeType: doc!.mimeType,
      },
    }));

    const result = await model.generateContent([prompt, ...contentParts]);
    const comparison = result.response.text();

    return {
      content: [
        {
          type: 'text',
          text: `Document Comparison Results:\n\n${comparison}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error comparing documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}