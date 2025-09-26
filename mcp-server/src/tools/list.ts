import { getStorage } from '../storage/uploadcare.js';

export async function listDocumentsTool(args: any) {
  const { limit = 20, offset = 0 } = args;
  const storage = getStorage();

  try {
    const documents = await storage.listDocuments(limit, offset);

    if (documents.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No documents found in the storage.',
          },
        ],
      };
    }

    const documentList = documents.map((doc, index) =>
      `${index + 1}. ${doc.filename} (${doc.id})
   - Size: ${(doc.size / 1024).toFixed(2)} KB
   - Type: ${doc.mimeType}
   - Uploaded: ${doc.uploadDate.toLocaleString()}`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${documents.length} documents:\n\n${documentList}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error listing documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}