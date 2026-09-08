import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Setup minimal mock for GLTFLoader in Node
globalThis.self = globalThis;

console.log('Three.js version:', THREE.REVISION);
console.log('Testing GLB files existence:');
console.log('Mug size:', (fs.statSync('public/assets/products/mug/mug_optimized.glb').size / 1024).toFixed(1), 'KB');
console.log('T-Shirt size:', (fs.statSync('public/assets/products/tshirt/tshirt.glb').size / 1024).toFixed(1), 'KB');
