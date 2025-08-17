#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const pub = path.join(root, 'public');

const images = [
  { name: 'og-image', file: 'og-image.jpg', target: { width: 1200, height: 630 } },
  { name: 'twitter-image', file: 'twitter-image.jpg', target: { width: 1200, height: 600 } },
];

async function ensureExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function optimizeOne({ name, file, target }) {
  const srcPath = path.join(pub, file);
  const exists = await ensureExists(srcPath);
  if (!exists) {
    console.warn(`⚠️  Missing ${file} in /public, skipping.`);
    return;
  }

  const base = path.join(pub, name);
  const avifPath = `${base}.avif`;
  const webpPath = `${base}.webp`;
  const backupPath = path.join(pub, `${file}.bak-${Date.now()}`);

  const img = sharp(srcPath, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  const width = Math.min(target.width, meta.width || target.width);
  const height = Math.min(target.height, meta.height || target.height);

  console.log(`🔧 Optimizing ${file} → ${width}x${height}`);

  // Save AVIF
  await img
    .clone()
    .resize(width, height, { fit: 'cover', withoutEnlargement: true })
    .avif({ quality: 55, effort: 4 })
    .toFile(avifPath);
  console.log(`✅ ${path.basename(avifPath)}`);

  // Save WebP
  await img
    .clone()
    .resize(width, height, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(webpPath);
  console.log(`✅ ${path.basename(webpPath)}`);

  // Backup original JPG and write optimized JPG via temp file then replace
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

async function run() {
  for (const item of images) {
    try {
      await optimizeOne(item);
    } catch (err) {
      console.error(`❌ Failed to optimize ${item.file}:`, err);
      process.exitCode = 1;
    }
  }
  console.log('✨ Done. Remember: keep JPG in <meta> tags for crawler compatibility.');
}

run();
