import { ProductDefinition, DesignDocument, ImageElement, TextElement } from '../types';

export class PrintCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDirty = false;
  private animFrameId: number | null = null;
  private onUpdateCallback?: (canvas: HTMLCanvasElement) => void;
  private imageCache = new Map<string, HTMLImageElement>();

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d', { willReadFrequently: false });
    if (!context) {
      throw new Error('Failed to acquire 2D canvas context for PrintCompositor');
    }
    this.ctx = context;
  }

  public setOnUpdate(cb: (canvas: HTMLCanvasElement) => void) {
    this.onUpdateCallback = cb;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public async preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  }

  public render(product: ProductDefinition, doc: DesignDocument, immediate = false) {
    this.isDirty = true;
    if (immediate) {
      this.executeRender(product, doc);
    } else if (this.animFrameId === null) {
      this.animFrameId = requestAnimationFrame(() => {
        this.animFrameId = null;
        if (this.isDirty) {
          this.executeRender(product, doc);
          this.isDirty = false;
        }
      });
    }
  }

  private executeRender(product: ProductDefinition, doc: DesignDocument) {
    const { width, height } = product.printableRegion.textureResolution;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    // 1. Fill base product color
    ctx.fillStyle = doc.productColor || product.defaultBaseColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Determine printable bounds in canvas coordinates
    let printX = 0;
    let printY = 0;
    let printW = width;
    let printH = height;

    if (product.printableRegion.uvBounds) {
      const { uMin, uMax, vMin, vMax } = product.printableRegion.uvBounds;
      printX = uMin * width;
      printW = (uMax - uMin) * width;
      printY = vMin * height;
      printH = (vMax - vMin) * height;
    }

    // 3. Render design elements inside print bounds
    ctx.save();
    // Clip strictly to printable region to prevent artwork spilling outside
    ctx.beginPath();
    ctx.rect(printX, printY, printW, printH);
    ctx.clip();

    for (const elem of doc.elements) {
      if (!elem.visible || elem.opacity <= 0) continue;

      ctx.save();
      ctx.globalAlpha = elem.opacity;

      // Calculate center point in canvas pixels
      const cx = printX + elem.x * printW;
      const cy = printY + elem.y * printH;

      ctx.translate(cx, cy);
      if (elem.rotation !== 0) {
        ctx.rotate((elem.rotation * Math.PI) / 180);
      }

      if (elem.type === 'image') {
        this.renderImageElement(ctx, elem, printW, printH);
      } else if (elem.type === 'text') {
        this.renderTextElement(ctx, elem, printW);
      }

      ctx.restore();
    }

    ctx.restore();

    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.canvas);
    }
  }

  private renderImageElement(
    ctx: CanvasRenderingContext2D,
    elem: ImageElement,
    printW: number,
    printH: number
  ) {
    const img = elem.imageElement || this.imageCache.get(elem.src);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Base display size is proportional to print region min dimension
    const baseDimension = Math.min(printW, printH) * 0.55;
    const aspect = elem.aspectRatio || (img.naturalWidth / img.naturalHeight);
    let targetW = baseDimension * elem.scale;
    let targetH = targetW / aspect;

    if (targetH > printH * elem.scale) {
      targetH = printH * 0.55 * elem.scale;
      targetW = targetH * aspect;
    }

    ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
  }

  private renderTextElement(
    ctx: CanvasRenderingContext2D,
    elem: TextElement,
    printW: number
  ) {
    if (!elem.text.trim()) return;

    // Scale font size relative to 1024px reference width
    const scaleFactor = printW / 1024;
    const computedFontSize = Math.max(12, elem.fontSize * scaleFactor * elem.scale);

    ctx.font = `${elem.fontStyle} ${elem.fontWeight} ${computedFontSize}px ${elem.fontFamily}, sans-serif`;
    ctx.textAlign = elem.textAlign;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = elem.color;

    // Support multiline text
    const lines = elem.text.split('\n');
    const lineHeight = computedFontSize * 1.25;
    const startY = -((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, 0, startY + index * lineHeight);
    });
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.imageCache.clear();
  }
}
