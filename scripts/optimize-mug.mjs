import fs from 'fs';

function repackGLBWithOptimizedImage() {
  const originalGlb = fs.readFileSync('public/assets/products/mug/mug.glb');
  const jsonLength = originalGlb.readUInt32LE(12);
  const gltf = JSON.parse(originalGlb.toString('utf8', 20, 20 + jsonLength));
  
  const binChunkOffset = 20 + jsonLength;
  const binLength = originalGlb.readUInt32LE(binChunkOffset);
  const binDataOffset = binChunkOffset + 8;
  const originalBin = originalGlb.subarray(binDataOffset, binDataOffset + binLength);
  
  const newCoffeeJpg = fs.readFileSync('public/assets/products/mug/coffee_opt.jpg');
  
  // Image 1 is coffee
  const coffeeImg = gltf.images[1];
  coffeeImg.mimeType = 'image/jpeg';
  const oldBv = gltf.bufferViews[coffeeImg.bufferView];
  
  // Create new bin buffer
  // We can copy everything before oldBv, then newCoffeeJpg, then everything after oldBv (adjusting offsets)
  const beforeBv = originalBin.subarray(0, oldBv.byteOffset);
  const afterBv = originalBin.subarray(oldBv.byteOffset + oldBv.byteLength);
  
  // Align newCoffeeJpg to 4 bytes
  const pad = (4 - (newCoffeeJpg.length % 4)) % 4;
  const paddedCoffee = Buffer.concat([newCoffeeJpg, Buffer.alloc(pad)]);
  
  const newByteOffset = oldBv.byteOffset;
  const oldByteLength = oldBv.byteLength;
  const newByteLength = newCoffeeJpg.length;
  
  const diff = paddedCoffee.length - oldByteLength;
  
  // Update oldBv
  oldBv.byteLength = newByteLength;
  
  // Update all bufferViews after oldBv
  gltf.bufferViews.forEach((bv, idx) => {
    if (idx !== coffeeImg.bufferView && bv.byteOffset > oldBv.byteOffset) {
      bv.byteOffset += diff;
    }
  });
  
  const newBin = Buffer.concat([beforeBv, paddedCoffee, afterBv]);
  
  // Now encode glTF JSON
  let newJsonStr = JSON.stringify(gltf);
  // Pad JSON to 4 bytes with spaces (0x20)
  const jsonPad = (4 - (Buffer.byteLength(newJsonStr) % 4)) % 4;
  newJsonStr += ' '.repeat(jsonPad);
  const newJsonBuf = Buffer.from(newJsonStr, 'utf8');
  
  // New GLB header
  const totalLength = 12 + 8 + newJsonBuf.length + 8 + newBin.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // magic
  header.writeUInt32LE(2, 4); // version
  header.writeUInt32LE(totalLength, 8); // length
  
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(newJsonBuf.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'
  
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(newBin.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'
  
  const finalGlb = Buffer.concat([header, jsonChunkHeader, newJsonBuf, binChunkHeader, newBin]);
  fs.writeFileSync('public/assets/products/mug/mug_optimized.glb', finalGlb);
  console.log(`Original mug: ${(originalGlb.length / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Optimized mug: ${(finalGlb.length / (1024 * 1024)).toFixed(2)} MB`);
}

repackGLBWithOptimizedImage();
