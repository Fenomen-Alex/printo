import fs from 'fs';

function getPngDimensions(buf) {
  if (buf.readUInt32BE(0) !== 0x89504E47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function getJpgDimensions(buf) {
  let offset = 2;
  while (offset < buf.length) {
    const marker = buf.readUInt16BE(offset);
    offset += 2;
    if (marker === 0xFFC0 || marker === 0xFFC2) {
      return { height: buf.readUInt16BE(offset + 3), width: buf.readUInt16BE(offset + 5) };
    }
    const len = buf.readUInt16BE(offset);
    offset += len;
  }
  return null;
}

const mugLogo = fs.readFileSync('public/assets/products/mug/image_0_logo.png');
const mugCoffee = fs.readFileSync('public/assets/products/mug/image_1_coffee.png');
const tshirtNormal = fs.readFileSync('public/assets/products/tshirt/image_0_Image_0.jpg');
const tshirtOcc = fs.readFileSync('public/assets/products/tshirt/image_1_Image_1.jpg');

console.log('Mug Logo texture:', getPngDimensions(mugLogo));
console.log('Mug Coffee texture:', getPngDimensions(mugCoffee));
console.log('T-shirt Normal map:', getJpgDimensions(tshirtNormal));
console.log('T-shirt Occlusion map:', getJpgDimensions(tshirtOcc));
