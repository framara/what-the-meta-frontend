#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const pub = path.join(root, 'public');
const manifestPath = path.join(pub, '.image-opt-manifest.json');

const images = [
  { name: 'og-image', file: 'og-image.jpg', target: { width: 1200, height: 630 } },
  { name: 'twitter-image', file: 'twitter-image.jpg', target: { width: 1200, height: 600 } },
];

const args = new Set(process.argv.slice(2));
const UPDATE_JPG = args.has('--update-jpg') || /^(1|true|yes)$/i.test(process.env.OPTIMIZE_IMAGES_UPDATE_JPG || '');

async function ensureExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(p, fallback = {}) {
  try {
    const buf = await fs.readFile(p, 'utf8');
    return JSON.parse(buf);
  } catch {
    return fallback;
  }
}

async function writeJSON(p, obj) {
  await fs.writeFile(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

async function fileHash(p) {
  const buf = await fs.readFile(p);
  return createHash('sha1').update(buf).digest('hex');
}

// Avoid timestamp-based decisions to prevent false positives on synced folders (e.g., OneDrive)

async function optimizeOne({ name, file, target }, manifest) {
  const srcPath = path.join(pub, file);
  const exists = await ensureExists(srcPath);
  if (!exists) {
    console.warn(`⚠️  Missing ${file} in /public, skipping.`);
    return manifest;
  }

  const base = path.join(pub, name);
  const avifPath = `${base}.avif`;
  const webpPath = `${base}.webp`;

  const srcHash = await fileHash(srcPath);
  const prev = manifest[file];
  const avifExists = await ensureExists(avifPath);
  const webpExists = await ensureExists(webpPath);

  // Skip all work if source unchanged and both outputs exist
  if (prev?.srcHash === srcHash && avifExists && webpExists && !UPDATE_JPG) {
    console.log(`⏭️  Skipping ${file} (unchanged)`);
    return manifest;
  }

  const img = sharp(srcPath, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  const width = Math.min(target.width, meta.width || target.width);
  const height = Math.min(target.height, meta.height || target.height);

  console.log(`🔧 Optimizing ${file} → ${width}x${height}`);

  // Save AVIF (only if missing or source changed)
  if (!avifExists || prev?.srcHash !== srcHash) {
    await img
      .clone()
      .resize(width, height, { fit: 'cover', withoutEnlargement: true })
      .avif({ quality: 55, effort: 4 })
      .toFile(avifPath);
    console.log(`✅ ${path.basename(avifPath)}`);
  } else {
    console.log(`⏭️  ${path.basename(avifPath)} up-to-date`);
  }

  // Save WebP (only if missing or source changed)
  if (!webpExists || prev?.srcHash !== srcHash) {
    await img
      .clone()
      .resize(width, height, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(webpPath);
    console.log(`✅ ${path.basename(webpPath)}`);
  } else {
    console.log(`⏭️  ${path.basename(webpPath)} up-to-date`);
  }

  // JPG rewrite is optional to avoid git churn; only when flag is provided
  if (UPDATE_JPG) {
    const backupPath = path.join(pub, `${file}.bak-${Date.now()}`);
    await fs.copyFile(srcPath, backupPath);
    const tmpPath = `${srcPath}.tmp`;
    await img
      .clone()
      .resize(width, height, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true, progressive: true })
      .toFile(tmpPath);
    await fs.rename(tmpPath, srcPath);
    console.log(`✅ Optimized ${file} (backup at ${path.basename(backupPath)})`);
  }

  manifest[file] = { srcHash, width, height, updatedAt: Date.now(), wroteJpg: !!UPDATE_JPG };
  return manifest;
}

async function run() {
  let manifest = await readJSON(manifestPath, {});
  for (const item of images) {
    try {
      manifest = await optimizeOne(item, manifest);
    } catch (err) {
      console.error(`❌ Failed to optimize ${item.file}:`, err);
      process.exitCode = 1;
    }
  }
  await writeJSON(manifestPath, manifest);
  console.log('✨ Done. JPG rewrite disabled by default. Use --update-jpg or OPTIMIZE_IMAGES_UPDATE_JPG=1 to update JPGs.');
}

run();
