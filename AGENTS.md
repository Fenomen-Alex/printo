# Printo Agent Instructions

## 1. Project

Printo is a lightweight web-based 3D print configurator.

The user selects a product such as a mug or T-shirt, adds artwork or text, positions and transforms the design, and sees the result rendered on the actual 3D product surface.

The defining technical requirement is:

> The print must follow the actual geometry and material characteristics of the product.

The project is intended to become a polished static web application deployable to GitHub Pages.

The application must remain useful on desktop and mobile devices.

---

## 2. Engineering Priorities

Prioritize these concerns in this order:

1. Correct print-to-surface mapping.
2. Visual quality of the resulting product preview.
3. Interactive rendering performance.
4. Mobile usability.
5. Asset loading performance.
6. Maintainable product-specific architecture.
7. Small application bundle.

Do not sacrifice correct surface mapping for implementation convenience.

Do not choose an implementation merely because it is easier to code.

---

## 3. Core Technology Direction

The default technology direction is:

* TypeScript
* Vite
* Three.js
* WebGL
* native HTML/CSS
* native browser APIs where practical

Avoid introducing a UI framework unless a concrete technical requirement justifies it.

Do not use:

* React
* Angular
* Vue
* Svelte
* SSR
* server-side application logic
* a backend service for normal application operation

Printo should work as a static application.

GitHub Pages is the preferred deployment target.

---

## 4. Three.js

Use Three.js for:

* loading glTF/GLB assets
* scene management
* cameras
* lighting
* PBR materials
* mesh interaction
* raycasting
* product rotation
* product zoom
* rendering
* screenshots

Use official Three.js APIs and addons where appropriate.

Use `GLTFLoader` for product assets.

Use `OrbitControls` for product inspection unless the UX research determines that another interaction model is better.

---

## 5. Critical Rendering Principle

Never implement the print as a generic image placed over the rendered canvas.

The WebGL canvas is not the source of truth for print placement.

The product's:

* geometry
* UV coordinates
* materials
* normals
* printable regions
* topology
* texture layout

must determine how the artwork reaches the visible product surface.

The system must support different mapping strategies per product.

A product definition may use:

```text
UV mapping
Projection mapping
Hybrid mapping
```

The implementation must determine the appropriate strategy after inspecting the actual asset.

Do not assume that one projection technique works for every product.

---

## 6. UV Mapping

UV mapping should be preferred when the supplied model has suitable UV coordinates.

The preferred architecture for a product with a useful UV layout is:

```text
User design
    ↓
Design document
    ↓
Product print compositor
    ↓
Product UV texture
    ↓
Product material
    ↓
3D mesh
```

The print therefore follows the mesh naturally because the product's UV coordinates define the relationship between texture pixels and surface geometry.

For curved products such as mugs, a correctly UV-unwrapped body can naturally produce the cylindrical wrapping required by the product.

For garments, UV mapping can account for the topology of the garment and its folds.

Do not flatten a curved product into a CSS or HTML representation and attempt to fake curvature afterwards.

---

## 7. Projection / Decal Mapping

Three.js `DecalGeometry` may be used where it is technically appropriate.

It is useful for projecting artwork onto arbitrary mesh surfaces.

It must not automatically become the universal Printo print system.

Investigate:

* projection volume
* projector orientation
* surface normals
* clipping
* projection distortion
* UV generation
* seams
* sharp corners
* highly curved surfaces

Three.js documentation specifically notes possible decal distortion around corners.

For each product, determine whether projection is appropriate.

---

## 8. Hybrid Mapping

A product may use more than one technique.

Example:

```text
T-shirt
    ↓
UV texture for front/back printable zones
    +
projection for special localized decoration
```

The architecture must allow this without rewriting the renderer.

---

## 9. Product Definition

Products must be data-driven.

Do not hard-code product-specific behavior throughout rendering code.

The conceptual structure is:

```ts
interface ProductDefinition {
  id: string;
  name: string;

  model: string;

  mapping: {
    strategy: "uv" | "projection" | "hybrid";
  };

  printableRegions: PrintableRegion[];

  materials: ProductMaterialDefinition;

  camera?: ProductCameraDefinition;

  metadata?: ProductMetadata;
}
```

The exact interfaces may evolve during implementation.

A printable region should contain enough information to describe:

* the relevant mesh
* the relevant material
* the relevant UV region
* physical dimensions
* allowed artwork placement
* transformation constraints
* mapping strategy
* clipping behavior

---

## 10. Printable Regions

Do not assume the entire product is printable.

Examples:

```text
Mug
  body-print-area

T-shirt
  front-print-area
  back-print-area

Cap
  front-panel-print-area
```

The product definition controls where artwork can appear.

The editor should operate in normalized or physical design coordinates rather than arbitrary screen pixels.

---

## 11. Physical Print Dimensions

A product should be capable of specifying its real printable dimensions.

For example:

```text
widthMm
heightMm
```

The UI may display normalized coordinates while the internal design representation remains independent from the current viewport size.

This makes the design suitable for future print-ready export if that capability is ever added.

The current product requirement is screenshot export rather than production-file export.

Do not build a complete print-production pipeline unless explicitly requested.

---

## 12. Design Document

Separate the design from the renderer.

Conceptually:

```ts
interface DesignDocument {
  width: number;
  height: number;

  background?: DesignBackground;

  elements: DesignElement[];
}
```

Elements may include:

```text
image
text
shape
```

Each element should have:

```text
position
scale
rotation
opacity
visibility
```

Text should additionally support:

```text
font family
font size
font weight
font style
color
alignment
```

The design document must not contain Three.js objects.

This keeps the editor state independent from the rendering implementation.

---

## 13. Image Handling

User images are loaded locally through browser APIs.

Do not upload user images to a server.

Use object URLs or decoded image objects as appropriate.

Validate:

* file type
* image dimensions
* file size

Avoid unnecessarily decoding enormous source images.

The application should downscale images when the source resolution greatly exceeds the useful texture resolution.

---

## 14. Text

Text should be rendered into the design representation.

Do not require Three.js `TextGeometry` for normal print artwork.

Print text is fundamentally 2D artwork that eventually becomes part of the product's print texture or projection texture.

Use browser font APIs and/or a carefully selected font-loading mechanism.

Avoid depending on a large font library.

---

## 15. Materials

The product's original material properties must remain meaningful after adding the print.

Investigate how the supplied asset represents:

* base color
* roughness
* metalness
* ambient occlusion
* normal maps
* other relevant PBR channels

The print should visually belong to the product.

For example:

```text
ceramic mug
    → printed artwork follows ceramic appearance

fabric T-shirt
    → printed artwork follows garment geometry and lighting

metal pen
    → printed artwork interacts appropriately with the barrel material
```

Do not automatically put the artwork onto a separate opaque floating mesh if doing so makes it look like a sticker hovering above the product.

A separate geometry layer is acceptable when the visual result and material model justify it.

---

## 16. Asset Acquisition

Do not create 3D product models from scratch.

Do not ask an image-generation model to generate product meshes.

Use existing downloadable assets.

Preferred sources include:

* Sketchfab
* Fab
* Poly Pizza
* other reputable sources providing GLB/glTF assets
* CC0 / public-domain assets
* appropriately licensed commercial assets

Every selected asset must be checked for licensing.

Record the license and source URL in the product asset documentation.

Do not silently include assets with incompatible licenses.

---

## 17. Asset Selection Criteria

A visually attractive model is insufficient.

Inspect each candidate for:

* GLB/glTF availability
* UV quality
* printable-region suitability
* topology
* material count
* texture resolution
* normal maps
* roughness information
* mesh complexity
* file size
* license
* browser suitability
* product realism
* ease of identifying printable surfaces

Prefer models designed for web, AR, VR, or configurator usage.

For the initial prototype, prefer relatively low-poly assets with good UVs over extremely detailed models.

---

## 18. Initial Product Scope

The initial implementation should focus on:

```text
1. Mug
2. T-shirt
```

Do not add four product categories before the underlying mapping system has been validated.

After the mug and T-shirt pipelines are reliable, evaluate:

```text
3. Cap
4. Pen
```

Each new product must demonstrate that its mapping strategy works before being integrated.

---

## 19. Candidate T-Shirt Asset

One strong candidate discovered during research is the BINARYCLOTH:

`Men Regular Apparel Fit Sporty T-Shirt`

The asset listing describes:

* fully unwrapped UVs
* 15.8k vertices
* normal map
* PBR texture set
* 2K GLB around 4.44 MB
* suitability for web configurators
* CC Attribution licensing

Treat it as a candidate, not as an automatically approved production asset.

The agent must inspect the downloaded model before integrating it.

---

## 20. Asset Manifest

Maintain an asset manifest containing information similar to:

```json
{
  "id": "tshirt-regular-sporty",
  "source": "...",
  "license": "CC-BY",
  "model": "assets/products/tshirt/model.glb",
  "mappingStrategy": "uv",
  "notes": "Candidate web configurator asset"
}
```

The exact schema can evolve.

---

## 21. UI

The 3D viewport should dominate the interface.

Desktop:

```text
┌──────────────────────────────────────────────┐
│ Printo                              controls │
│                                              │
│                                              │
│                  3D PRODUCT                  │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

Controls should float above the WebGL viewport using normal HTML elements.

Do not draw the application controls into the WebGL canvas.

Use CSS positioning and appropriate z-index layering.

---

## 22. Mobile

Mobile is a first-class target.

Use:

```css
100dvh
```

rather than relying exclusively on `100vh`.

The normal mobile view should prioritize the product.

Provide a floating hamburger/menu control.

Opening the menu should expose the configuration controls in a fullscreen or near-fullscreen overlay.

The Printo logo may remain floating over the product.

Avoid persistent panels that consume most of the mobile viewport.

---

## 23. Branding

Product name:

```text
Printo
```

The logo should be visually light and elegant.

Use a script/curly typographic treatment.

Do not introduce a large branding header.

The product itself should remain the visual focus.

---

## 24. Interaction

The user should be able to:

* rotate the product
* zoom
* optionally pan
* select a product
* upload an image
* add text
* select fonts
* modify text style
* change text color
* position artwork
* scale artwork
* rotate artwork
* switch printable regions where applicable
* reset the design
* take a snapshot

Where technically appropriate, artwork positioning should interact with the actual 3D surface.

A future direct-manipulation workflow may use raycasting:

```text
pointer/touch
    ↓
Raycaster
    ↓
product mesh intersection
    ↓
surface position / UV
    ↓
design coordinates
```

Do not implement this blindly. Determine the best interaction model after the mapping architecture is established.

---

## 25. Snapshot

The user requires an instant PNG snapshot.

The snapshot should capture the rendered product view.

It should include:

* product
* artwork
* lighting
* background
* current camera angle

The application should download the PNG immediately.

Do not require a server.

Investigate the appropriate renderer configuration and screenshot pipeline.

Do not automatically use `preserveDrawingBuffer` if an alternative capture approach provides better rendering performance.

---

## 26. Performance

Performance is a major project requirement.

Target:

* smooth product interaction
* minimal UI overhead
* low JavaScript execution cost
* reasonable initial download
* lazy loading of product assets
* disposal of unused Three.js resources
* no unnecessary texture recreation
* no unnecessary geometry recreation
* minimal per-frame allocations

The agent must profile before making claims about performance.

Do not optimize based purely on theoretical bundle-size numbers.

Measure:

```text
initial JS
initial CSS
product GLB size
texture sizes
time to first usable render
frame rate during rotation
frame rate during artwork manipulation
memory after switching products
```

---

## 27. Texture Strategy

Avoid regenerating large textures unnecessarily.

When the design changes:

* determine whether a texture update is required
* redraw only what is necessary
* update GPU textures efficiently
* avoid allocating a new texture on every slider movement
* dispose replaced GPU resources

Investigate whether a persistent canvas texture is sufficient.

For more advanced rendering, evaluate render targets or shader-based composition where they provide a measurable advantage.

---

## 28. Bundle Size

Keep application code lightweight.

Do not introduce dependencies merely for convenience.

Every dependency should have a clear purpose.

Three.js is justified because it is the core rendering engine.

A canvas editor library such as Fabric.js should only be introduced if native Canvas APIs become insufficient.

Measure the production bundle.

Do not use an arbitrary `<150 KB gzipped` claim as the only performance criterion because Three.js itself and product assets are separate concerns.

Report:

```text
application bundle
Three.js contribution
other dependencies
product assets
textures
```

---

## 29. Browser Support

Target modern browsers supporting:

* WebGL
* ES modules
* modern TypeScript output
* Pointer Events
* modern CSS
* File API
* Canvas APIs

Test at minimum:

* desktop Chromium
* desktop Firefox
* Safari where available
* mobile Chromium
* mobile Safari where available

---

## 30. Accessibility

The WebGL product is visual, but the surrounding UI must remain accessible.

Use:

* semantic buttons
* labels
* keyboard-accessible controls
* visible focus states
* sensible touch targets
* appropriate ARIA attributes for menus where needed

Do not make essential controls accessible only through mouse hover.

---

## 31. Testing

Tests should focus on behavior that can be verified deterministically.

At minimum:

### Unit tests

Test:

* design document transformations
* coordinate conversion
* product configuration parsing
* printable-region calculations
* asset manifest validation

### Integration tests

Test:

* loading a product
* applying artwork
* changing artwork position
* changing scale
* changing rotation
* switching products
* resetting state
* snapshot creation

### Visual validation

Use browser automation where available.

Capture screenshots from fixed camera configurations.

Verify that:

* artwork appears on the intended surface
* artwork follows the product curvature
* product switching does not corrupt the design
* the artwork remains correctly positioned after camera rotation
* mobile UI remains usable

---

## 32. Agent Workflow

The agent must work incrementally.

For substantial stages:

1. inspect
2. research
3. propose
4. implement
5. test
6. inspect results
7. report

Do not silently make major architectural decisions.

At the end of each requested milestone, report:

```text
What was investigated
What was implemented
Files changed
Tests executed
Results
Known problems
Architectural decisions
Next recommended step
```

Stop after the milestone when instructed.

---

## 33. Research Before Implementation

Before implementing the rendering pipeline, inspect the candidate product assets.

For each model determine:

```text
Mesh structure
UV structure
Material structure
Texture structure
Printable region
Coordinate system
Scale
Topology
Potential seams
Potential distortions
```

Create a small asset inspection utility if necessary.

It is acceptable to build temporary diagnostic tooling.

A diagnostic tool that shows:

* model
* UV layout
* material names
* mesh names
* texture names
* vertex count
* triangle count
* bounding box

is highly valuable.

---

## 34. Prohibited Shortcuts

Do not:

* fake curvature with CSS
* render the print as a screen-space overlay
* put the same rectangular texture over every product
* assume every product is cylindrical
* assume `DecalGeometry` solves every print problem
* generate replacement 3D models with AI
* discard product UVs without inspection
* flatten the 3D product into a screenshot and call it a 3D preview
* add a framework without a measured reason
* add a backend for functionality that can run locally
* optimize before measuring

---

## 35. Definition of Correctness

A Printo implementation is considered technically correct when the artwork is represented in a coordinate system tied to the actual product surface.

For example, rotating a mug must rotate the print with the mug because the print belongs to the mug's surface mapping.

A T-shirt design must follow the garment's actual topology and UV mapping.

The visual result must remain coherent under camera rotation.

The design must not appear to float independently in front of the product.

---

## 36. Current Development Stage

The first implementation milestone is **research and architecture validation**.

Do not build the complete editor immediately.

The first agent run should:

1. inspect this repository
2. research the reference configurators
3. research candidate assets
4. obtain and inspect suitable product assets where legally and technically possible
5. analyze their UVs and materials
6. determine the mapping strategy
7. design the product abstraction
8. design the print/design data model
9. propose the rendering pipeline
10. identify technical risks
11. propose the staged implementation plan
12. report findings

Then stop.

Do not proceed into broad implementation until the architecture has been reviewed.

