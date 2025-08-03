import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_DIR = path.join(__dirname, '../public/spec-icons');
const OUTPUT_DIR = path.join(__dirname, '../public/spec-icons-png');
const GUIDE_FILE = path.join(__dirname, 'manual-conversion-guide.md');

console.log('🔧 Creating manual conversion guide...');

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

// Create guide content
let guideContent = `# Manual TGA to PNG Conversion Guide

This guide will help you convert your WoW spec icon TGA files to PNG format for use in your React app.

## Option 1: Online Converters

You can use these online tools to convert your TGA files:

1. **Convertio** (https://convertio.co/tga-png/)
2. **CloudConvert** (https://cloudconvert.com/tga-to-png)
3. **Online-Convert** (https://image.online-convert.com/convert-to-png)

## Option 2: Desktop Software

### GIMP (Free)
1. Download GIMP from https://www.gimp.org/
2. Open each .tga file
3. Export as PNG with 64x64 size

### Photoshop
1. Open each .tga file
2. Resize to 64x64 pixels
3. Save as PNG with transparency

### Paint.NET (Free for Windows)
1. Download Paint.NET
2. Open .tga files
3. Resize to 64x64
4. Save as PNG

## Files to Convert

You have ${files.length} TGA files that need to be converted:

`;

// Add file list
files.forEach((file, index) => {
  const specId = path.parse(file).name;
  guideContent += `${index + 1}. \`${file}\` (Spec ID: ${specId})\n`;
});

guideContent += `

## Conversion Settings

For each file, use these settings:
- **Size**: 64x64 pixels
- **Format**: PNG
- **Background**: Transparent
- **Quality**: High

## Output Directory

After conversion, place all PNG files in:
\`\`\`
${OUTPUT_DIR}
\`\`\`

## File Naming

Keep the same filenames but change extension from .tga to .png:
- \`71.tga\` → \`71.png\`
- \`102.tga\` → \`102.png\`
- etc.

## Next Steps

After converting all files:

1. Update your \`spec-icons.ts\` file to use PNG images instead of emojis
2. Import the images in your React components
3. Replace emoji icons with actual WoW spec icons

## Spec ID to Name Mapping

`;

// Add spec mapping
const SPEC_NAMES = {
  71: 'Arms', 72: 'Fury', 73: 'Protection', 65: 'Holy', 66: 'Protection', 70: 'Retribution',
  253: 'Beast Mastery', 254: 'Marksmanship', 255: 'Survival', 259: 'Assassination', 260: 'Outlaw', 261: 'Subtlety',
  256: 'Discipline', 257: 'Holy', 258: 'Shadow', 250: 'Blood', 251: 'Frost', 252: 'Unholy',
  262: 'Elemental', 263: 'Enhancement', 264: 'Restoration', 62: 'Arcane', 63: 'Fire', 64: 'Frost',
  265: 'Affliction', 266: 'Demonology', 267: 'Destruction', 268: 'Brewmaster', 269: 'Windwalker', 270: 'Mistweaver',
  102: 'Balance', 103: 'Feral', 104: 'Guardian', 105: 'Restoration', 577: 'Havoc', 581: 'Vengeance',
  1467: 'Devastation', 1468: 'Preservation', 1473: 'Augmentation',
};

Object.entries(SPEC_NAMES).forEach(([specId, specName]) => {
  if (files.includes(`${specId}.tga`)) {
    guideContent += `- \`${specId}.tga\` → ${specName}\n`;
  }
});

guideContent += `

## Quick Batch Conversion

If you have ImageMagick installed, you can run the generated batch file:
\`\`\`bash
cd scripts
convert-tga-to-png.bat
\`\`\`

## Need Help?

If you encounter any issues:
1. Make sure the output directory exists
2. Check that PNG files are 64x64 pixels
3. Verify that transparency is preserved
4. Ensure filenames match the original TGA files
`;

// Write guide file
fs.writeFileSync(GUIDE_FILE, guideContent);

console.log('✅ Manual conversion guide created:', GUIDE_FILE);
console.log('📁 Output directory:', OUTPUT_DIR);
console.log('📋 Files to convert:', files.length);
console.log('💡 Check the guide for detailed instructions'); 