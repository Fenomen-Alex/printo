import './index.css';
import { PRODUCTS } from './data/products';
import { TEMPLATES } from './data/templates';
import { ProductDefinition, DesignDocument, DesignElement, TextElement, ImageElement } from './types';
import { PrintCompositor } from './core/compositor';
import { ProductViewer } from './core/viewer';
import { AppUI } from './ui/app-ui';

class PrintoApp {
  private currentProduct: ProductDefinition;
  private designDoc: DesignDocument;
  private compositor: PrintCompositor;
  private viewer: ProductViewer;
  private ui: AppUI;
  private loadingOverlay: HTMLElement;

  constructor() {
    const root = document.getElementById('root');
    if (!root) throw new Error('Root element #root not found');

    root.innerHTML = `
      <div id="canvas-container" class="absolute inset-0 w-full h-full"></div>
      <div id="ui-container" class="absolute inset-0 w-full h-full pointer-events-none"></div>
      
      <!-- Initial Loading Screen -->
      <div id="loading-overlay" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F6F8] transition-opacity duration-500 ease-out">
        <div class="flex flex-col items-center gap-4">
          <span class="text-5xl font-bold tracking-tight text-stone-900 animate-pulse" style="font-family: 'Caveat', cursive;">Printo</span>
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
            <div class="w-2 h-2 rounded-full bg-stone-900 animate-bounce"></div>
            <span>Loading 3D Studio...</span>
          </div>
        </div>
      </div>
    `;

    const canvasContainer = document.getElementById('canvas-container')!;
    const uiContainer = document.getElementById('ui-container')!;
    this.loadingOverlay = document.getElementById('loading-overlay')!;

    // Initial product
    this.currentProduct = PRODUCTS[0]; // Ceramic Mug

    // Initial default design document with starter artwork & typography
    this.designDoc = {
      productColor: this.currentProduct.defaultBaseColor,
      elements: []
    };

    // Instantiate core systems
    this.compositor = new PrintCompositor();
    this.viewer = new ProductViewer(canvasContainer);

    // Link compositor updates to viewer texture
    this.compositor.setOnUpdate(() => {
      this.viewer.updateTexture();
    });

    // Instantiate UI
    this.ui = new AppUI(uiContainer, this.currentProduct, this.designDoc, {
      onSelectProduct: (id) => this.selectProduct(id),
      onUpdateProductColor: (hex) => this.updateProductColor(hex),
      onAddImage: (dataUrl) => this.addImage(dataUrl),
      onUpdateImage: (updates) => this.updateImage(updates),
      onRemoveImage: () => this.removeImage(),
      onAddText: (txt, opts) => this.addText(txt, opts),
      onUpdateText: (id, updates) => this.updateText(id, updates),
      onRemoveText: (id) => this.removeText(id),
      onApplyTemplate: (tid) => this.applyTemplate(tid),
      onResetCamera: () => this.viewer.resetCamera(),
      onToggleAutoRotate: (enabled) => this.viewer.setAutoRotate(enabled),
      onSnapshot: () => this.viewer.downloadSnapshot(`printo-${this.currentProduct.id}-${Date.now()}.png`)
    });

    // Initialize initial starter template and load product
    this.init();
  }

  private async init() {
    // Apply first template by default
    await this.applyTemplate(TEMPLATES[0].id);

    try {
      await this.viewer.loadProduct(this.currentProduct, this.compositor.getCanvas());
      this.compositor.render(this.currentProduct, this.designDoc, true);
    } catch (err) {
      console.error('Failed to initialize 3D model:', err);
    } finally {
      this.hideLoading();
    }
  }

  private hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        this.loadingOverlay.style.display = 'none';
      }, 500);
    }
  }

  private showLoading(text = 'Loading product...') {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'flex';
      this.loadingOverlay.classList.remove('opacity-0', 'pointer-events-none');
      const label = this.loadingOverlay.querySelector('span:last-child');
      if (label) label.textContent = text;
    }
  }

  private async selectProduct(productId: string) {
    if (this.currentProduct.id === productId) return;

    const nextProduct = PRODUCTS.find((p) => p.id === productId);
    if (!nextProduct) return;

    this.showLoading(`Loading ${nextProduct.name}...`);

    this.currentProduct = nextProduct;
    // Set matching product color if current doesn't match available
    const hasColor = nextProduct.availableColors.some(
      (c) => c.hex.toLowerCase() === this.designDoc.productColor.toLowerCase()
    );
    if (!hasColor) {
      this.designDoc.productColor = nextProduct.defaultBaseColor;
    }

    try {
      // Re-composite 2D texture for new product dimensions & UV unwrap
      this.compositor.render(this.currentProduct, this.designDoc, true);
      // Load 3D model
      await this.viewer.loadProduct(this.currentProduct, this.compositor.getCanvas());
      this.viewer.updateProductColor(this.designDoc.productColor);
      this.ui.updateState(this.currentProduct, this.designDoc);
    } catch (err) {
      console.error('Error switching product:', err);
    } finally {
      this.hideLoading();
    }
  }

  private updateProductColor(hex: string) {
    this.designDoc.productColor = hex;
    this.viewer.updateProductColor(hex);
    this.compositor.render(this.currentProduct, this.designDoc);
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private async addImage(dataUrl: string) {
    try {
      const img = await this.compositor.preloadImage(dataUrl);
      const aspect = img.naturalWidth / (img.naturalHeight || 1);

      // Replace existing image or add new
      const existingImgIndex = this.designDoc.elements.findIndex((e) => e.type === 'image');
      const newElem: ImageElement = {
        id: `img-${Date.now()}`,
        type: 'image',
        src: dataUrl,
        imageElement: img,
        aspectRatio: aspect,
        x: 0.5,
        y: 0.44,
        scale: 0.5,
        rotation: 0,
        opacity: 1,
        visible: true
      };

      if (existingImgIndex >= 0) {
        this.designDoc.elements[existingImgIndex] = newElem;
      } else {
        // Place image behind text
        this.designDoc.elements.unshift(newElem);
      }

      this.compositor.render(this.currentProduct, this.designDoc);
      this.ui.updateState(this.currentProduct, this.designDoc);
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  }

  private updateImage(updates: Partial<ImageElement>) {
    const img = this.designDoc.elements.find((e) => e.type === 'image') as ImageElement | undefined;
    if (!img) return;

    Object.assign(img, updates);
    this.compositor.render(this.currentProduct, this.designDoc);
  }

  private removeImage() {
    this.designDoc.elements = this.designDoc.elements.filter((e) => e.type !== 'image');
    this.compositor.render(this.currentProduct, this.designDoc);
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private addText(text: string, options?: Partial<TextElement>) {
    const newText: TextElement = {
      id: `txt-${Date.now()}`,
      type: 'text',
      text,
      fontFamily: options?.fontFamily || 'Plus Jakarta Sans',
      fontSize: options?.fontSize || 32,
      fontWeight: options?.fontWeight || '700',
      fontStyle: options?.fontStyle || 'normal',
      color: options?.color || '#111827',
      textAlign: options?.textAlign || 'center',
      x: options?.x ?? 0.5,
      y: options?.y ?? 0.75,
      scale: options?.scale ?? 1,
      rotation: options?.rotation ?? 0,
      opacity: 1,
      visible: true
    };

    this.designDoc.elements.push(newText);
    this.compositor.render(this.currentProduct, this.designDoc);
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private updateText(id: string, updates: Partial<TextElement>) {
    const item = this.designDoc.elements.find((e) => e.id === id);
    if (!item || item.type !== 'text') return;

    Object.assign(item, updates);
    this.compositor.render(this.currentProduct, this.designDoc);
  }

  private removeText(id: string) {
    this.designDoc.elements = this.designDoc.elements.filter((e) => e.id !== id);
    this.compositor.render(this.currentProduct, this.designDoc);
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private async applyTemplate(templateId: string) {
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    const newElements: DesignElement[] = [];

    for (const el of tmpl.elements) {
      if (el.type === 'image' && el.svgMarkup) {
        const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(el.svgMarkup)}`;
        const img = await this.compositor.preloadImage(svgDataUrl);
        newElements.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'image',
          src: svgDataUrl,
          imageElement: img,
          aspectRatio: 1,
          x: el.x,
          y: el.y,
          scale: el.scale,
          rotation: el.rotation,
          opacity: 1,
          visible: true
        });
      } else if (el.type === 'text' && el.text) {
        newElements.push({
          id: `txt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'text',
          text: el.text,
          fontFamily: el.fontFamily || 'Plus Jakarta Sans',
          fontSize: el.fontSize || 28,
          fontWeight: el.fontWeight || '700',
          fontStyle: el.fontStyle || 'normal',
          color: el.color || '#111827',
          textAlign: el.textAlign || 'center',
          x: el.x,
          y: el.y,
          scale: el.scale,
          rotation: el.rotation,
          opacity: 1,
          visible: true
        });
      }
    }

    this.designDoc.elements = newElements;
    this.compositor.render(this.currentProduct, this.designDoc, true);
    this.ui.updateState(this.currentProduct, this.designDoc);
  }
}

// Bootstrap app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new PrintoApp();
});
