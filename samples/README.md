# Sample Documents for Testing

This folder contains sample documents that can be used to test the AI extraction capabilities of Field AI.

## Available Samples

### Text Files (Ready to Use)
These text files can be saved as images (screenshots) or printed to PDF for testing:

1. **sample-business-card.txt**
   - Contains: John Smith's contact information
   - Expected extraction: First Name: John, Last Name: Smith, Email: john.smith@techcorp.com, Phone: (555) 123-4567, Address: 123 Innovation Drive, San Francisco, CA 94105

2. **sample-contact-form.txt**
   - Contains: Sarah Johnson's contact details
   - Expected extraction: First Name: Sarah, Last Name: Johnson, Email: sarah.johnson@email.com, Phone: (555) 987-6543, Address: 456 Oak Street, Apartment 2B, Boston, MA 02108

3. **sample-invoice.txt**
   - Contains: Michael Chen's billing information
   - Expected extraction: First Name: Michael, Last Name: Chen, Email: m.chen@innovativesolutions.com, Phone: (555) 369-2580, Address: 321 Market Street, Suite 500, Seattle, WA 98101

## How to Create PDFs

### Option 1: Use Your Browser (Recommended)
1. Open any `.html` file in your browser
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
3. Choose "Save as PDF" as the destination
4. Save the PDF file

### Option 2: Screenshot Method
1. Open any `.txt` file
2. Take a screenshot
3. Upload the screenshot image to test the AI extraction

### Option 3: Online Converters
Use any free online HTML to PDF converter with the provided HTML files.

### Option 4: Using Node.js Script (Requires Chrome)
If you have Chrome/Chromium installed on your system:
```bash
# Install missing dependencies (Linux)
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 libxss1 libgbm1

# Then run the generator
node generate-pdfs.js
```

## Testing the AI

1. Start the application: `npm run dev`
2. Navigate to http://localhost:3000
3. Upload any of the sample documents
4. Watch as the AI automatically extracts and populates the form fields
5. Verify the extracted information matches the expected values

## Expected Results

The AI should be able to extract:
- **Names**: Correctly split into first and last names
- **Email addresses**: Complete email with domain
- **Phone numbers**: Including area codes
- **Addresses**: Full street address, city, state, and ZIP

## Notes

- The AI works best with clear, well-formatted documents
- Both PDFs and images (JPG, PNG) are supported
- The extraction accuracy depends on document quality and formatting
- You can create your own test documents following similar patterns