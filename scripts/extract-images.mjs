import fs from 'fs';

function extractImages(filePath, outDir) {
  const buffer = fs.readFileSync(filePath);
  const jsonLength = buffer.readUInt32LE(12);
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength));
  
  const binChunkOffset = 20 + jsonLength;
  const binDataOffset = binChunkOffset + 8;
  
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  gltf.images?.forEach((img, idx) => {
    const bv = gltf.bufferViews[img.bufferView];
    const offset = binDataOffset + (bv.byteOffset || 0);
    const length = bv.byteLength;
    const imgBuf = buffer.subarray(offset, offset + length);
    const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const outPath = `${outDir}/image_${idx}_${img.name || 'unnamed'}.${ext}`;
    fs.writeFileSync(outPath, imgBuf);
    console.log(`Extracted: ${outPath} (${(imgBuf.length / 1024).toFixed(1)} KB)`);
  });
}

extractImages('public/assets/products/mug/mug.glb', 'public/assets/products/mug');
extractImages('public/assets/products/tshirt/tshirt.glb', 'public/assets/products/tshirt');
