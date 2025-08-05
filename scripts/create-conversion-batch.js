import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_DIR = path.join(__dirname, '../public/spec-icons');
const OUTPUT_DIR = path.join(__dirname, '../public/spec-icons-png');
const BATCH_FILE = path.join(__dirname, 'convert-tga-to-png.bat');

console.log('🔧 Creating conversion batch file...');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log('📁 Creating output directory...');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all .tga files
const files = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.tga'));

if (files.length === 0) {
  console.log('❌ No .tga files found in', INPUT_DIR);
  process.exit(1);
}

// Create batch file content
let batchContent = `@echo off
echo Converting TGA files to PNG...
echo.

`;

// Add conversion commands for each file
files.forEach(file => {
  const specId = path.parse(file).name;
  const inputPath = path.join(INPUT_DIR, file).replace(/\\/g, '\\\\');
  const outputPath = path.join(OUTPUT_DIR, `${specId}.png`).replace(/\\/g, '\\\\');
  
  batchContent += `echo Converting ${specId}.tga...
magick "${inputPath}" -resize 64x64 -background transparent "${outputPath}"
if %errorlevel% neq 0 (
    echo Failed to convert ${specId}.tga
) else (
    echo Successfully converted ${specId}.tga to ${specId}.png
)
echo.
`;
});

batchContent += `echo Conversion complete!
echo Output directory: ${OUTPUT_DIR.replace(/\\/g, '\\\\')}
pause
`;

// Write batch file
fs.writeFileSync(BATCH_FILE, batchContent);

console.log('✅ Batch file created:', BATCH_FILE);
console.log('📁 Output directory:', OUTPUT_DIR);
console.log('💡 Instructions:');
console.log('   1. Install ImageMagick from: https://imagemagick.org/script/download.php');
console.log('   2. Run the batch file: convert-tga-to-png.bat');
console.log('   3. The PNG files will be created in the spec-icons-png directory'); 