import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Configuration
const INPUT_DIR = path.join(__dirname, '../public/spec-icons');
const OUTPUT_DIR = path.join(__dirname, '../public/spec-icons-png');
const SPEC_ICONS_FILE = path.join(__dirname, '../src/constants/spec-icons.ts');

console.log('🔧 Script starting...');
console.log('📁 Input directory:', INPUT_DIR);
console.log('📁 Output directory:', OUTPUT_DIR);

// Check if input directory exists
if (!fs.existsSync(INPUT_DIR)) {
  console.error('❌ Input directory does not exist:', INPUT_DIR);
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log('📁 Creating output directory...');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Spec ID to name mapping for better logging
const SPEC_NAMES = {
  71: 'Arms', 72: 'Fury', 73: 'Protection', 65: 'Holy', 66: 'Protection', 70: 'Retribution',
  253: 'Beast Mastery', 254: 'Marksmanship', 255: 'Survival', 259: 'Assassination', 260: 'Outlaw', 261: 'Subtlety',
  256: 'Discipline', 257: 'Holy', 258: 'Shadow', 250: 'Blood', 251: 'Frost', 252: 'Unholy',
  262: 'Elemental', 263: 'Enhancement', 264: 'Restoration', 62: 'Arcane', 63: 'Fire', 64: 'Frost',
  265: 'Affliction', 266: 'Demonology', 267: 'Destruction', 268: 'Brewmaster', 269: 'Windwalker', 270: 'Mistweaver',
  102: 'Balance', 103: 'Feral', 104: 'Guardian', 105: 'Restoration', 577: 'Havoc', 581: 'Vengeance',
  1467: 'Devastation', 1468: 'Preservation', 1473: 'Augmentation',
};

async function checkImageMagick() {
  try {
    await execAsync('magick --version');
    return true;
  } catch (error) {
    return false;
  }
}

async function convertTgaToPng() {
  try {
    console.log('🔧 Starting TGA to PNG conversion...');
    
    // Check if ImageMagick is available
    const hasImageMagick = await checkImageMagick();
    if (!hasImageMagick) {
      console.log('⚠️  ImageMagick not found. Trying alternative approach...');
      console.log('💡 Please install ImageMagick from: https://imagemagick.org/script/download.php');
      console.log('   Or use an online converter to convert TGA to PNG manually.');
      return;
    }
    
    // Get all .tga files
    const files = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.tga'));
    
    console.log('📋 All files in input directory:', fs.readdirSync(INPUT_DIR));
    console.log('🔍 TGA files found:', files);
    
    if (files.length === 0) {
      console.log('❌ No .tga files found in', INPUT_DIR);
      return;
    }
    
    console.log(`📁 Found ${files.length} .tga files to convert`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Convert each file using ImageMagick
    for (const file of files) {
      const specId = path.parse(file).name;
      const specName = SPEC_NAMES[specId] || 'Unknown';
      const inputPath = path.join(INPUT_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, `${specId}.png`);
      
      console.log(`\n🔄 Processing: ${file}`);
      console.log(`   Spec ID: ${specId}`);
      console.log(`   Spec Name: ${specName}`);
      console.log(`   Input: ${inputPath}`);
      console.log(`   Output: ${outputPath}`);
      
      try {
        console.log(`🔄 Converting ${specId} (${specName})...`);
        
        // Use ImageMagick to convert TGA to PNG
        const command = `magick "${inputPath}" -resize 64x64 -background transparent "${outputPath}"`;
        await execAsync(command);
        
        console.log(`✅ Converted ${specId} (${specName}) -> ${outputPath}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to convert ${specId} (${specName}):`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Conversion Summary:');
    console.log(`✅ Successfully converted: ${successCount} files`);
    console.log(`❌ Failed conversions: ${errorCount} files`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Conversion complete! You can now use the PNG files in your React app.');
      console.log('💡 Next steps:');
      console.log('   1. Update your spec-icons.ts to use the PNG files');
      console.log('   2. Import the images in your components');
      console.log('   3. Replace emoji icons with actual WoW spec icons');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the conversion
convertTgaToPng(); 