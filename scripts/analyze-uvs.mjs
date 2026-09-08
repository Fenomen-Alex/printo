import fs from 'fs';

function analyzeUVs(filePath, primIndex = 0) {
  const buffer = fs.readFileSync(filePath);
  const jsonLength = buffer.readUInt32LE(12);
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength));
  
  // Binary buffer chunk begins at 20 + jsonLength
  const binChunkOffset = 20 + jsonLength;
  const binLength = buffer.readUInt32LE(binChunkOffset);
  const binDataOffset = binChunkOffset + 8;
  const binBuffer = buffer.subarray(binDataOffset, binDataOffset + binLength);
  
  const mesh = gltf.meshes[0];
  const prim = mesh.primitives[primIndex];
  const uvAccessor = gltf.accessors[prim.attributes.TEXCOORD_0];
  const uvBufferView = gltf.bufferViews[uvAccessor.bufferView];
  
  const byteOffset = (uvBufferView.byteOffset || 0) + (uvAccessor.byteOffset || 0);
  const count = uvAccessor.count;
  
  let minU = Infinity, maxU = -Infinity;
  let minV = Infinity, maxV = -Infinity;
  
  const sampleUVs = [];
  
  for (let i = 0; i < count; i++) {
    const u = binBuffer.readFloatLE(byteOffset + i * 8);
    const v = binBuffer.readFloatLE(byteOffset + i * 8 + 4);
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
    if (i < 5 || i % Math.floor(count / 10) === 0) {
      sampleUVs.push({ i, u: +u.toFixed(4), v: +v.toFixed(4) });
    }
  }
  
  console.log(`\n--- UV Analysis for ${filePath} (Primitive ${primIndex}) ---`);
  console.log(`Vertex count: ${count}`);
  console.log(`U range: [${minU.toFixed(4)}, ${maxU.toFixed(4)}]`);
  console.log(`V range: [${minV.toFixed(4)}, ${maxV.toFixed(4)}]`);
  console.log('Sample UVs:', sampleUVs.slice(0, 8));
  
  // Also check vertex positions to UV mapping correlation (for front / back / cylindrical wrapping)
  const posAccessor = gltf.accessors[prim.attributes.POSITION];
  const posBufferView = gltf.bufferViews[posAccessor.bufferView];
  const posByteOffset = (posBufferView.byteOffset || 0) + (posAccessor.byteOffset || 0);
  
  const samples = [];
  for (let i = 0; i < Math.min(count, 10); i++) {
    const x = binBuffer.readFloatLE(posByteOffset + i * 12);
    const y = binBuffer.readFloatLE(posByteOffset + i * 12 + 4);
    const z = binBuffer.readFloatLE(posByteOffset + i * 12 + 8);
    const u = binBuffer.readFloatLE(byteOffset + i * 8);
    const v = binBuffer.readFloatLE(byteOffset + i * 8 + 4);
    samples.push({
      pos: [x.toFixed(3), y.toFixed(3), z.toFixed(3)],
      uv: [u.toFixed(3), v.toFixed(3)]
    });
  }
  console.log('Sample Pos -> UV:', samples.slice(0, 5));
}

analyzeUVs('public/assets/products/mug/mug.glb', 0);
analyzeUVs('public/assets/products/tshirt/tshirt.glb', 0);
