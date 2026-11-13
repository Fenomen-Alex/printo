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
  },
  {
    id: 'hoodie-pullover',
    name: 'Pullover Hoodie',
    model: `${base}/assets/products/hoodie/model.glb`,
    defaultBaseColor: '#E5E7EB',
    availableColors: [
      { name: 'White', hex: '#FAFAFA' }, { name: 'Heather Gray', hex: '#9CA3AF' },
      { name: 'Black', hex: '#23272E' }, { name: 'Navy', hex: '#1E293B' },
      { name: 'Forest', hex: '#1E3A2F' }, { name: 'Burgundy', hex: '#5C1D24' },
    ],
    material: { roughness: 0.9, metalness: 0 },
    materialOverrides: [
      { materialName: 'Drawstring', color: '#F3F4F6', roughness: 0.8 },
      { materialName: 'Metal', color: '#B8BCC4', roughness: 0.35 },
    ],
    camera: { initialPosition: [0, 0, 1.35], target: [0, 0, 0], minDistance: 0.55, maxDistance: 3, fov: 40 },
    printableSurfaces: [
      { id: 'hoodie-front', name: 'Front Chest', strategy: 'uv', meshName: 'Hoodie_Front', materialName: 'Print_Front',
        printableWidthMm: 280, printableHeightMm: 280, textureResolution: { width: 1536, height: 1536 } },
      { id: 'hoodie-back', name: 'Back', strategy: 'uv', meshName: 'Hoodie_Back', materialName: 'Print_Back',
        printableWidthMm: 280, printableHeightMm: 280, textureResolution: { width: 1536, height: 1536 } },
    ],
  },
  {
    id: 'iphone-case',
    name: 'iPhone Case',
    model: `${base}/assets/products/phone-case/model.glb`,
    defaultBaseColor: '#FFFFFF',
    availableColors: [
      { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1F2933' },
      { name: 'Navy', hex: '#1E3A5F' }, { name: 'Sage', hex: '#9CB5A0' }, { name: 'Blush', hex: '#EBC8C4' },
    ],
    material: { roughness: 0.4, metalness: 0, clearcoat: 0.3 },
    camera: { initialPosition: [0, 0, 0.33], target: [0, 0, 0], minDistance: 0.16, maxDistance: 0.9, fov: 38 },
    printableSurfaces: [
      { id: 'case-back', name: 'Back Panel', strategy: 'uv', meshName: 'Case_Back', materialName: 'Print',
        printableWidthMm: 71.5, printableHeightMm: 147.5, textureResolution: { width: 1024, height: 2112 } },
    ],
  },
  {
    id: 'fitness-bottle',
    name: 'Fitness Bottle',
    model: `${base}/assets/products/bottle/model.glb`,
    defaultBaseColor: '#FFFFFF',
    availableColors: [
      { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1F2933' },
      { name: 'Cobalt', hex: '#1C4FA0' }, { name: 'Mint', hex: '#3FBF9F' }, { name: 'Coral', hex: '#E8604C' },
    ],
    material: { roughness: 0.32, metalness: 0, clearcoat: 0.25 },
    materialOverrides: [
      { materialName: 'Lid', color: '#1F2933', roughness: 0.5 },
      { materialName: 'Accent', color: '#22C55E', roughness: 0.35 },
    ],
    camera: { initialPosition: [0, 0.01, 0.55], target: [0, -0.01, 0], minDistance: 0.22, maxDistance: 1.4, fov: 40 },
    printableSurfaces: [
      { id: 'bottle-wrap', name: 'Wrap Label', strategy: 'uv', meshName: 'Bottle_Body', materialName: 'Print',
        printableWidthMm: 229, printableHeightMm: 143, textureResolution: { width: 2048, height: 1280 } },
    ],
  },
  {
    id: 'backpack-daypack',
    name: 'Daypack Backpack',
    model: `${base}/assets/products/backpack/model.glb`,
    defaultBaseColor: '#E5E7EB',
    availableColors: [
      { name: 'White', hex: '#FAFAFA' }, { name: 'Heather Gray', hex: '#9CA3AF' },
      { name: 'Black', hex: '#23272E' }, { name: 'Navy', hex: '#1E293B' },
      { name: 'Olive', hex: '#4B5738' }, { name: 'Rust', hex: '#A4492B' },
    ],
    material: { roughness: 0.85, metalness: 0 },
    materialOverrides: [
      { materialName: 'Base', color: '#1F2933', roughness: 0.8 },
      { materialName: 'Strap', color: '#2B2F36', roughness: 0.9 },
      { materialName: 'Zipper', color: '#1F2933', roughness: 0.45, metalness: 0.3 },
    ],
    camera: { initialPosition: [0, 0, 0.95], target: [0, 0, 0], minDistance: 0.4, maxDistance: 2.2, fov: 40 },
    printableSurfaces: [
      { id: 'backpack-front', name: 'Front Panel', strategy: 'uv', meshName: 'Backpack_Front', materialName: 'Print',
        printableWidthMm: 230, printableHeightMm: 180, textureResolution: { width: 1536, height: 1200 } },
    ],
  },
  {
    id: 'baseball-cap',
    name: 'Baseball Cap',
    model: `${base}/assets/products/cap/model.glb`,
    defaultBaseColor: '#E5E7EB',
    availableColors: [
      { name: 'White', hex: '#FAFAFA' }, { name: 'Black', hex: '#23272E' },
      { name: 'Navy', hex: '#1E293B' }, { name: 'Khaki', hex: '#B8A57E' },
      { name: 'Red', hex: '#B3262E' }, { name: 'Forest', hex: '#1E3A2F' },
    ],
    material: { roughness: 0.9, metalness: 0 },
    materialOverrides: [
      { materialName: 'Strap', color: '#2B2F36', roughness: 0.9 },
      { materialName: 'Band', color: '#2B2F36', roughness: 0.95 },
    ],
    camera: { initialPosition: [0.15, 0.10, 0.45], target: [0, 0, 0], minDistance: 0.2, maxDistance: 1.2, fov: 38 },
    printableSurfaces: [
      { id: 'cap-front', name: 'Front Panel', strategy: 'uv', meshName: 'Cap_Front', materialName: 'Print',
        printableWidthMm: 110, printableHeightMm: 59, textureResolution: { width: 1536, height: 820 } },
    ],
  },
];