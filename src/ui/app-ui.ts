import { ProductConfig, DesignDocument, TextElement, ImageElement } from '../types';
import { STARTER_GRAPHICS, TEMPLATES } from '../data/templates';
import { ICONS } from './icons';

export interface AppUIHandlers {
  onSelectProduct: (productId: string) => void;
  onUpdateProductColor: (hex: string) => void;
  onAddImage: (fileDataUrl: string) => void;
  onUpdateImage: (updates: Partial<ImageElement>) => void;
  onRemoveImage: () => void;
  onAddText: (text: string, options?: Partial<TextElement>) => void;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onRemoveText: (id: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onResetDesign: () => void;
  onResetCamera: () => void;
  onToggleAutoRotate: (enabled: boolean) => void;
  onSnapshot: () => void;
}

export class AppUI {
  private container: HTMLElement;
  private handlers: AppUIHandlers;
  private products: ProductConfig[];
  private currentProduct: ProductConfig;
  private designDoc: DesignDocument;
  private activeTab: 'product' | 'artwork' | 'text' | 'templates' = 'product';
  private isAutoRotating = false;
  private isPanelHidden = false;

  constructor(
    container: HTMLElement,
    products: ProductConfig[],
    initialProduct: ProductConfig,
    initialDoc: DesignDocument,
    handlers: AppUIHandlers
  ) {
    this.container = container;
    this.products = products;
    this.currentProduct = initialProduct;
    this.designDoc = initialDoc;
    this.handlers = handlers;

    this.render();
  }

  public updateState(product: ProductConfig, doc: DesignDocument) {
    this.currentProduct = product;
    this.designDoc = doc;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <!-- Top Brand & Action Bar -->
      <header id="printo-header" class="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 pointer-events-none select-none">
        <div class="flex items-center gap-3 pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-stone-200/80">
          <span class="text-3xl font-bold tracking-tight text-stone-900" style="font-family: 'Caveat', cursive;">Printo</span>
          <span class="h-4 w-px bg-stone-300"></span>
          <span class="text-xs font-semibold uppercase tracking-wider text-stone-500 hidden sm:inline">3D Print Configurator</span>
        </div>

        <div class="flex items-center gap-2 pointer-events-auto">
          <!-- Hide / Show Config Panel Toggle -->
          <button id="btn-toggle-panel" class="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl shadow-sm border border-stone-200/80 transition-all hover:border-stone-300 active:scale-95" title="${this.isPanelHidden ? 'Show Configurator Panel' : 'Hide Configurator Panel'}">
            <span class="text-stone-500">${this.isPanelHidden ? ICONS.sliders : ICONS.eyeOff}</span>
            <span class="hidden sm:inline">${this.isPanelHidden ? 'Show Panel' : 'Hide Panel'}</span>
          </button>

          <button id="btn-auto-rotate" class="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl shadow-sm border border-stone-200/80 transition-all hover:border-stone-300 active:scale-95" title="Toggle 360° Auto-Rotation">
            <span class="${this.isAutoRotating ? 'text-amber-600' : 'text-stone-500'}">${ICONS.rotateCw}</span>
            <span class="hidden md:inline">${this.isAutoRotating ? 'Rotating' : 'Spin 360°'}</span>
          </button>

          <button id="btn-reset-cam" class="p-2 text-stone-700 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl shadow-sm border border-stone-200/80 transition-all hover:border-stone-300 active:scale-95" title="Reset Camera View">
            <span class="text-stone-500">${ICONS.refresh}</span>
          </button>

          <button id="btn-snapshot" class="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 backdrop-blur-md rounded-xl shadow-sm transition-all active:scale-95" title="Export High-Res PNG Snapshot">
            <span class="text-amber-400">${ICONS.camera}</span>
            <span>Snapshot PNG</span>
          </button>
        </div>
      </header>

      <!-- Main Controls Panel (Floating Desktop Card / Slide-over Mobile Drawer) -->
      <aside id="printo-panel" class="pointer-events-auto absolute lg:top-20 lg:bottom-6 lg:left-6 z-30 w-full lg:w-96 max-w-full lg:max-h-[calc(100vh-6.5rem)] flex flex-col bg-white/95 backdrop-blur-xl border-t lg:border border-stone-200/90 lg:rounded-3xl shadow-2xl transition-all duration-300 ease-out ${
        this.isPanelHidden
          ? 'hidden lg:-translate-x-[120%] lg:opacity-0 lg:pointer-events-none max-lg:translate-y-full max-lg:pointer-events-none'
          : `lg:translate-x-0 lg:opacity-100`
      }">
        <!-- Panel Header with Title and Collapse Button -->
        <div class="flex items-center justify-between px-4 pt-3 pb-1 border-b border-stone-100">
          <div class="flex items-center gap-2">
            <span class="p-1 rounded-lg bg-stone-100 text-stone-700">${ICONS.sliders}</span>
            <span class="text-xs font-bold uppercase tracking-wider text-stone-800">Customizer</span>
          </div>
          <button id="btn-collapse-panel" class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors" title="Hide Panel">
            <span>Hide</span>
            <span>${ICONS.chevronLeft}</span>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex items-center justify-between border-b border-stone-200/80 px-3 pt-1">
          <button data-tab="product" class="tab-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${
            this.activeTab === 'product'
              ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50/70'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50/40'
          }">
            <span>${ICONS.mug}</span>
            <span>Product</span>
          </button>

          <button data-tab="artwork" class="tab-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${
            this.activeTab === 'artwork'
              ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50/70'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50/40'
          }">
            <span>${ICONS.image}</span>
            <span>Artwork</span>
          </button>

          <button data-tab="text" class="tab-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${
            this.activeTab === 'text'
              ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50/70'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50/40'
          }">
            <span>${ICONS.type}</span>
            <span>Text</span>
          </button>

          <button data-tab="templates" class="tab-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${
            this.activeTab === 'templates'
              ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50/70'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50/40'
          }">
            <span>${ICONS.sparkles}</span>
            <span>Presets</span>
          </button>
        </nav>

        <!-- Tab Content Scrollable Container -->
        <div class="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-stone-800 text-sm">
          ${this.renderTabContent()}
        </div>

        <!-- Panel Footer with Printable Specs Badge -->
        <footer class="px-4 py-3 bg-stone-50/80 border-t border-stone-200/70 lg:rounded-b-3xl flex items-center justify-between text-[11px] text-stone-500">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>${this.currentProduct.printableSurfaces[0].name}</span>
          </div>
          <span class="font-mono">${this.currentProduct.printableSurfaces[0].printableWidthMm} × ${this.currentProduct.printableSurfaces[0].printableHeightMm} mm</span>
        </footer>
      </aside>

      <!-- Floating Restore Panel Button (Visible when panel is collapsed) -->
      ${
        this.isPanelHidden
          ? `
        <button id="btn-floating-open" class="pointer-events-auto absolute bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-3 bg-stone-900/95 hover:bg-stone-900 text-white font-semibold text-xs rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95" title="Open Customizer Panel">
          <span class="text-amber-400">${ICONS.sliders}</span>
          <span>Open Customizer</span>
        </button>
      `
          : ''
      }

      <!-- Bottom Right Subtle 2D Print Unwrap Preview Badge -->
      <div class="hidden md:flex absolute bottom-5 right-6 z-20 flex-col items-end gap-1 pointer-events-none select-none">
        <div class="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-center gap-2">
          <span>Surface Mapping:</span>
          <span class="font-semibold text-stone-800 uppercase">${this.currentProduct.printableSurfaces[0].strategy}</span>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderTabContent(): string {
    switch (this.activeTab) {
      case 'product':
        return this.renderProductTab();
      case 'artwork':
        return this.renderArtworkTab();
      case 'text':
        return this.renderTextTab();
      case 'templates':
        return this.renderTemplatesTab();
      default:
        return '';
    }
  }

  private renderProductTab(): string {
    const surface = this.currentProduct.printableSurfaces[0];
    const material = this.currentProduct.material;

    return `
      <!-- Product Switcher Buttons -->
      <div class="space-y-2">
        <label class="text-xs font-bold uppercase tracking-wider text-stone-500">Blank Product</label>
        <div class="grid grid-cols-2 gap-2.5">
          ${this.products
            .map((p) => {
              const active = this.currentProduct.id === p.id;
              const btnId = `btn-select-${p.id}`;
              return `
            <button id="${btnId}" data-select-product="${p.id}" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
                active
                  ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                  : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
              }">
              <div class="p-2 rounded-xl ${active ? 'bg-white/10' : 'bg-stone-100'}">${this.productIcon(p.id)}</div>
              <span class="font-semibold text-xs">${p.name}</span>
              <span class="text-[10px] ${active ? 'text-stone-300' : 'text-stone-500'}">${p.printableSurfaces[0]?.name || ''}</span>
            </button>
          `;
            })
            .join('')}
        </div>
      </div>

      <!-- Base Color Palette -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold uppercase tracking-wider text-stone-500">Base Material Color</label>
          <span class="text-xs font-mono font-medium text-stone-600">${this.designDoc.productColor}</span>
        </div>
        <div class="flex flex-wrap gap-2.5 pt-1">
          ${this.currentProduct.availableColors
            .map(
              (c) => `
            <button data-color="${c.hex}" class="color-swatch-btn relative w-9 h-9 rounded-xl border border-stone-300 shadow-inner flex items-center justify-center transition-all hover:scale-110 active:scale-95" style="background-color: ${c.hex};" title="${c.name}">
              ${
                this.designDoc.productColor.toLowerCase() === c.hex.toLowerCase()
                  ? `<span class="${c.hex === '#FFFFFF' || c.hex === '#FAFAFA' || c.hex === '#F7F4EA' ? 'text-stone-900' : 'text-white'}">${ICONS.check}</span>`
                  : ''
              }
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Surface & Material Specification -->
      <div class="p-3.5 bg-stone-100/70 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
        <div class="font-semibold text-stone-800">Surface &amp; Material Specification</div>
        <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 text-stone-600 text-[11px]">
          <div>Surface: <span class="font-medium text-stone-900">${surface?.name || '—'}</span></div>
          <div>Mapping: <span class="font-medium text-stone-900">${(surface?.strategy || 'uv').toUpperCase()}</span></div>
          <div>Print Width: <span class="font-medium text-stone-900">${surface?.printableWidthMm ?? '—'} mm</span></div>
          <div>Print Height: <span class="font-medium text-stone-900">${surface?.printableHeightMm ?? '—'} mm</span></div>
          <div>Roughness: <span class="font-medium text-stone-900">${material.roughness}</span></div>
          <div>Metalness: <span class="font-medium text-stone-900">${material.metalness}</span></div>
          ${
            material.clearcoat !== undefined
              ? `<div>Clearcoat: <span class="font-medium text-stone-900">${material.clearcoat}</span></div>`
              : ''
          }
        </div>
      </div>

      <!-- Design Reset -->
      <div class="space-y-2 pt-1 border-t border-stone-200/70">
        <label class="text-xs font-bold uppercase tracking-wider text-stone-500">Design Reset</label>
        <button id="btn-reset-design" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition-all active:scale-95">
          <span class="text-stone-500">${ICONS.refresh}</span>
          Reset Design &amp; Color
        </button>
        <p class="text-[10px] text-stone-400">Clears artwork and text and returns the product to its default base color.</p>
      </div>
    `;
  }

  private renderArtworkTab(): string {
    const currentImg = this.designDoc.elements.find((e) => e.type === 'image') as ImageElement | undefined;

    return `
      <!-- Upload File Box -->
      <div class="space-y-2">
        <label class="text-xs font-bold uppercase tracking-wider text-stone-500">Upload Custom Artwork</label>
        <div id="dropzone" class="border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-stone-50/50 hover:bg-stone-50">
          <input type="file" id="file-input" accept="image/png,image/jpeg,image/svg+xml,image/webp" class="hidden" />
          <div class="flex flex-col items-center gap-1.5 text-stone-600">
            <span class="p-2 rounded-full bg-white shadow-sm border border-stone-200 text-stone-700">${ICONS.upload}</span>
            <div class="font-semibold text-xs">Click or Drag &amp; Drop Image</div>
            <div class="text-[10px] text-stone-400">Supports PNG, JPG, SVG with transparent alpha</div>
          </div>
        </div>
      </div>

      <!-- Preset Graphic Badges -->
      <div class="space-y-2">
        <label class="text-xs font-bold uppercase tracking-wider text-stone-500">Or Pick a Starter Badge</label>
        <div class="grid grid-cols-4 gap-2">
          ${STARTER_GRAPHICS.map(
            (g) => `
            <button data-badge="${g.id}" class="badge-btn p-2 rounded-xl border border-stone-200 hover:border-stone-400 bg-white shadow-xs hover:shadow transition-all active:scale-95 flex flex-col items-center gap-1" title="${g.name}">
              <div class="w-10 h-10 flex items-center justify-center">${g.svg}</div>
              <span class="text-[9px] font-medium text-stone-600 truncate w-full text-center">${g.name}</span>
            </button>
          `
          ).join('')}
        </div>
      </div>

      <!-- Active Artwork Transformation Controls -->
      ${
        currentImg
          ? `
        <div class="space-y-3.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-stone-800">Transform Artwork</span>
            <button id="btn-remove-artwork" class="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors" title="Remove Artwork">
              ${ICONS.trash}
            </button>
          </div>

          <!-- Scale Slider -->
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] text-stone-500">
              <span>Scale</span>
              <span id="img-scale-val">${Math.round(currentImg.scale * 100)}%</span>
            </div>
            <input type="range" id="input-img-scale" min="0.1" max="1.5" step="0.02" value="${currentImg.scale}" class="w-full accent-stone-900 cursor-pointer" />
          </div>

          <!-- Rotation Slider -->
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] text-stone-500">
              <span>Rotation</span>
              <span id="img-rot-val">${Math.round(currentImg.rotation)}°</span>
            </div>
            <input type="range" id="input-img-rot" min="0" max="360" step="1" value="${currentImg.rotation}" class="w-full accent-stone-900 cursor-pointer" />
          </div>

          <!-- Position X & Y -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] text-stone-500">
                <span>Pos X</span>
                <span id="img-x-val" class="font-mono text-stone-700">${Math.round(currentImg.x * 100)}%</span>
              </div>
              <input type="range" id="input-img-x" min="0.05" max="0.95" step="0.01" value="${currentImg.x}" class="w-full accent-stone-900 cursor-pointer" />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[11px] text-stone-500">
                <span>Pos Y</span>
                <span id="img-y-val" class="font-mono text-stone-700">${Math.round(currentImg.y * 100)}%</span>
              </div>
              <input type="range" id="input-img-y" min="0.05" max="0.95" step="0.01" value="${currentImg.y}" class="w-full accent-stone-900 cursor-pointer" />
            </div>
          </div>
        </div>
      `
          : `<div class="text-xs text-stone-400 italic text-center py-2">No artwork added yet. Upload an image or select a badge above.</div>`
      }
    `;
  }

  private renderTextTab(): string {
    const textElements = this.designDoc.elements.filter((e) => e.type === 'text') as TextElement[];

    return `
      <!-- Add Text Button -->
      <div class="flex items-center justify-between">
        <label class="text-xs font-bold uppercase tracking-wider text-stone-500">Custom Typography</label>
        <button id="btn-add-text" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all active:scale-95">
          <span>+ Add Text Line</span>
        </button>
      </div>

      <!-- Text Elements List -->
      <div class="space-y-4">
        ${
          textElements.length === 0
            ? `<div class="text-xs text-stone-400 italic text-center py-4">No text lines created. Click "+ Add Text Line" to add custom slogans, names, or quotes.</div>`
            : textElements
                .map(
                  (txt, idx) => `
              <div class="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3" data-text-id="${txt.id}">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-stone-700">Line ${idx + 1}</span>
                  <button class="btn-delete-text text-stone-400 hover:text-rose-600 p-1" data-id="${txt.id}" title="Remove Text">
                    ${ICONS.trash}
                  </button>
                </div>

                <!-- Text Content Input -->
                <input type="text" class="input-text-content w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900" value="${txt.text}" placeholder="Your custom message" data-id="${txt.id}" />

                <!-- Font Family Selection -->
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-semibold text-stone-500">Font Family</label>
                  <select class="select-font-family w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-xl font-medium focus:outline-none" data-id="${txt.id}">
                    <option value="Plus Jakarta Sans" ${txt.fontFamily === 'Plus Jakarta Sans' ? 'selected' : ''}>Modern Sans (Jakarta)</option>
                    <option value="Caveat" ${txt.fontFamily === 'Caveat' ? 'selected' : ''}>Handwritten Script (Caveat)</option>
                    <option value="Playfair Display" ${txt.fontFamily === 'Playfair Display' ? 'selected' : ''}>Editorial Serif (Playfair)</option>
                    <option value="Bebas Neue" ${txt.fontFamily === 'Bebas Neue' ? 'selected' : ''}>Bold Athletic (Bebas)</option>
                    <option value="Space Mono" ${txt.fontFamily === 'Space Mono' ? 'selected' : ''}>Technical Mono (Space)</option>
                    <option value="Cinzel" ${txt.fontFamily === 'Cinzel' ? 'selected' : ''}>Classical Roman (Cinzel)</option>
                  </select>
                </div>

                <!-- Font Size Slider -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] text-stone-500">
                    <span>Font Size</span>
                    <span class="font-mono text-stone-700 text-size-val" data-id="${txt.id}">${txt.fontSize}px</span>
                  </div>
                  <input type="range" class="input-text-size w-full accent-stone-900 cursor-pointer" min="16" max="72" step="2" value="${txt.fontSize}" data-id="${txt.id}" />
                </div>

                <!-- Position X & Y Sliders -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <div class="flex justify-between text-[10px] text-stone-500">
                      <span>Pos X</span>
                      <span class="font-mono text-stone-700 text-x-val" data-id="${txt.id}">${Math.round(txt.x * 100)}%</span>
                    </div>
                    <input type="range" class="input-text-x w-full accent-stone-900 cursor-pointer" min="0.05" max="0.95" step="0.01" value="${txt.x}" data-id="${txt.id}" />
                  </div>

                  <div class="space-y-1">
                    <div class="flex justify-between text-[10px] text-stone-500">
                      <span>Pos Y</span>
                      <span class="font-mono text-stone-700 text-y-val" data-id="${txt.id}">${Math.round(txt.y * 100)}%</span>
                    </div>
                    <input type="range" class="input-text-y w-full accent-stone-900 cursor-pointer" min="0.05" max="0.95" step="0.01" value="${txt.y}" data-id="${txt.id}" />
                  </div>
                </div>

                <!-- Rotation Slider -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] text-stone-500">
                    <span>Rotation</span>
                    <span class="font-mono text-stone-700 text-rot-val" data-id="${txt.id}">${Math.round(txt.rotation || 0)}°</span>
                  </div>
                  <input type="range" class="input-text-rot w-full accent-stone-900 cursor-pointer" min="0" max="360" step="1" value="${txt.rotation || 0}" data-id="${txt.id}" />
                </div>

                <!-- Text Color Quick Swatches -->
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-semibold text-stone-500">Text Color</label>
                  <div class="flex items-center gap-1.5">
                    ${['#111827', '#FFFFFF', '#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED']
                      .map(
                        (col) => `
                      <button class="btn-text-color w-6 h-6 rounded-lg border border-stone-300 shadow-inner transition-transform active:scale-90 ${txt.color === col ? 'ring-2 ring-stone-900 ring-offset-1' : ''}" style="background-color: ${col};" data-color="${col}" data-id="${txt.id}"></button>
                    `
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            `
                )
                .join('')
        }
      </div>
    `;
  }

  private renderTemplatesTab(): string {
    return `
      <div class="space-y-2">
        <label class="text-xs font-bold uppercase tracking-wider text-stone-500">Curated Design Presets</label>
        <p class="text-xs text-stone-500">1-click complete layouts engineered for mugs and apparel.</p>
        <div class="space-y-2.5 pt-1">
          ${TEMPLATES.map(
            (t) => `
            <button data-template="${t.id}" class="btn-template w-full p-3.5 rounded-2xl border border-stone-200 hover:border-stone-400 bg-white text-left transition-all hover:shadow-sm active:scale-[0.99] flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-xs" style="background-color: ${t.previewColor};">
                ${t.name.charAt(0)}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-xs text-stone-900">${t.name}</div>
                <div class="text-[11px] text-stone-500 line-clamp-2 mt-0.5">${t.description}</div>
              </div>
            </button>
          `
          ).join('')}
        </div>
      </div>
    `;
  }

  private productIcon(productId: string): string {
    switch (productId) {
      case 'ceramic-mug':
        return ICONS.mug;
      case 'tshirt-sporty':
      case 'hoodie-pullover':
        return ICONS.shirt;
      case 'iphone-case':
        return ICONS.phone;
      case 'fitness-bottle':
        return ICONS.bottle;
      case 'backpack-daypack':
        return ICONS.backpack;
      case 'baseball-cap':
        return ICONS.cap;
      default:
        return ICONS.shirt;
    }
  }

  private bindEvents() {
    // PREVENT 3D SCENE ORBIT CONTROLS FROM CAPTURING MOUSE/POINTER/DRAG EVENTS ON UI
    const stopProp = (e: Event) => e.stopPropagation();
    const panel = this.container.querySelector<HTMLElement>('#printo-panel');
    if (panel) {
      panel.addEventListener('pointerdown', stopProp);
      panel.addEventListener('mousedown', stopProp);
      panel.addEventListener('touchstart', stopProp);
    }

    const header = this.container.querySelector<HTMLElement>('#printo-header');
    if (header) {
      header.addEventListener('pointerdown', stopProp);
      header.addEventListener('mousedown', stopProp);
      header.addEventListener('touchstart', stopProp);
    }

    const floatingOpenBtn = this.container.querySelector<HTMLElement>('#btn-floating-open');
    if (floatingOpenBtn) {
      floatingOpenBtn.addEventListener('pointerdown', stopProp);
      floatingOpenBtn.addEventListener('mousedown', stopProp);
      floatingOpenBtn.addEventListener('touchstart', stopProp);
      floatingOpenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isPanelHidden = false;
        this.render();
      });
    }

    // Toggle panel hide/show from top bar
    const btnTogglePanel = this.container.querySelector<HTMLButtonElement>('#btn-toggle-panel');
    if (btnTogglePanel) {
      btnTogglePanel.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isPanelHidden = !this.isPanelHidden;
        this.render();
      });
    }

    // Collapse panel button inside the panel header
    const btnCollapsePanel = this.container.querySelector<HTMLButtonElement>('#btn-collapse-panel');
    if (btnCollapsePanel) {
      btnCollapsePanel.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isPanelHidden = true;
        this.render();
      });
    }

    // Tab switching
    this.container.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as 'product' | 'artwork' | 'text' | 'templates';
        if (tab && tab !== this.activeTab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });


    // Auto rotate toggle
    const btnAutoRotate = this.container.querySelector<HTMLButtonElement>('#btn-auto-rotate');
    if (btnAutoRotate) {
      btnAutoRotate.addEventListener('click', () => {
        this.isAutoRotating = !this.isAutoRotating;
        this.handlers.onToggleAutoRotate(this.isAutoRotating);
        this.render();
      });
    }

    // Reset camera
    const btnResetCam = this.container.querySelector<HTMLButtonElement>('#btn-reset-cam');
    if (btnResetCam) {
      btnResetCam.addEventListener('click', () => this.handlers.onResetCamera());
    }

    // Snapshot button
    const btnSnapshot = this.container.querySelector<HTMLButtonElement>('#btn-snapshot');
    if (btnSnapshot) {
      btnSnapshot.addEventListener('click', () => this.handlers.onSnapshot());
    }

    // Product selections (data-driven from the products list)
    this.container.querySelectorAll<HTMLButtonElement>('[data-select-product]').forEach((btn) => {
      const productId = btn.dataset.selectProduct;
      if (productId) {
        btn.addEventListener('click', () => this.handlers.onSelectProduct(productId));
      }
    });

    // Reset design (clears artwork/text and restores the default base color)
    const btnResetDesign = this.container.querySelector<HTMLButtonElement>('#btn-reset-design');
    if (btnResetDesign) {
      btnResetDesign.addEventListener('click', () => this.handlers.onResetDesign());
    }

    // Base color swatches
    this.container.querySelectorAll<HTMLButtonElement>('.color-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        if (color) this.handlers.onUpdateProductColor(color);
      });
    });

    // File Dropzone & Input
    const dropzone = this.container.querySelector<HTMLElement>('#dropzone');
    const fileInput = this.container.querySelector<HTMLInputElement>('#file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-stone-900', 'bg-stone-100');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-stone-900', 'bg-stone-100');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-stone-900', 'bg-stone-100');
        if (e.dataTransfer?.files?.[0]) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files?.[0]) {
          this.handleFileUpload(fileInput.files[0]);
        }
      });
    }

    // Starter Badge Selection
    this.container.querySelectorAll<HTMLButtonElement>('.badge-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const badgeId = btn.dataset.badge;
        const badge = STARTER_GRAPHICS.find((g) => g.id === badgeId);
        if (badge) {
          const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(badge.svg)}`;
          this.handlers.onAddImage(svgDataUrl);
        }
      });
    });

    // Image Transform sliders
    const inputImgScale = this.container.querySelector<HTMLInputElement>('#input-img-scale');
    if (inputImgScale) {
      inputImgScale.addEventListener('input', (e) => {
        const scale = parseFloat((e.target as HTMLInputElement).value);
        this.handlers.onUpdateImage({ scale });
        const valLabel = this.container.querySelector('#img-scale-val');
        if (valLabel) valLabel.textContent = `${Math.round(scale * 100)}%`;
      });
    }

    const inputImgRot = this.container.querySelector<HTMLInputElement>('#input-img-rot');
    if (inputImgRot) {
      inputImgRot.addEventListener('input', (e) => {
        const rotation = parseFloat((e.target as HTMLInputElement).value);
        this.handlers.onUpdateImage({ rotation });
        const valLabel = this.container.querySelector('#img-rot-val');
        if (valLabel) valLabel.textContent = `${Math.round(rotation)}°`;
      });
    }

    const inputImgX = this.container.querySelector<HTMLInputElement>('#input-img-x');
    if (inputImgX) {
      inputImgX.addEventListener('input', (e) => {
        const x = parseFloat((e.target as HTMLInputElement).value);
        this.handlers.onUpdateImage({ x });
        const valLabel = this.container.querySelector('#img-x-val');
        if (valLabel) valLabel.textContent = `${Math.round(x * 100)}%`;
      });
    }

    const inputImgY = this.container.querySelector<HTMLInputElement>('#input-img-y');
    if (inputImgY) {
      inputImgY.addEventListener('input', (e) => {
        const y = parseFloat((e.target as HTMLInputElement).value);
        this.handlers.onUpdateImage({ y });
        const valLabel = this.container.querySelector('#img-y-val');
        if (valLabel) valLabel.textContent = `${Math.round(y * 100)}%`;
      });
    }

    const btnRemoveArtwork = this.container.querySelector<HTMLButtonElement>('#btn-remove-artwork');
    if (btnRemoveArtwork) {
      btnRemoveArtwork.addEventListener('click', () => this.handlers.onRemoveImage());
    }

    // Add Text Button
    const btnAddText = this.container.querySelector<HTMLButtonElement>('#btn-add-text');
    if (btnAddText) {
      btnAddText.addEventListener('click', () => {
        this.handlers.onAddText('NEW PRINT DESIGN', {
          fontFamily: 'Bebas Neue',
          fontSize: 36,
          color: '#111827',
          x: 0.5,
          y: 0.72
        });
      });
    }

    // Text item controls
    this.container.querySelectorAll<HTMLInputElement>('.input-text-content').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = input.dataset.id;
        const text = (e.target as HTMLInputElement).value;
        if (id) this.handlers.onUpdateText(id, { text });
      });
    });

    this.container.querySelectorAll<HTMLSelectElement>('.select-font-family').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const id = sel.dataset.id;
        const fontFamily = (e.target as HTMLSelectElement).value;
        if (id) this.handlers.onUpdateText(id, { fontFamily });
      });
    });

    this.container.querySelectorAll<HTMLInputElement>('.input-text-size').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = input.dataset.id;
        const fontSize = parseInt((e.target as HTMLInputElement).value, 10);
        if (id) {
          this.handlers.onUpdateText(id, { fontSize });
          const valLabel = this.container.querySelector(`.text-size-val[data-id="${id}"]`);
          if (valLabel) valLabel.textContent = `${fontSize}px`;
        }
      });
    });

    this.container.querySelectorAll<HTMLInputElement>('.input-text-x').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = input.dataset.id;
        const x = parseFloat((e.target as HTMLInputElement).value);
        if (id) {
          this.handlers.onUpdateText(id, { x });
          const valLabel = this.container.querySelector(`.text-x-val[data-id="${id}"]`);
          if (valLabel) valLabel.textContent = `${Math.round(x * 100)}%`;
        }
      });
    });

    this.container.querySelectorAll<HTMLInputElement>('.input-text-y').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = input.dataset.id;
        const y = parseFloat((e.target as HTMLInputElement).value);
        if (id) {
          this.handlers.onUpdateText(id, { y });
          const valLabel = this.container.querySelector(`.text-y-val[data-id="${id}"]`);
          if (valLabel) valLabel.textContent = `${Math.round(y * 100)}%`;
        }
      });
    });

    this.container.querySelectorAll<HTMLInputElement>('.input-text-rot').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = input.dataset.id;
        const rotation = parseFloat((e.target as HTMLInputElement).value);
        if (id) {
          this.handlers.onUpdateText(id, { rotation });
          const valLabel = this.container.querySelector(`.text-rot-val[data-id="${id}"]`);
          if (valLabel) valLabel.textContent = `${Math.round(rotation)}°`;
        }
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>('.btn-text-color').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const color = btn.dataset.color;
        if (id && color) this.handlers.onUpdateText(id, { color });
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>('.btn-delete-text').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) this.handlers.onRemoveText(id);
      });
    });

    // Template application
    this.container.querySelectorAll<HTMLButtonElement>('.btn-template').forEach((btn) => {
      btn.addEventListener('click', () => {
        const templateId = btn.dataset.template;
        if (templateId) this.handlers.onApplyTemplate(templateId);
      });
    });
  }

  private handleFileUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        this.handlers.onAddImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }
}
