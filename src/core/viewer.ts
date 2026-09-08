import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ProductDefinition } from '../types';

export class ProductViewer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private gltfLoader: GLTFLoader;

  private currentProduct: ProductDefinition | null = null;
  private currentModelGroup: THREE.Group | null = null;
  private canvasTexture: THREE.CanvasTexture | null = null;
  private printableMaterials: THREE.MeshStandardMaterial[] = [];
  private ceramicBodyMaterials: THREE.MeshStandardMaterial[] = [];

  private isAutoRotating = false;
  private isDestroyed = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF5F6F8);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 2, 17);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for high-quality instant snapshot download
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.maxPolarAngle = Math.PI * 0.85;
    this.controls.minPolarAngle = Math.PI * 0.15;

    // 5. Lighting
    this.setupLighting();

    // 6. Loader
    this.gltfLoader = new GLTFLoader();

    // 7. Responsive handling
    this.setupResizeHandler();

    // 8. Animation loop
    this.animate();
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    this.scene.add(ambientLight);

    // Key light (warm high front-right)
    const keyLight = new THREE.DirectionalLight(0xFFF9EE, 2.2);
    keyLight.position.set(8, 12, 10);
    this.scene.add(keyLight);

    // Fill light (cool softer front-left)
    const fillLight = new THREE.DirectionalLight(0xEDF4FF, 1.2);
    fillLight.position.set(-10, 6, 8);
    this.scene.add(fillLight);

    // Rim/Back light (highlights silhouettes and edges)
    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    rimLight.position.set(0, 10, -12);
    this.scene.add(rimLight);

    // Subtle bottom bounce light
    const groundBounce = new THREE.DirectionalLight(0xE5E7EB, 0.6);
    groundBounce.position.set(0, -10, 0);
    this.scene.add(groundBounce);
  }

  private setupResizeHandler() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.isDestroyed || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
    this.resizeObserver.observe(this.container);
  }

  public async loadProduct(product: ProductDefinition, compositorCanvas: HTMLCanvasElement): Promise<void> {
    this.currentProduct = product;

    // Remove existing model if any
    this.disposeCurrentModel();

    // Reset camera according to product definition
    const { initialPosition, target, minDistance, maxDistance, fov } = product.camera;
    this.camera.fov = fov;
    this.camera.position.set(...initialPosition);
    this.camera.updateProjectionMatrix();
    this.controls.target.set(...target);
    this.controls.minDistance = minDistance;
    this.controls.maxDistance = maxDistance;
    this.controls.update();

    // Prepare shared canvas texture for print mapping
    this.canvasTexture = new THREE.CanvasTexture(compositorCanvas);
    this.canvasTexture.flipY = false;
    this.canvasTexture.colorSpace = THREE.SRGBColorSpace;
    this.canvasTexture.generateMipmaps = true;
    this.canvasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.canvasTexture.magFilter = THREE.LinearFilter;

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        product.modelPath,
        (gltf) => {
          const model = gltf.scene;
          this.currentModelGroup = model;
          this.printableMaterials = [];
          this.ceramicBodyMaterials = [];

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              this.configureMeshMaterials(mesh, product);
            }
          });

          this.scene.add(model);
          this.updateTexture();
          resolve();
        },
        undefined,
        (error) => {
          console.error(`Error loading model for product ${product.id}:`, error);
          reject(error);
        }
      );
    });
  }

  private configureMeshMaterials(mesh: THREE.Mesh, product: ProductDefinition) {
    if (product.id === 'ceramic-mug') {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat, idx) => {
        const standardMat = new THREE.MeshPhysicalMaterial({
          roughness: product.materials.roughness,
          metalness: product.materials.metalness,
          clearcoat: product.materials.clearcoat ?? 0.35,
          clearcoatRoughness: 0.1
        });

        // Primitive 0 is "Logo" (outer jacket wrap)
        if (idx === 0 || mat.name === 'Logo') {
          standardMat.map = this.canvasTexture;
          standardMat.needsUpdate = true;
          this.printableMaterials.push(standardMat);
        } else if (mat.name === 'Coffee') {
          // Liquid coffee top
          standardMat.color.set('#3D1E0C');
          standardMat.roughness = 0.2;
          standardMat.clearcoat = 0.6;
        } else {
          // Base, Bevel, Inner, Handle
          standardMat.color.set(product.defaultBaseColor);
          this.ceramicBodyMaterials.push(standardMat);
        }
        materials[idx] = standardMat;
      });
      mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
    } else if (product.id === 'tshirt-sporty') {
      // Sporty T-Shirt
      const oldMat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
      const fabricMat = new THREE.MeshStandardMaterial({
        roughness: product.materials.roughness,
        metalness: product.materials.metalness,
        normalMap: oldMat?.normalMap || null,
        aoMap: oldMat?.aoMap || null,
        aoMapIntensity: 1.0,
        map: this.canvasTexture
      });
      if (oldMat?.normalScale) {
        fabricMat.normalScale.copy(oldMat.normalScale);
      }
      fabricMat.color.set(product.defaultBaseColor);
      mesh.material = fabricMat;
      this.printableMaterials.push(fabricMat);
    }
  }

  public updateProductColor(hexColor: string) {
    if (!this.currentProduct) return;

    if (this.currentProduct.id === 'ceramic-mug') {
      this.ceramicBodyMaterials.forEach((mat) => {
        mat.color.set(hexColor);
        mat.needsUpdate = true;
      });
    } else if (this.currentProduct.id === 'tshirt-sporty') {
      this.printableMaterials.forEach((mat) => {
        mat.color.set(hexColor);
        mat.needsUpdate = true;
      });
    }
  }

  public updateTexture() {
    if (this.canvasTexture) {
      this.canvasTexture.needsUpdate = true;
    }
  }

  public setAutoRotate(enabled: boolean) {
    this.isAutoRotating = enabled;
  }

  public resetCamera() {
    if (!this.currentProduct) return;
    const { initialPosition, target } = this.currentProduct.camera;
    this.camera.position.set(...initialPosition);
    this.controls.target.set(...target);
    this.controls.update();
  }

  public takeSnapshot(): string {
    // Render high quality frame
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png', 1.0);
  }

  public downloadSnapshot(filename?: string) {
    const dataUrl = this.takeSnapshot();
    const link = document.createElement('a');
    link.download = filename || `printo-${this.currentProduct?.id || 'product'}-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private animate = () => {
    if (this.isDestroyed) return;
    requestAnimationFrame(this.animate);

    if (this.isAutoRotating && this.currentModelGroup) {
      this.currentModelGroup.rotation.y += 0.008;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private disposeCurrentModel() {
    if (this.currentModelGroup) {
      this.scene.remove(this.currentModelGroup);
      this.currentModelGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      this.currentModelGroup = null;
    }

    if (this.canvasTexture) {
      this.canvasTexture.dispose();
      this.canvasTexture = null;
    }
    this.printableMaterials = [];
    this.ceramicBodyMaterials = [];
  }

  public dispose() {
    this.isDestroyed = true;
    this.resizeObserver?.disconnect();
    this.disposeCurrentModel();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
