import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// [source png, max long-edge px, webp quality]
const jobs = [
  ['Icons/mobile image.png', 1600, 80],
  ['Screenshots/Hero Image.png', 2400, 80],
  ['Before & After/Before Visual Proof.png', 1800, 80],
  ['Before & After/After Visual Proof.png', 1800, 80],
  ['Before & After/Studio Web Before.png', 1800, 80],
  ['Before & After/Studio Web After.png', 1800, 80],
  ['Before & After/studio mobile before.png', 1800, 80],
  ['Before & After/studio mobile after.png', 1800, 80],
  ['Before & After/current plan before.png', 1800, 80],
  ['Before & After/current plan after.png', 1800, 80],
  ['Before & After/subscription before.png', 1800, 80],
  ['Before & After/subscription after.png', 1800, 80],
  ['Before & After/Ai Suggestion Updated Before.png', 1800, 80],
  ['Before & After/AI Suggestion After - web.png', 1800, 80],
  ['Before & After/Activity Panel after.png', 1800, 80],
  ['Before & After/Activity Panel before.png', 1800, 80],
  ['Before & After/batch selection before.png', 1800, 80],
  ['Before & After/batch selection after.png', 1800, 80],
  ['Before & After/download before.png', 1800, 80],
  ['Before & After/download after 1.png', 1800, 80],
  ['Before & After/download after 2.png', 1800, 80],
];

let totalBefore = 0;
let totalAfter = 0;

for (const [src, maxEdge, quality] of jobs) {
  const before = fs.statSync(src).size;
  const meta = await sharp(src).metadata();
  const longEdge = Math.max(meta.width, meta.height);
  const resizeOpts = longEdge > maxEdge
    ? (meta.width >= meta.height ? { width: maxEdge } : { height: maxEdge })
    : null;

  const dest = src.replace(/\.png$/i, '.webp');
  let pipeline = sharp(src);
  if (resizeOpts) pipeline = pipeline.resize(resizeOpts);
  await pipeline.webp({ quality }).toFile(dest);

  const after = fs.statSync(dest).size;
  totalBefore += before;
  totalAfter += after;
  console.log(`${(before/1024/1024).toFixed(2)}MB -> ${(after/1024/1024).toFixed(2)}MB\t${path.basename(dest)}`);
}

console.log(`\nTOTAL: ${(totalBefore/1024/1024).toFixed(1)}MB -> ${(totalAfter/1024/1024).toFixed(1)}MB`);
