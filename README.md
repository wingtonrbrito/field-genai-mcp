# Field AI - Smart Form Auto-Population

An AI-powered form application that automatically extracts and populates contact information from documents using Google Document AI and Gemini. Perfect as a starting point for projects that need intelligent form filling capabilities.

## Features

- 🤖 **AI-Powered Extraction**: Uses Google Gemini AI to intelligently extract contact information from documents
- 📄 **PDF Processing**: Upload PDF documents for automatic data extraction
- 🖼️ **Image Support**: Process images containing text and forms
- 📝 Simple, generic form fields (First Name, Last Name, Phone, Email, Address)
- ✨ **Smart Auto-Population**: AI automatically fills form fields from uploaded documents
- ✅ Form validation
- 💾 Export form data as JSON
- 🔄 Reset functionality
- 🎨 Clean, modern UI with Mantine components
- 📱 Responsive design

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **tRPC** - End-to-end typesafe APIs
- **Google Gemini AI** - Intelligent document understanding
- **Google Document AI** (Optional) - Enhanced OCR and document processing
- **Mantine UI** - Component library
- **Tailwind CSS** - Utility-first CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google AI Studio API key (free) or Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/field-ai.git
cd field-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini/Google AI Studio API key to `.env.local`:
```
GOOGLE_AI_STUDIO_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload a Document**: Click or drag-and-drop a PDF or image file containing contact information
2. **AI Processing**: The AI will automatically analyze the document and extract relevant information
3. **Review & Edit**: Check the auto-populated fields and make any necessary corrections
4. **Submit or Export**: Submit the form or export the data as JSON

### Testing with Sample Documents

The `/samples` folder contains ready-to-use test documents:
- Open any HTML file in your browser and save as PDF (Ctrl/Cmd + P → Save as PDF)
- Or take screenshots of the text files
- Upload these to see the AI extraction in action

### Form Fields:
- **First Name** - Extracted from document
- **Last Name** - Extracted from document
- **Phone** - Any phone numbers found
- **Email** - Email addresses detected
- **Address** - Physical or mailing addresses

### Features:
- **AI Auto-Population**: Automatically fills form fields from uploaded documents
- **Manual Entry**: Can also manually enter information without uploading
- **Submit**: Process the form data
- **Reset**: Clear all fields and start over
- **Export JSON**: Download form data as a JSON file for integration

## Project Structure

```
field-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx       # Main form component with AI integration
│   │   ├── layout.tsx     # Root layout
│   │   ├── providers.tsx  # tRPC and Mantine providers
│   │   └── api/
│   │       └── trpc/      # tRPC API endpoint
│   ├── server/
│   │   ├── api/           # tRPC configuration
│   │   └── routers/       # API routes (form.ts handles AI extraction)
│   └── utils/
│       └── trpc.ts        # tRPC client utilities
├── samples/               # Sample documents for testing
│   ├── *.html             # HTML templates (convert to PDF)
│   ├── *.txt              # Text samples for testing
│   └── README.md          # Instructions for using samples
├── public/                # Static assets
├── package.json           # Dependencies
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Customization

This project is designed to be a starting point. You can easily:
- Add more form fields and train the AI to extract them
- Integrate with MCP (Model Context Protocol) for enhanced capabilities
- Add Agent AI for more complex document understanding
- Connect to databases for data persistence
- Customize the extraction prompts in `/src/server/routers/form.ts`
- Add support for more document types
- Integrate with other AI services
- Build industry-specific extraction logic

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## License

MIT

## Contributing

Feel free to fork this project and customize it for your needs. Pull requests are welcome!
