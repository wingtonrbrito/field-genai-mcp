# Field GenAI MCP - Intelligent Multi-Document Processing

An advanced version of Field AI that uses MCP (Model Context Protocol) to enable intelligent multi-document processing with conversational AI.

## 🚀 What's New with MCP Integration

### The Problem We're Solving
When you have multiple documents (invoices, contracts, forms, emails, etc.) and need to extract specific information, manually selecting the right document is tedious. This system uses AI to:
- **Understand** what information you need
- **Search** through all your documents
- **Find** the most relevant document automatically
- **Extract** the required fields
- **Populate** your forms intelligently

## 🎯 Key Features

### 1. Multi-Document Upload
- Upload multiple files at once via Uploadcare
- Support for PDFs, images, Word docs, etc.
- Automatic indexing and analysis

### 2. Conversational AI Assistant
- Chat with AI about your documents
- Natural language queries: "Find the vendor's contact info"
- AI understands context and finds the right document

### 3. MCP Server Integration
- Standardized protocol for AI-document interaction
- Efficient document management and search
- Real-time processing with streaming updates

### 4. Intelligent Extraction
- AI determines which document has the needed information
- Combines data from multiple documents when necessary
- No manual file selection required

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js App   │────▶│  MCP Server  │────▶│  Uploadcare │
│   (Frontend)    │     │  (Middleware) │     │  (Storage)  │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌──────────────┐
│  Gemini Chat    │────▶│  Document AI │
│     (AI)        │     │    (OCR)     │
└─────────────────┘     └──────────────┘
```

## 🔧 How MCP Works Here

The MCP server provides these tools to the AI:

```javascript
// Available MCP Tools
{
  "list_documents": "Show all uploaded documents",
  "read_document": "Read a specific document",
  "search_documents": "Search across all documents",
  "analyze_document": "Extract structured data",
  "compare_documents": "Compare multiple documents"
}
```

When you chat with the AI:
1. Your message goes to Gemini
2. Gemini uses MCP tools to explore your documents
3. MCP server interfaces with Uploadcare to access files
4. AI finds and extracts the relevant information
5. Form fields are automatically populated

## 💬 Example Conversation

```
You: "I need to fill out a vendor registration form"

AI: "I'll help you with that. Let me search through your documents...
     I found 3 relevant documents:
     - Invoice from TechCorp (has company details)
     - Contract with TechCorp (has legal information)
     - Email from John Smith (has contact details)

     The invoice has the most complete vendor information.
     Should I extract the details from there?"

You: "Yes, and also find their tax ID if available"

AI: "Extracting from the invoice... Found the tax ID in the contract.
     Here's what I've gathered:
     - Company: TechCorp Industries
     - Address: 123 Innovation Drive, San Francisco, CA 94105
     - Contact: John Smith
     - Email: john.smith@techcorp.com
     - Phone: (555) 123-4567
     - Tax ID: 12-3456789

     I'll populate these fields in your form now."
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Uploadcare account
- Google AI Studio API key

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd field-genai-mcp

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables
```env
# AI Services
GOOGLE_AI_STUDIO_API_KEY=your_key_here

# Uploadcare
UPLOADCARE_PUBLIC_KEY=your_public_key
UPLOADCARE_SECRET_KEY=your_secret_key

# MCP Server
MCP_SERVER_PORT=3001
MCP_SERVER_URL=http://localhost:3001
```

### Running the Application

```bash
# Start the MCP server
npm run mcp:server

# In another terminal, start the Next.js app
npm run dev

# Open http://localhost:3000
```

## 🎓 Use Cases

1. **Vendor Onboarding**: Upload invoices, contracts, emails → AI fills vendor forms
2. **Customer Registration**: Upload business cards, letters → AI extracts contact info
3. **Expense Reports**: Upload receipts → AI categorizes and extracts amounts
4. **HR Documents**: Upload resumes, certificates → AI populates employee records
5. **Legal Processing**: Upload contracts → AI extracts key terms and parties

## 🔮 Future Enhancements

- [ ] Support for more storage providers (S3, Azure Blob)
- [ ] Multi-language document support
- [ ] Document templates and auto-classification
- [ ] Bulk processing capabilities
- [ ] Integration with CRM/ERP systems
- [ ] Advanced analytics and insights
- [ ] Voice interaction support

## 🤝 Contributing

This is an experimental project exploring MCP capabilities. Contributions welcome!

## 📝 License

MIT

## 🔗 Related Projects

- [MCP Specification](https://modelcontextprotocol.io)
- [Field AI (Original)](https://github.com/wingtonrbrito/field-ai)
- [Uploadcare](https://uploadcare.com)
- [Google Gemini](https://ai.google.dev)