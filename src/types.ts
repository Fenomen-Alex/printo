export type MappingStrategy = 'uv' | 'projection' | 'hybrid';

export interface UVBounds {
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
}

export interface PrintableRegion {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number;
  uvBounds?: UVBounds;
  projection?: {
    defaultPosition: [number, number, number];
    defaultRotation: [number, number, number];
    defaultScale: [number, number, number];
  };
  textureResolution: {
    width: number;
    height: number;
  };
}

export interface ProductColorOption {
  name: string;
  hex: string;
}

export interface ProductDefinition {
  id: string;
  name: string;
  category: 'drinkware' | 'apparel' | 'accessory';
  modelPath: string;
  mappingStrategy: MappingStrategy;
  printableMeshName: string;
  printableMaterialName?: string;
  ceramicPartNames?: string[];
  defaultBaseColor: string;
  availableColors: ProductColorOption[];
  materials: {
    roughness: number;
    metalness: number;
    clearcoat?: number;
  };
  printableRegion: PrintableRegion;
  camera: {
    initialPosition: [number, number, number];
    target: [number, number, number];
    minDistance: number;
    maxDistance: number;
    fov: number;
  };
}

export interface DesignElementBase {
  id: string;
  x: number; // Normalized 0-1 relative to printable region center (0.5 = center)
  y: number; // Normalized 0-1 relative to printable region center (0.5 = center)
  scale: number; // 0.1 - 2.0
  rotation: number; // Degrees 0 - 360
  opacity: number; // 0 - 1
  visible: boolean;
}

export interface ImageElement extends DesignElementBase {
  type: 'image';
  src: string;
  imageElement?: HTMLImageElement;
  aspectRatio: number;
}

export interface TextElement extends DesignElementBase {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number; // 12 - 120
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export type DesignElement = ImageElement | TextElement;

export interface DesignDocument {
  productColor: string;
  elements: DesignElement[];
}

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  elements: Array<{
    type: 'text' | 'image';
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    svgMarkup?: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>;
}
