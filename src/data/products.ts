import { ProductDefinition } from '../types';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const PRODUCTS: ProductDefinition[] = [
  {
    id: 'ceramic-mug',
    name: 'Ceramic Coffee Mug',
    category: 'drinkware',
    modelPath: `${base}/assets/products/mug/model.glb`,
    mappingStrategy: 'uv',
    printableMeshName: 'Coffee-Mug',
    printableMaterialName: 'Logo',
    ceramicPartNames: ['Base', 'Bevel', 'Inner', 'Handle'],
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
    materials: {
      roughness: 0.15,
      metalness: 0.04,
      clearcoat: 0.4
    },
    printableRegion: {
      id: 'mug-outer-wrap',
      name: 'Full Body Cylindrical Wrap',
      widthMm: 198,
      heightMm: 80,
      aspectRatio: 2.475,
      uvBounds: {
        uMin: 0.0911,
        uMax: 0.9147,
        vMin: 0.1390,
        vMax: 0.7715
      },
      textureResolution: {
        width: 2048,
        height: 1024
      }
    },
    camera: {
      initialPosition: [0, 2, 17],
      target: [0, 0.5, 0],
      minDistance: 7,
      maxDistance: 32,
      fov: 42
    }
  },
  {
    id: 'tshirt-sporty',
    name: 'Classic Regular T-Shirt',
    category: 'apparel',
    modelPath: `${base}/assets/products/tshirt/model.glb`,
    mappingStrategy: 'hybrid',
    printableMeshName: 'T_Shirt_male',
    printableMaterialName: 'lambert1',
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
    materials: {
      roughness: 0.88,
      metalness: 0.02
    },
    printableRegion: {
      id: 'tshirt-front-chest',
      name: 'Front Chest Graphic Area',
      widthMm: 280,
      heightMm: 350,
      aspectRatio: 0.8,
      projection: {
        defaultPosition: [0, 0.04, 0.15],
        defaultRotation: [0, 0, 0],
        defaultScale: [0.18, 0.18, 0.18]
      },
      textureResolution: {
        width: 1024,
        height: 1024
      }
    },
    camera: {
      initialPosition: [0, 0, 1.2],
      target: [0, -0.06, 0],
      minDistance: 0.5,
      maxDistance: 2.6,
      fov: 40
    }
  }
];
