export type {
  UVBounds,
  UVPrintableSurface,
  PrintableSurface,
  ProductColorOption,
  ProductMaterialProperties,
  MaterialOverride,
  ProductCameraConfig,
  ProductConfig,
  ImageElementOptions,
  ImageUpdateOptions,
  TextElementOptions,
  DesignElementBase,
  DesignElement,
  DesignDocument,
  PrintoEventMap,
  PrintoEventKey,
  PrintoEventHandler,
  PrintoConfiguratorOptions,
  PrintoConfigurator,
} from 'printo-engine';

import type { ImageDesignElement, TextDesignElement } from 'printo-engine';

// Demo-facing aliases for the canonical package names
export type ImageElement = ImageDesignElement;
export type TextElement = TextDesignElement;

// Demo-owned template concept (not part of the reusable package API)
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