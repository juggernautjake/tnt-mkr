# TNT-MKR: Site Improvement Recommendations & 3D Case Editor Plan

---

## PART 1: Broader Site Improvement Recommendations

Beyond the 7-phase audit already completed, the following high-impact issues were found:

### CRITICAL — Security (IDOR Vulnerabilities)

| Issue | File | Risk |
|-------|------|------|
| `order.find()` has NO user ownership filter — any authenticated user can query all orders | `backend/src/api/order/controllers/order.ts:338-362` | Users enumerate orders, see other users' addresses/payment info |
| `address` uses default core router — exposes update/delete without authorization | `backend/src/api/address/routes/address.ts:3` | Users modify/delete any address by ID |
| `order-item` exposes all CRUD without authorization | `backend/src/api/order-item/routes/order-item.ts:3` | Order item manipulation |
| `wish-list` exposes find/delete without restrictions | `backend/src/api/wish-list/routes/wish-list.ts:3` | Access/delete other users' wishlists |
| `user-custom-case` exposes all operations | `backend/src/api/user-custom-case/routes/user-custom-case.ts:3` | Delete/modify other users' custom cases |
| `site-setting` exposes all CRUD | `backend/src/api/site-setting/routes/site-setting.ts:3` | Users could modify site settings |
| `shipping-box` default core router | shipping-box routes | Users modify box dimensions affecting shipping calculations |
| `discount-code` find/findOne exposed | discount-code routes | Users enumerate all discount codes |

**Fix**: Replace default `createCoreRouter` with custom routes that restrict `update`/`delete` to owners and `find` to filtered-by-user queries. Admin-only content types (site-setting, shipping-box) should require admin role.

### HIGH — Email Enumeration

| Issue | File | Risk |
|-------|------|------|
| `/email-check/email-exists` is public with no rate limit | `backend/src/api/email-check/routes/email-check.ts:4-10` | Attackers enumerate registered emails for phishing |

**Fix**: Aggressive rate limiting (5 req/min per IP) or require authentication.

### HIGH — No Test Suite

Zero test files exist in the entire repository. No `.test.ts`, `.spec.ts`, or `__tests__/` directories. This means:
- IDOR fixes can't be verified automatically
- Lifecycle hooks can't be regression-tested
- The webhook pipeline has no automated validation
- The 3D editor feature (below) has no safety net

**Fix**: Add at minimum: integration tests for order/cart APIs with ownership checks, unit tests for pricing/promotion logic.

### MEDIUM — Missing Database Indexes

Fields heavily used in queries/filters but lacking explicit indexes:
- `order.order_status`, `order.payment_status`, `order.payment_intent_id`, `order.ordered_at`
- `cart.guest_session`, `cart.status`
- `discount-code.code`, `discount-code.active`, `discount-code.valid_until`

### MEDIUM — Cron Job Resilience

All three cron jobs (`index.ts:40-138`) lack:
- **Distributed locking** — multiple server instances run the same job simultaneously
- **Transaction safety** — abandoned cart cleanup deletes items then cart; if cart deletion fails, orphaned items remain
- **Dead letter queue** — failed Google Sheets syncs are logged but never retried

### MEDIUM — Webhook Race Conditions

`webhook-event` service has a time-of-check/time-of-use gap in deduplication (`findOne` then `create` without a transaction). Two simultaneous webhooks for the same event could both pass the check. Should use a database-level unique constraint on `event_id`.

### LOW-MEDIUM — Schema Validation Gaps

- `contact.message`: No minLength/maxLength
- `address.postal_code`: No regex pattern
- `address.phone`: No pattern validation
- `product.name`, `product.default_price`: Not marked required
- `product.sku`: Not marked required

---

## PART 2: Critical Evaluation of the Previous 3D Editor Plan

### What the previous plan got RIGHT

1. **React Three Fiber + drei** — Confirmed as the best choice. Only option that gives GLB loading, real-time material changes, text decals on curved surfaces, and fine-grained mobile performance control. model-viewer is too limited (no decals), Babylon.js is overkill + no React renderer, Spline is for landing pages not configurators.

2. **Decal + Normal Map for text preview** — Correct. Rendering text to a Canvas, generating a normal map, and applying via `<Decal>` gives the most realistic embossed/debossed appearance on curved surfaces without modifying geometry. This is a visual illusion only (silhouette won't show depth) but is perfectly fine for a product preview.

3. **CadQuery for server-side CAD generation** — Correct choice. It has built-in `Workplane.text()` with positive/negative depth for emboss/deboss, true B-Rep boolean operations (cleaner than mesh-level), and 3MF export. Docker-ready. Better than OpenSCAD (slower, weaker on curves) or trimesh (not a CAD tool).

4. **lib3mf for multi-color 3MF assembly** — Real library (v2.4.1, BSD licensed, by the 3MF Consortium). `SetObjectLevelProperty()` assigns materials per mesh body. Bambu Studio recognizes standard 3MF colors via its "Standard 3MF Import Color" module.

5. **Bambu Studio CLI for slicing** — Real and documented. Can load machine/process/filament settings from JSON, slice, and export `.gcode.3mf`.

### What the previous plan got WRONG or MISSED

#### 1. Ignored existing data model infrastructure

The codebase ALREADY has significant customization scaffolding:

- **`user-custom-case`** content type with: `preview_model_file`, `name`, `user`, `engravings` (repeatable component), `selected_colors`, `product`, `public`
- **`customization.engraving`** component with: `text`, `position` (enum: back/left/right/top/bottom), `font`
- **`cart-item`** already has an `engravings` field (repeatable `customization.engraving` component)
- **`order-item`** already has an `engravings` field too
- **`product`** already has `three_d_model_file` (media), `customizable` (boolean), and `engraving_options` (manyToMany)

The previous plan proposed creating a brand-new `TextCustomization` content type, completely duplicating what already exists. The `customization.engraving` component already captures text + position + font. It just needs minor extensions (font_size, style, position_x/y, text_color).

#### 2. Not generic — hardcoded to one product

The user explicitly wants this to work for **any product** with customizable surfaces. The previous plan was entirely focused on the LP3 PRYSM CLASSIC with hardcoded mesh node names (`nodes.back_panel`, `nodes.bumper`).

**What's needed**: A `DesignZone` content type that defines WHERE on each product/part customization is allowed. This is configured per-product by the admin, not hardcoded in React components.

#### 3. Underestimated infrastructure gap

The repo has **zero Python code, zero Docker files, zero 3D assets, zero 3D libraries**. The previous plan jumped straight from "install R3F" to "build CadQuery microservice" without acknowledging:
- Need to set up a Python project structure, Docker, CI/CD
- Need to create and host GLB models (currently no `models/` directory)
- Need font files available on both client and server
- Need a job queue for async print file generation (not just a synchronous API call)

#### 4. Missing critical features

- **No admin review workflow** — Custom orders need manual approval before printing
- **No profanity filter** — Users can type anything
- **No character limits** — Unbounded text could break the CadQuery pipeline
- **No cost model** — Text customization should affect pricing
- **No print validation** — Generated 3MF needs to be validated (manifold check, min wall thickness)
- **No font licensing consideration** — Fonts must be licensed for both web rendering and commercial use in products
- **No SVG validation/sanitization** — SVG upload is an XSS vector
- **No mobile UX plan** — 3D editors on phones are notoriously difficult

#### 5. Unrealistic Bambu Studio integration

The plan implied fully automated print-to-ship. Reality:
- Bambu Studio CLI can slice, but you still need to verify the output
- Multi-color 3MF mapping to AMS filament slots needs manual confirmation for the first few prints
- The P1S doesn't have a fully automated "accept job from API" pipeline — you still physically load filament and press start
- Better approach: Generate the 3MF, present it to the admin, let them import into Bambu Studio for final review

---

## PART 3: Revised 3D Case Editor Plan — Phased Approach

### Local Testing Strategy

All development happens on a feature branch with isolation from the main site:

```
Branch:     claude/explain-codebase-mlkhijxvnk3a81fu-NvLPT (or a dedicated feature branch)
Frontend:   Feature flag NEXT_PUBLIC_ENABLE_3D_EDITOR=true (defaults to false)
Route:      /store/[slug]/customize — separate page, not linked from nav
Backend:    New content types added but not exposed in production Strapi admin until ready
CadQuery:   Runs as a separate Docker container, never deployed to production until Phase 5+
```

**Local dev setup:**
- Frontend: `npm run dev` with `.env.local` containing `NEXT_PUBLIC_ENABLE_3D_EDITOR=true`
- Backend: Local Strapi instance with test data
- CadQuery: Docker container with `docker-compose.dev.yml`
- Test with: localhost:3000/store/lp3-prysm-classic/customize

---

### Phase 0: 3D Asset Preparation (Pre-Code)

**Goal**: Create the GLB models that the browser will render.

**This is blocking — no code can be tested without models.**

#### Steps:

1. **In Fusion 360**: Open the LP3 PRYSM CLASSIC assembly
   - Ensure each customizable part is a separate component/body: `back_panel`, `bumper`, `frame`, `buttons`, etc.
   - Name components consistently (these names become mesh node names in the GLB)
   - Define the "design zone" on the back panel — this is the flat/gently-curved region where text is allowed. Mark it as a named face or separate body.

2. **Export to Blender** (via STEP or direct FBX):
   - Verify mesh node names match part names in Strapi
   - Optimize: Decimate to ~30-50k total polygons (all parts combined)
   - UV unwrap the design zone face(s) for proper decal projection
   - Set up proper pivot points (center of model)
   - Apply Draco compression on export

3. **Export as GLB**:
   - File: `lp3-prysm-classic.glb` (target: under 2MB compressed)
   - Test in https://gltf-viewer.donmccurdy.com/ to verify named nodes are accessible

4. **Create a mapping document**: Which Fusion 360 component → which GLB node name → which Strapi `product_part.name`

#### Deliverable:
- `frontend/public/models/lp3-prysm-classic.glb`
- `docs/model-mapping.json` (part name ↔ mesh node ↔ Strapi ID)

#### Validation:
- GLB loads in online viewer
- All parts are individually addressable by name
- File size under 2MB
- Design zone is identifiable (separate mesh or known UV region)

---

### Phase 1: Backend Schema Extensions

**Goal**: Extend the existing Strapi data model to support design zones and enhanced engravings. Uses the EXISTING infrastructure rather than creating parallel schemas.

#### 1a. New Content Type: `design-zone`

```json
{
  "kind": "collectionType",
  "collectionName": "design_zones",
  "info": {
    "singularName": "design-zone",
    "pluralName": "design-zones",
    "displayName": "Design Zone",
    "description": "Defines a customizable area on a product part surface"
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "product_part": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::product-part.product-part"
    },
    "mesh_node_name": {
      "type": "string",
      "required": true
    },
    "zone_type": {
      "type": "enumeration",
      "enum": ["text", "svg", "text_and_svg"],
      "required": true,
      "default": "text"
    },
    "max_characters": {
      "type": "integer",
      "default": 50,
      "min": 1,
      "max": 200
    },
    "allowed_styles": {
      "type": "json",
      "default": ["embossed", "debossed", "multicolor"]
    },
    "allowed_fonts": {
      "type": "json",
      "default": ["Arial", "Helvetica", "Georgia"]
    },
    "position_uv": {
      "type": "json"
    },
    "max_width_mm": {
      "type": "decimal"
    },
    "max_height_mm": {
      "type": "decimal"
    },
    "surcharge": {
      "type": "decimal",
      "default": 0
    },
    "active": {
      "type": "boolean",
      "default": true
    }
  }
}
```

**Why this matters**: This makes the system generic. Any product part can have design zones defined by the admin. The LP3 back panel might have one large zone. A future earbud case might have two small zones on each side. The frontend reads these zones and renders them dynamically — no hardcoding.

#### 1b. Extend `customization.engraving` Component

Add fields to the existing component (currently has: text, position, font):

```json
{
  "font_size": {
    "type": "decimal",
    "default": 12,
    "min": 6,
    "max": 72
  },
  "style": {
    "type": "enumeration",
    "enum": ["embossed", "debossed", "multicolor"],
    "default": "embossed"
  },
  "position_x": {
    "type": "decimal",
    "default": 0.5,
    "min": 0,
    "max": 1
  },
  "position_y": {
    "type": "decimal",
    "default": 0.5,
    "min": 0,
    "max": 1
  },
  "text_color": {
    "type": "relation",
    "relation": "oneToOne",
    "target": "api::color.color"
  },
  "design_zone": {
    "type": "relation",
    "relation": "oneToOne",
    "target": "api::design-zone.design-zone"
  },
  "svg_asset_url": {
    "type": "string"
  }
}
```

This extends what already exists rather than creating a parallel system. The existing `engravings` field on `cart-item` and `order-item` automatically gains these new fields.

#### 1c. Extend `product-part` Schema

Add inverse relation:
```json
"design_zones": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::design-zone.design-zone",
  "mappedBy": "product_part"
}
```

#### 1d. Add `three_d_model_url` Helper

The product already has `three_d_model_file` (media field). Ensure the product API populates it so the frontend can get the GLB URL. No schema change needed — just update the product controller/route to include it in the populate.

#### Validation:
- Create a design zone in Strapi admin for the LP3 back panel
- Verify it appears in `GET /api/design-zones?filters[product_part][id]=X`
- Verify cart-item creation with extended engraving data works
- Verify order-item preserves engraving data through checkout

---

### Phase 2: Frontend — Basic 3D Viewer (No Customization Yet)

**Goal**: Get a 3D model rendering in the browser, wired to the existing color selection system. No text editing yet.

#### 2a. Install Dependencies

```
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

#### 2b. New Files

```
frontend/
├── components/
│   └── CaseEditor/
│       ├── CaseEditor.tsx              # Modal wrapper, open/close logic
│       ├── CaseViewer3D.tsx            # R3F <Canvas> with lights, controls, environment
│       ├── CaseModel.tsx               # useGLTF, renders named mesh nodes with dynamic materials
│       └── types.ts                    # Editor-specific TypeScript types
├── hooks/
│   └── useEditorState.ts              # React state (or Context) for editor selections
└── public/
    └── models/
        └── lp3-prysm-classic.glb      # From Phase 0
```

#### 2c. CaseViewer3D Architecture

```tsx
// Simplified structure
<Canvas frameloop="demand" camera={{ position: [0, 0, 5], fov: 45 }}>
  <ambientLight intensity={0.4} />
  <directionalLight position={[5, 5, 5]} intensity={0.8} />
  <Suspense fallback={<LoadingSpinner3D />}>
    <CaseModel
      modelUrl="/models/lp3-prysm-classic.glb"
      partColors={selectedColors}         // Reuses existing product page state
      partToNodeMap={partToNodeMapping}    // From design-zone/model-mapping data
    />
  </Suspense>
  <OrbitControls
    enablePan={false}
    minDistance={3}
    maxDistance={8}
    minPolarAngle={Math.PI / 6}
    maxPolarAngle={Math.PI - Math.PI / 6}
  />
  <Environment preset="studio" />
</Canvas>
```

#### 2d. Integration Point

The existing product page (`app/store/[slug]/page.tsx`) gets a conditional button:

```tsx
{process.env.NEXT_PUBLIC_ENABLE_3D_EDITOR === 'true' && product.customizable && (
  <button onClick={() => setEditorOpen(true)}>
    Customize in 3D
  </button>
)}
```

This is hidden by default (feature flag off). When clicked, it opens the `CaseEditor` modal which shares the existing `selectedColors` state.

#### 2e. Color Sync

When the user picks a color in the existing 2D color picker, the 3D model updates in real-time. When the user picks a color by clicking a part in the 3D viewer, the 2D picker updates. Bidirectional sync via shared state.

#### Validation:
- GLB loads and renders with proper lighting
- Each part is individually colored based on `selectedColors`
- Clicking a part in 3D highlights it / opens its color picker
- OrbitControls work smoothly (rotate, zoom, constrained pan)
- Works on mobile (touch gestures for rotate/zoom)
- Performance: 60fps on mid-range phone, <3s initial load
- Feature flag works: editor hidden when flag is off

---

### Phase 3: Frontend — Text Customization Preview

**Goal**: Add text input, font selection, and visual text preview on the 3D model using decals.

#### 3a. New Components

```
components/CaseEditor/
├── TextCustomizer.tsx          # Text input, font dropdown, size slider, style toggle
├── DesignZoneOverlay.tsx       # Highlights available design zones on the model
├── TextDecal.tsx               # Renders text as a Decal on the mesh surface
└── FontLoader.ts               # Loads web fonts for canvas rendering
```

#### 3b. TextDecal Approach (Detailed)

```
User types "John 3:16"
  → Canvas 2D renders text with selected font
  → Canvas converted to THREE.CanvasTexture (color map)
  → Same canvas processed to generate a normal map (for emboss/deboss illusion)
  → Both textures applied to a <Decal> on the design zone mesh
  → Decal position/rotation/scale from design zone metadata
```

For **embossed** text: Normal map makes text appear raised (light from above creates shadows below letters)
For **debossed** text: Inverted normal map makes text appear recessed
For **multicolor** text: Color map uses the selected text_color, no normal map depth effect needed

#### 3c. Design Zone Visualization

When the user enters text editing mode:
- Design zones glow/highlight on the 3D model (semi-transparent overlay)
- User clicks a zone to select it as the target
- Zone boundaries shown as a subtle outline
- Text is constrained within the zone bounds

#### 3d. Font Strategy

Start with 3-5 system-safe fonts that are:
- Available as web fonts (Google Fonts or self-hosted)
- Licensed for commercial use on physical products
- Available as TTF on the CadQuery server (Phase 5)

Candidates: Inter, Roboto, Playfair Display, Oswald, Montserrat

#### 3e. Text Input Constraints

- Character limit from `design_zone.max_characters` (displayed as counter)
- Profanity filter (client-side basic check + server-side validation)
- Special character restrictions (only alphanumeric + basic punctuation)
- Real-time preview updates as user types (debounced at ~100ms)

#### 3f. UI Layout

```
┌─────────────────────────────────────────┐
│  [X Close]    Case Editor    [Done ✓]   │
├──────────────────────┬──────────────────┤
│                      │  Part Colors     │
│                      │  ┌──────────┐    │
│    3D Model View     │  │ Back     ▼│   │
│    (rotatable)       │  │ 🔴🔵⚪🟡  │   │
│                      │  │ Bumper   ▼│   │
│                      │  │ 🔴🔵⚪🟡  │   │
│                      │  └──────────┘    │
│                      │                  │
│                      │  Text Options    │
│                      │  ┌──────────┐    │
│                      │  │ Text: [  ]│   │
│                      │  │ Font: [▼] │   │
│                      │  │ Size: ━●━ │   │
│                      │  │ Style:    │   │
│                      │  │ ◉Emboss   │   │
│                      │  │ ○Deboss   │   │
│                      │  │ ○Color    │   │
│                      │  └──────────┘    │
├──────────────────────┴──────────────────┤
│  Price: $XX.XX (+$Y.YY for engraving)   │
│  [Add to Cart]                           │
└─────────────────────────────────────────┘
```

On mobile: stacked layout (3D view on top, controls below, scrollable).

#### Validation:
- Text renders on the correct design zone
- Emboss/deboss normal map looks convincing under directional light
- Multicolor text shows correct color
- Font changes update the preview
- Size slider works within zone constraints
- Character limit enforced
- Works on mobile (text input doesn't fight with 3D controls)
- Performance: Text updates don't cause frame drops

---

### Phase 4: Frontend — Cart & Checkout Integration

**Goal**: Wire the 3D editor selections into the existing cart/checkout flow.

#### 4a. "Done" Button Flow

When user clicks "Done" in the editor:
1. Editor state (colors + engravings) is captured
2. Modal closes, returns to product page
3. Product page shows a summary: "Custom text: John 3:16 (Embossed, Back Panel)"
4. Price updates to include surcharge from design zone

#### 4b. Add-to-Cart Payload Extension

The existing `handleAddToCart` in the product page already sends `customizations` (part + color pairs). Extend it:

```typescript
// Existing
data: {
  product: productId,
  quantity: 1,
  base_price: price,
  effective_price: adjustedPrice,  // Now includes engraving surcharge
  customizations: [
    { product_part: { id }, color: { id } }
  ],
  // NEW
  engravings: [
    {
      text: "John 3:16",
      position: "back",
      font: "Inter",
      font_size: 14,
      style: "embossed",
      position_x: 0.5,
      position_y: 0.5,
      design_zone: { id: zoneId },
      text_color: { id: colorId }    // Only for multicolor style
    }
  ]
}
```

This uses the EXISTING `engravings` field on `cart-item` schema — no new fields needed on the cart item itself.

#### 4c. Cart Page Display

The cart page (`app/cart/page.tsx`) needs to show engraving details for each cart item:
- "Custom text: John 3:16"
- "Style: Embossed | Font: Inter | Position: Back Panel"
- Option to remove engraving (set engravings to empty array)
- Option to edit (reopens editor with saved state)

#### 4d. Checkout & Order

The checkout flow already copies cart items to order items. Since `order-item` also has the `engravings` component field, the data flows through automatically. Verify:
- Order confirmation page shows engraving details
- Admin orders page shows engraving details
- Order confirmation email includes engraving details

#### 4e. Pricing Logic

Extend the pricing service (`backend/src/services/pricing.ts`) to include engraving surcharges:
- Look up `design_zone.surcharge` for each engraving
- Add to the item's effective_price
- Surcharge is per-engraving (user adds text to 2 zones → 2x surcharge)

#### Validation:
- Add customized item to cart → engravings persist
- Cart displays engraving details correctly
- Edit engraving from cart → editor opens with saved state
- Remove engraving from cart → price adjusts
- Checkout completes with engraving data intact
- Order record contains full engraving details
- Admin can see engraving details on the order
- Price includes surcharges correctly

---

### Phase 5: Server-Side Print File Generation (CadQuery Microservice)

**Goal**: Build the Python service that converts customization data into printable 3MF files.

**This is the most complex phase and the one most likely to need iteration.**

#### 5a. Infrastructure Setup

```
tnt-mkr/
├── print-service/                  # New top-level directory
│   ├── Dockerfile
│   ├── docker-compose.dev.yml
│   ├── requirements.txt            # cadquery, lib3mf, fastapi, uvicorn, python-fontconfig
│   ├── app/
│   │   ├── main.py                 # FastAPI app
│   │   ├── routes/
│   │   │   └── generate.py         # POST /generate endpoint
│   │   ├── services/
│   │   │   ├── cad_generator.py    # CadQuery logic: load STEP, apply text, boolean ops
│   │   │   ├── threemf_packager.py # lib3mf logic: multi-body, multi-color 3MF assembly
│   │   │   └── model_validator.py  # Manifold check, min wall thickness
│   │   ├── models/
│   │   │   └── lp3-prysm-classic/  # STEP files per part (from Fusion 360)
│   │   │       ├── back_panel.step
│   │   │       ├── bumper.step
│   │   │       └── frame.step
│   │   └── fonts/
│   │       ├── Inter.ttf
│   │       ├── Roboto.ttf
│   │       └── ...
│   └── tests/
│       ├── test_cad_generator.py
│       ├── test_threemf_packager.py
│       └── fixtures/
│           └── sample_config.json
```

#### 5b. CadQuery Generation Pipeline

```python
# Pseudocode for the generation pipeline

def generate_print_file(config: PrintConfig) -> Path:
    """
    config = {
        product_slug: "lp3-prysm-classic",
        parts: [
            { name: "back_panel", color: "#1a1a2e", color_name: "Midnight Blue" },
            { name: "bumper", color: "#ff6600", color_name: "Orange" },
        ],
        engravings: [
            {
                text: "John 3:16",
                font: "Inter",
                font_size: 14,
                style: "embossed",   # or "debossed" or "multicolor"
                position_x: 0.5,
                position_y: 0.5,
                design_zone: "back_text_zone",
                text_color: "#ffffff"  # only for multicolor
            }
        ]
    }
    """

    # 1. Load base STEP file for each part
    parts = {}
    for part in config.parts:
        parts[part.name] = cq.importers.importStep(
            f"models/{config.product_slug}/{part.name}.step"
        )

    # 2. For each engraving, apply text to the target part
    for engraving in config.engravings:
        target_part = parts[engraving.design_zone_part]
        text_solid = create_text_solid(engraving)

        if engraving.style == "embossed":
            parts[engraving.design_zone_part] = target_part.union(text_solid)
        elif engraving.style == "debossed":
            parts[engraving.design_zone_part] = target_part.cut(text_solid)
        elif engraving.style == "multicolor":
            # Keep text as separate body — it gets a different filament slot
            parts[f"{engraving.design_zone_part}_text"] = text_solid

    # 3. Export each part as STL
    stl_files = {}
    for name, solid in parts.items():
        path = f"/tmp/{config.order_id}/{name}.stl"
        solid.export(path)
        stl_files[name] = path

    # 4. Package into multi-color 3MF via lib3mf
    output_path = package_3mf(stl_files, config.parts, config.engravings)

    # 5. Validate the output
    validate_3mf(output_path)  # Manifold check, min thickness

    return output_path
```

#### 5c. API Endpoint

```
POST /api/generate-print-file
Authorization: Bearer <admin-or-service-token>

Request:
{
  "order_id": 12345,
  "order_item_id": 67890,
  "product_slug": "lp3-prysm-classic",
  "parts": [...],
  "engravings": [...]
}

Response (async — returns immediately, processes in background):
{
  "job_id": "uuid",
  "status": "queued"
}

GET /api/generate-print-file/status/{job_id}
Response:
{
  "status": "completed",           # queued | processing | completed | failed
  "file_url": "/files/order-12345.3mf",
  "preview_url": "/files/order-12345-preview.png",
  "error": null
}
```

#### 5d. Job Queue

Use a simple file-based or Redis-based queue (not Celery — too heavy for this volume):
- Order completion triggers a job
- Worker picks it up, runs CadQuery pipeline
- Result stored on disk or S3
- Status queryable via API
- Failed jobs logged with full error context for debugging

#### 5e. Font Management

Each font must exist in two places:
1. **Frontend**: Google Fonts CDN or self-hosted WOFF2 in `/public/fonts/`
2. **Print service**: TTF files in `print-service/app/fonts/`

Maintain a single source-of-truth font list in the `design-zone.allowed_fonts` field. Both frontend and print service read from the same Strapi data.

#### Validation:
- Generate a 3MF for a basic case (no text) — opens correctly in Bambu Studio
- Generate embossed text — visible raised geometry in Bambu Studio
- Generate debossed text — visible recessed geometry
- Generate multicolor — separate bodies with correct color assignments in Bambu Studio
- Load the 3MF onto P1S via Bambu Studio → prints correctly
- Failed generation produces a clear error (bad font, text too long, etc.)
- Job queue processes orders sequentially without race conditions

---

### Phase 6: Admin Workflow & Order Pipeline

**Goal**: Give the admin visibility into custom orders and a streamlined print workflow.

#### 6a. Admin Orders Enhancement

Extend the existing admin orders page (`app/admin/orders/page.tsx`):

- **Custom order badge**: Orders with engravings get a "CUSTOM" tag
- **Engraving details**: Expandable section showing text, style, font, position
- **Print file status**: "Generating..." → "Ready to Download" → "Downloaded" → "Printed"
- **Download button**: Direct download of the generated 3MF file
- **Preview thumbnail**: Auto-generated render of the customized case

#### 6b. Print Queue View (New Admin Page)

```
/admin/print-queue

┌──────────────────────────────────────────────┐
│  Print Queue                    [Refresh]    │
├──────────────────────────────────────────────┤
│  Order #1234 — LP3 PRYSM CLASSIC            │
│  Text: "John 3:16" (Embossed, Back Panel)   │
│  Colors: Midnight Blue + Orange Bumper       │
│  Status: ✅ Ready    [Download 3MF] [Mark Printed] │
├──────────────────────────────────────────────┤
│  Order #1235 — LP3 PRYSM CLASSIC            │
│  Text: "Romans 8:28" (Multicolor, Back)      │
│  Colors: Black + White Text                  │
│  Status: ⏳ Generating...                    │
├──────────────────────────────────────────────┤
```

#### 6c. Workflow

```
Order Paid
  → Webhook processes payment
  → If order has engravings:
      → Queue print file generation job
      → Mark order as "Custom - Awaiting Print File"
  → Print service generates 3MF
  → Admin sees "Ready" in print queue
  → Admin downloads 3MF
  → Admin opens in Bambu Studio, verifies, slices
  → Admin sends to P1S, prints
  → Admin marks as "Printed" in the queue
  → Standard fulfillment continues (pack & ship)
```

This is intentionally semi-manual for Phase 6. Full automation (auto-slice, auto-send-to-printer) is a future optimization once the pipeline is proven reliable.

#### Validation:
- Custom orders appear in print queue
- 3MF download works
- Status transitions work correctly
- Non-custom orders are unaffected

---

### Phase 7: Polish & Production Readiness

**Goal**: Harden everything for real users.

#### 7a. Performance Optimization

- **GLB compression**: Draco + KTX2 texture compression
- **Lazy loading**: 3D editor code split with `next/dynamic` (don't load Three.js until editor opens)
- **LOD (Level of Detail)**: Lower-poly model for mobile, higher for desktop
- **`frameloop="demand"`**: Only render when the scene changes (saves battery on mobile)
- **Texture atlas**: Combine decal textures to reduce draw calls

#### 7b. Error Handling

- GLB load failure → Graceful fallback to 2D color picker
- WebGL not supported → Message + fallback to 2D
- Text too long for zone → Visual clipping + warning
- Print generation failure → Admin notification + manual retry button
- Network failure during save → Auto-retry with saved state

#### 7c. Accessibility

- Keyboard navigation for 3D controls (arrow keys for rotation)
- Screen reader description of current customization state
- High contrast mode for design zone indicators
- Focus management when modal opens/closes

#### 7d. Input Validation & Security

- Server-side profanity filter on engraving text
- SVG sanitization (strip scripts, event handlers, external references)
- Character whitelist for engraving text
- Rate limiting on print file generation endpoint
- File size limits on SVG uploads (if supported)
- CSP headers updated for Three.js WebGL context

#### 7e. Testing

- **Unit tests**: Font rendering, price calculation with surcharges, text validation
- **Integration tests**: Cart flow with engravings, order creation with engravings
- **E2E tests**: Full customize → add to cart → checkout → print file generation
- **Visual regression**: Screenshot comparison of 3D renders
- **Load testing**: CadQuery generation under concurrent requests
- **Print testing**: Actually print 10+ test cases on the P1S, verify quality

#### Validation:
- Lighthouse score stays above 90 on product pages (editor code-split)
- Mobile performance acceptable (test on real mid-range Android)
- All edge cases handled gracefully
- 10 successful test prints with varying text/fonts/styles

---

### Phase 8: Future Enhancements (Not in Initial Scope)

These are documented for planning purposes but NOT implemented in the initial release:

1. **SVG/symbol library**: Pre-made symbols (cross, heart, star, custom logos) that users can place in design zones. Requires SVG → mesh extrusion in CadQuery.

2. **Image upload**: User-uploaded images converted to embossed/debossed relief. Requires grayscale → heightmap → mesh displacement.

3. **Auto-slicing pipeline**: Bambu Studio CLI integration to auto-slice 3MF files and send to printer queue without manual Bambu Studio import.

4. **AR preview**: Use model-viewer's AR mode to let users see their customized case in their hand via phone camera.

5. **Save & share designs**: Users save designs to their `user-custom-case` profile, optionally make them public. Gallery of community designs.

6. **Multi-zone text**: Text on multiple design zones simultaneously (left side + right side + back).

7. **Curved text**: Text that follows a curve or arc on the case surface.

8. **Real-time pricing API**: Price updates live as the user customizes, accounting for text length, number of colors, etc.

---

## PART 4: Technology Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| 3D rendering | React Three Fiber + drei | Only option with GLB + decals + React integration + mobile perf |
| Text preview | Decal + CanvasTexture + Normal Map | Realistic emboss/deboss without geometry modification |
| State management | React Context (existing) or Zustand | Zustand if editor state complexity warrants it |
| CAD generation | CadQuery (Python) | Best text extrusion + boolean ops + STEP import + server-ready |
| 3MF assembly | lib3mf (Python) | Official 3MF reference impl, per-body material assignment |
| Job queue | Redis + simple worker (or BullMQ) | Async print file generation |
| Containerization | Docker + docker-compose | CadQuery requires OpenCASCADE (heavy native dep) |
| Slicing | Bambu Studio GUI (manual for now) | CLI automation deferred to Phase 8 |
| Fonts | Google Fonts (web) + TTF (server) | Licensed for commercial use |

---

## PART 5: Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CadQuery text extrusion fails on curved surfaces | Medium | High | Test with actual STEP files early in Phase 5; fallback to flat-surface-only zones |
| GLB model too large for mobile | Medium | Medium | Aggressive decimation, Draco compression, LOD switching |
| Font rendering mismatch (browser vs CadQuery) | High | Medium | Use identical TTF files on both sides; visual comparison testing |
| Multi-color 3MF not recognized by Bambu Studio | Low | High | Test with standard 3MF spec; Bambu Studio docs confirm face-coloring support |
| Users type inappropriate text | High | Low | Profanity filter + admin review before printing |
| CadQuery Docker image too large for deployment | Medium | Medium | Multi-stage build; ~1.5GB compressed is typical for CadQuery |
| Three.js bundle size impacts page load | Medium | Medium | Code splitting — only load when editor opens |

---

## PART 6: Estimated Phase Durations

| Phase | Description | Blocking Dependencies | Estimated Duration |
|-------|-------------|----------------------|-------------------|
| 0 | 3D Asset Preparation | Fusion 360 access | 2-4 days (design work) |
| 1 | Backend Schema Extensions | None | 1-2 days |
| 2 | Basic 3D Viewer | Phase 0 (GLB file), Phase 1 (design zones) | 3-5 days |
| 3 | Text Customization Preview | Phase 2 | 4-7 days |
| 4 | Cart & Checkout Integration | Phase 1, Phase 3 | 2-3 days |
| 5 | CadQuery Microservice | Phase 0 (STEP files) | 5-8 days |
| 6 | Admin Workflow | Phase 4, Phase 5 | 3-4 days |
| 7 | Polish & Production | All above | 3-5 days |

**Phases 0-4 can be developed and tested without the CadQuery service.** The browser preview is independent of print file generation. This means you can get the user-facing customization experience live while the print pipeline is still being built.

**Phases 1-4 (frontend + backend) can proceed in parallel with Phase 5 (CadQuery service)** once the schemas are defined.
