import { getStorage } from '../storage/uploadcare.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function searchDocumentsTool(args: any) {
  const { query, documentTypes, limit = 10 } = args;
  const storage = getStorage();

  try {
    // Get all documents
    const allDocuments = await storage.listDocuments(100, 0);

    // Filter by document types if specified
    let documents = allDocuments;
    if (documentTypes && documentTypes.length > 0) {
      documents = allDocuments.filter(doc =>
        documentTypes.some((type: string) => doc.mimeType.includes(type))
      );
    }

    // For now, we'll do a simple filename search
    // In production, you'd want to use embeddings and vector search
    const searchResults = documents.filter(doc =>
      doc.filename.toLowerCase().includes(query.toLowerCase()) ||
      (doc.metadata && JSON.stringify(doc.metadata).toLowerCase().includes(query.toLowerCase()))
    );

    // If we have Gemini configured, we can do more intelligent searching
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey && searchResults.length === 0) {
      // This is where you'd implement semantic search using embeddings
      // For now, we'll just return a message
      return {
        content: [
          {
            type: 'text',
            text: `No documents found matching "${query}". Try uploading documents that contain the information you're looking for.`,
          },
        ],
      };
    }

    if (searchResults.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No documents found matching your search query: "${query}"`,
          },
        ],
      };
    }

    const limitedResults = searchResults.slice(0, limit);
    const resultList = limitedResults.map((doc, index) =>
      `${index + 1}. ${doc.filename} (${doc.id})
   - Type: ${doc.mimeType}
   - Size: ${(doc.size / 1024).toFixed(2)} KB
   - Relevance: Filename match`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${limitedResults.length} documents matching "${query}":\n\n${resultList}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error searching documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}