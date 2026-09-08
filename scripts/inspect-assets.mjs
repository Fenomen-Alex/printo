import fs from 'fs';
import path from 'path';

// Let's parse the GLB binary directly to extract chunks and JSON metadata
function inspectGLB(filePath) {
  const buffer = fs.readFileSync(filePath);
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) { // 'glTF'
    throw new Error('Not a valid GLB file');
  }
  const version = buffer.readUInt32LE(4);
  const totalLength = buffer.readUInt32LE(8);
  
  // First chunk: JSON
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16); // 0x4E4F534A 'JSON'
  
  const jsonString = buffer.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonString);
  
  console.log(`\n========================================`);
  console.log(`Inspecting: ${path.basename(filePath)} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`========================================`);
  console.log(`glTF Version: ${version}`);
  console.log(`Generator: ${gltf.asset?.generator || 'Unknown'}`);
  console.log(`Meshes count: ${gltf.meshes?.length || 0}`);
  
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, mIdx) => {
      console.log(`\nMesh [${mIdx}]: "${mesh.name || 'unnamed'}"`);
      mesh.primitives.forEach((prim, pIdx) => {
        const mat = prim.material !== undefined ? gltf.materials?.[prim.material] : null;
        console.log(`  Primitive [${pIdx}]:`);
        console.log(`    Material: "${mat?.name || 'default'}" (index: ${prim.material})`);
        if (mat?.pbrMetallicRoughness) {
          console.log(`      BaseColorFactor:`, mat.pbrMetallicRoughness.baseColorFactor);
          console.log(`      BaseColorTexture:`, mat.pbrMetallicRoughness.baseColorTexture);
          console.log(`      RoughnessFactor:`, mat.pbrMetallicRoughness.roughnessFactor);
          console.log(`      MetallicFactor:`, mat.pbrMetallicRoughness.metallicFactor);
        }
        if (mat?.normalTexture) console.log(`      NormalTexture:`, mat.normalTexture);
        if (mat?.occlusionTexture) console.log(`      OcclusionTexture:`, mat.occlusionTexture);

        const posAccessor = prim.attributes.POSITION !== undefined ? gltf.accessors[prim.attributes.POSITION] : null;
        const uvAccessor = prim.attributes.TEXCOORD_0 !== undefined ? gltf.accessors[prim.attributes.TEXCOORD_0] : null;
        const normalAccessor = prim.attributes.NORMAL !== undefined ? gltf.accessors[prim.attributes.NORMAL] : null;
        const indicesAccessor = prim.indices !== undefined ? gltf.accessors[prim.indices] : null;

        console.log(`    Attributes:`);
        if (posAccessor) {
          console.log(`      POSITION: count=${posAccessor.count}, min=${JSON.stringify(posAccessor.min)}, max=${JSON.stringify(posAccessor.max)}`);
        }
        if (normalAccessor) {
          console.log(`      NORMAL: count=${normalAccessor.count}`);
        }
        if (uvAccessor) {
          console.log(`      TEXCOORD_0 (UV): count=${uvAccessor.count}, min=${JSON.stringify(uvAccessor.min)}, max=${JSON.stringify(uvAccessor.max)}`);
        }
        if (indicesAccessor) {
          console.log(`      INDICES: count=${indicesAccessor.count} (~${indicesAccessor.count / 3} triangles)`);
        }
      });
    });
  }

  if (gltf.nodes) {
    console.log(`\nNodes hierarchy:`);
    gltf.nodes.forEach((node, nIdx) => {
      console.log(`  Node [${nIdx}]: "${node.name}" (mesh: ${node.mesh !== undefined ? node.mesh : 'none'}, children: ${JSON.stringify(node.children || [])})`);
      if (node.translation) console.log(`    translation:`, node.translation);
      if (node.rotation) console.log(`    rotation:`, node.rotation);
      if (node.scale) console.log(`    scale:`, node.scale);
    });
  }

  if (gltf.images) {
    console.log(`\nEmbedded Images (${gltf.images.length}):`);
    gltf.images.forEach((img, iIdx) => {
      console.log(`  Image [${iIdx}]: "${img.name || 'unnamed'}", mimeType: ${img.mimeType}, bufferView: ${img.bufferView}`);
    });
  }
}

inspectGLB('public/assets/products/mug/mug.glb');
inspectGLB('public/assets/products/tshirt/tshirt.glb');
