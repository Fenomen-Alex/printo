import './index.css';
import { createPrinto, PrintoConfigurator } from 'printo-engine';
import { PRODUCTS, getMugCamera, MUG_NARROW_PORTRAIT_ASPECT } from './data/products';
import { TEMPLATES } from './data/templates';
import { ProductConfig, DesignDocument, TextElement, ImageElement } from './types';
import { AppUI } from './ui/app-ui';

class PrintoApp {
  private currentProduct: ProductConfig;
  private designDoc: DesignDocument;
  private configurator: PrintoConfigurator;
  private ui: AppUI;
  private loadingOverlay: HTMLElement;
  private narrowPortrait: boolean;

  private applyResponsiveMugCamera() {
    const mug = PRODUCTS.find((p) => p.id === 'ceramic-mug');
    if (!mug) return;
    Object.assign(mug.camera, getMugCamera(window.innerWidth / window.innerHeight));
  }

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
    this.narrowPortrait = window.innerWidth / window.innerHeight <= MUG_NARROW_PORTRAIT_ASPECT;
    this.applyResponsiveMugCamera();

    // Initial default design document with starter artwork & typography
    this.designDoc = {
      productColor: this.currentProduct.defaultBaseColor,
      elements: []
    };

    // Instantiate the reusable engine
    this.configurator = createPrinto({
      container: canvasContainer,
      products: PRODUCTS,
      initialProductId: this.currentProduct.id,
      onLoadingStarted: () => this.showLoading('Loading product...'),
      onLoadingCompleted: () => this.hideLoading(),
      onError: (e) => console.error('Printo error:', e.message, e.originalError)
    });

    // Instantiate UI
    this.ui = new AppUI(uiContainer, PRODUCTS, this.currentProduct, this.designDoc, {
      onSelectProduct: (id) => this.selectProduct(id),
      onUpdateProductColor: (hex) => this.updateProductColor(hex),
      onAddImage: (dataUrl) => this.addImage(dataUrl),
      onUpdateImage: (updates) => this.updateImage(updates),
      onRemoveImage: () => this.removeImage(),
      onAddText: (txt, opts) => this.addText(txt, opts),
      onUpdateText: (id, updates) => this.updateText(id, updates),
      onRemoveText: (id) => this.removeText(id),
      onApplyTemplate: (tid) => this.applyTemplate(tid),
      onResetDesign: () => this.resetDesign(),
      onResetCamera: () => this.configurator.resetCamera(),
      onToggleAutoRotate: (enabled) => this.configurator.setAutoRotate(enabled),
      onSnapshot: () => this.configurator.downloadSnapshot(`printo-${this.currentProduct.id}-${Date.now()}.png`)
    });

    // Initialize initial starter template and load product
    this.init();

    // Re-target the mug camera when crossing into/out of extreme portrait
    window.addEventListener('resize', () => {
      const narrow = window.innerWidth / window.innerHeight <= MUG_NARROW_PORTRAIT_ASPECT;
      if (narrow !== this.narrowPortrait) {
        this.narrowPortrait = narrow;
        this.applyResponsiveMugCamera();
        if (this.currentProduct.id === 'ceramic-mug') {
          this.configurator.resetCamera();
        }
      }
    });
  }

  private async init() {
    try {
      await this.configurator.init();
      await this.applyTemplate(TEMPLATES[0].id);
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
      await this.configurator.setProduct(productId);
      this.designDoc = this.configurator.getCurrentDesign();
      this.ui.updateState(this.currentProduct, this.designDoc);
    } catch (err) {
      console.error('Error switching product:', err);
    } finally {
      this.hideLoading();
    }
  }

  private updateProductColor(hex: string) {
    this.designDoc.productColor = hex;
    this.configurator.setProductColor(hex);
    this.designDoc = this.configurator.getCurrentDesign();
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private resetDesign() {
    this.configurator.resetDesign();
    this.designDoc = this.configurator.getCurrentDesign();
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private async addImage(dataUrl: string) {
    try {
      await this.configurator.addImage(dataUrl);
      this.designDoc = this.configurator.getCurrentDesign();
      this.ui.updateState(this.currentProduct, this.designDoc);
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  }

  private updateImage(updates: Partial<ImageElement>) {
    this.configurator.updateImage(updates);
  }

  private removeImage() {
    this.configurator.removeImage();
    this.designDoc = this.configurator.getCurrentDesign();
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private addText(text: string, options?: Partial<TextElement>) {
    this.configurator.addText(text, options);
    this.designDoc = this.configurator.getCurrentDesign();
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private updateText(id: string, updates: Partial<TextElement>) {
    this.configurator.updateText(id, updates);
  }

  private removeText(id: string) {
    this.configurator.removeText(id);
    this.designDoc = this.configurator.getCurrentDesign();
    this.ui.updateState(this.currentProduct, this.designDoc);
  }

  private async applyTemplate(templateId: string) {
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    // Preserve the current product color across the reset
    const color = this.configurator.getCurrentDesign().productColor;
    this.configurator.resetDesign();
    this.configurator.setProductColor(color);

    // Apply template elements through the public API, in order.
    // Images are added first (they render behind text), then text overlays.
    for (const el of tmpl.elements) {
      if (el.type === 'image' && el.svgMarkup) {
        const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(el.svgMarkup)}`;
        await this.configurator.addImage(svgDataUrl, {
          x: el.x,
          y: el.y,
          scale: el.scale,
          rotation: el.rotation
        });
      } else if (el.type === 'text' && el.text) {
        this.configurator.addText(el.text, {
          fontFamily: el.fontFamily || 'Plus Jakarta Sans',
          fontSize: el.fontSize || 28,
          fontWeight: el.fontWeight || '700',
          fontStyle: el.fontStyle || 'normal',
          color: el.color || '#111827',
          textAlign: el.textAlign || 'center',
          x: el.x,
          y: el.y,
          scale: el.scale,
          rotation: el.rotation
        });
      }
    }

    this.designDoc = this.configurator.getCurrentDesign();
    this.ui.updateState(this.currentProduct, this.designDoc);
  }
}

// Bootstrap app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new PrintoApp();
});