import { UploadcareRestClient } from '@uploadcare/rest-client';

export interface Document {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  url: string;
  metadata?: Record<string, any>;
}

export class UploadcareStorage {
  private client: UploadcareRestClient;

  constructor() {
    const publicKey = process.env.UPLOADCARE_PUBLIC_KEY;
    const secretKey = process.env.UPLOADCARE_SECRET_KEY;

    if (!publicKey || !secretKey) {
      throw new Error('Uploadcare credentials not configured');
    }

    this.client = new UploadcareRestClient({
      publicKey,
      secretKey,
    });
  }

  async listDocuments(limit = 20, offset = 0): Promise<Document[]> {
    try {
      const response = await this.client.listOfFiles({
        limit,
        offset,
        ordering: '-datetime_uploaded',
        stored: true,
      });

      return response.results.map(file => ({
        id: file.uuid,
        filename: file.original_filename || 'unknown',
        size: file.size || 0,
        mimeType: file.mime_type || 'application/octet-stream',
        uploadDate: new Date(file.datetime_uploaded || Date.now()),
        url: file.original_file_url || '',
        metadata: file.metadata || {},
      }));
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }

  async getDocument(documentId: string): Promise<Document | null> {
    try {
      const file = await this.client.fileInfo({
        uuid: documentId,
      });

      return {
        id: file.uuid,
        filename: file.original_filename || 'unknown',
        size: file.size || 0,
        mimeType: file.mime_type || 'application/octet-stream',
        uploadDate: new Date(file.datetime_uploaded || Date.now()),
        url: file.original_file_url || '',
        metadata: file.metadata || {},
      };
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  async getDocumentContent(documentId: string): Promise<Buffer | null> {
    try {
      const file = await this.getDocument(documentId);
      if (!file) return null;

      // Fetch the file content from the URL
      const response = await fetch(file.url);
      if (!response.ok) return null;

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error getting document content:', error);
      return null;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await this.client.deleteFile({
        uuid: documentId,
      });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  async updateMetadata(documentId: string, metadata: Record<string, any>): Promise<boolean> {
    try {
      await this.client.updateFileMetadata({
        uuid: documentId,
        metadata,
      });
      return true;
    } catch (error) {
      console.error('Error updating metadata:', error);
      return false;
    }
  }
}

// Singleton instance
let storageInstance: UploadcareStorage | null = null;

export function getStorage(): UploadcareStorage {
  if (!storageInstance) {
    storageInstance = new UploadcareStorage();
  }
  return storageInstance;
}