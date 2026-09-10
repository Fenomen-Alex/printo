import { ProductConfig, ProductCameraConfig } from '../types';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const MUG_CAMERA_DEFAULT: ProductCameraConfig = {
  initialPosition: [0, 2, 17],
  target: [0, 0.5, 0],
  minDistance: 7,
  maxDistance: 32,
  fov: 42
};

export const MUG_CAMERA_NARROW: ProductCameraConfig = {
  initialPosition: [26, 2, 15],
  target: [0, 0.5, 0],
  minDistance: 7,
  maxDistance: 42,
  fov: 42
};

export const MUG_NARROW_PORTRAIT_ASPECT = 0.6;

export function getMugCamera(aspect: number): ProductCameraConfig {
  return aspect <= MUG_NARROW_PORTRAIT_ASPECT ? MUG_CAMERA_NARROW : MUG_CAMERA_DEFAULT;
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'ceramic-mug',
    name: 'Ceramic Coffee Mug',
    model: `${base}/assets/products/mug/model.glb`,
    defaultBaseColor: '#FFFFFF',
    availableColors: [
      { name: 'Ceramic White', hex: '#FFFFFF' },
      { name: 'Warm Cream', hex: '#F7F4EA' },
      { name: 'Matte Charcoal', hex: '#26292E' },
      { name: 'Deep Cobalt', hex: '#1C355E' },
      { name: 'Nordic Sage', hex: '#587364' },
      { name: 'Earthy Terracotta', hex: '#A8533F' },
      { name: 'Pastel Blush', hex: '#E2B8BB' }
    ],
    material: {
      roughness: 0.15,
      metalness: 0.04,
      clearcoat: 0.4
    },
    materialOverrides: [
      {
        materialName: 'Coffee',
        color: '#3D1E0C',
        roughness: 0.2,
        clearcoat: 0.6
      }
    ],
    printableSurfaces: [
      {
        id: 'mug-outer-wrap',
        name: 'Full Body Cylindrical Wrap',
        strategy: 'uv',
        meshName: 'Coffee-Mug',
        materialName: 'Logo',
        uvBounds: {
          uMin: 0.0911,
          uMax: 0.9147,
          vMin: 0.1390,
          vMax: 0.7715
        },
        printableWidthMm: 198,
        printableHeightMm: 80,
        textureResolution: {
          width: 2048,
          height: 1024
        }
      }
    ],
    camera: { ...MUG_CAMERA_DEFAULT }
  },
  {
    id: 'tshirt-sporty',
    name: 'Classic Regular T-Shirt',
    model: `${base}/assets/products/tshirt/model.glb`,
    defaultBaseColor: '#E5E7EB',
    availableColors: [
      { name: 'Clean White', hex: '#FAFAFA' },
      { name: 'Heather Gray', hex: '#D1D5DB' },
      { name: 'Asphalt Black', hex: '#23272E' },
      { name: 'Navy Blue', hex: '#1E293B' },
      { name: 'Forest Green', hex: '#1E3A2F' },
      { name: 'Burgundy Wine', hex: '#5C1D24' },
      { name: 'Vintage Olive', hex: '#4A5038' }
    ],
    material: {
      roughness: 0.88,
      metalness: 0.02
    },
    printableSurfaces: [
      {
        id: 'tshirt-front-chest',
        name: 'Front Chest Graphic Area',
        strategy: 'uv',
        meshName: 'T_Shirt_male',
        materialName: 'lambert1',
        printableWidthMm: 280,
        printableHeightMm: 350,
        textureResolution: {
          width: 1024,
          height: 1024
        }
      }
    ],
    camera: {
      initialPosition: [0, 0, 1.2],
      target: [0, -0.06, 0],
      minDistance: 0.5,
      maxDistance: 2.6,
      fov: 40
    }
  }
];