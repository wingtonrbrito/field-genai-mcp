import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import tool implementations
import { listDocumentsTool } from './tools/list.js';
import { readDocumentTool } from './tools/read.js';
import { searchDocumentsTool } from './tools/search.js';
import { analyzeDocumentTool } from './tools/analyze.js';
import { compareDocumentsTool } from './tools/compare.js';

// Initialize MCP Server
const server = new Server(
  {
    name: 'field-genai-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const TOOLS = [
  {
    name: 'list_documents',
    description: 'List all uploaded documents with metadata',
    inputSchema: z.object({
      limit: z.number().optional().describe('Maximum number of documents to return'),
      offset: z.number().optional().describe('Offset for pagination'),
    }),
  },
  {
    name: 'read_document',
    description: 'Read the content of a specific document',
    inputSchema: z.object({
      documentId: z.string().describe('The ID of the document to read'),
      extractText: z.boolean().optional().describe('Whether to extract text from the document'),
    }),
  },
  {
    name: 'search_documents',
    description: 'Search through documents for specific information',
    inputSchema: z.object({
      query: z.string().describe('Search query'),
      documentTypes: z.array(z.string()).optional().describe('Filter by document types'),
      limit: z.number().optional().describe('Maximum number of results'),
    }),
  },
  {
    name: 'analyze_document',
    description: 'Analyze a document to extract structured information',
    inputSchema: z.object({
      documentId: z.string().describe('The ID of the document to analyze'),
      fields: z.array(z.string()).optional().describe('Specific fields to extract'),
    }),
  },
  {
    name: 'compare_documents',
    description: 'Compare multiple documents to find the most relevant one',
    inputSchema: z.object({
      documentIds: z.array(z.string()).describe('Array of document IDs to compare'),
      purpose: z.string().describe('What information are you looking for'),
    }),
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS.map(tool => ({
      ...tool,
      inputSchema: tool.inputSchema.shape as any,
    })),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_documents':
        return await listDocumentsTool(args);

      case 'read_document':
        return await readDocumentTool(args);

      case 'search_documents':
        return await searchDocumentsTool(args);

      case 'analyze_document':
        return await analyzeDocumentTool(args);

      case 'compare_documents':
        return await compareDocumentsTool(args);

      default:
        throw new Error(`Tool ${name} not found`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Field GenAI MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});