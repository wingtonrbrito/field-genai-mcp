const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF(htmlFile, pdfFile) {
  console.log(`Generating ${pdfFile} from ${htmlFile}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Read HTML content
  const htmlContent = fs.readFileSync(htmlFile, 'utf8');

  // Set content with proper base URL for styles
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'
  });

  // Generate PDF
  await page.pdf({
    path: pdfFile,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });

  await browser.close();
  console.log(`✓ Generated ${pdfFile}`);
}

async function main() {
  const samplesDir = __dirname;

  // List of HTML files to convert
  const htmlFiles = [
    'business-card.html',
    'contact-form.html',
    'invoice.html'
  ];

  console.log('Starting PDF generation...\n');

  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(samplesDir, htmlFile);
    const pdfPath = path.join(samplesDir, htmlFile.replace('.html', '.pdf'));

    if (fs.existsSync(htmlPath)) {
      try {
        await generatePDF(htmlPath, pdfPath);
      } catch (error) {
        console.error(`Error generating PDF for ${htmlFile}:`, error);
      }
    } else {
      console.log(`Skipping ${htmlFile} - file not found`);
    }
  }

  console.log('\n✅ PDF generation complete!');
  console.log('You can now use these PDF files to test the AI extraction feature.');
}

main().catch(console.error);