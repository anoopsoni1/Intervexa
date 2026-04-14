# ResumeAI Template Flow

Last updated: 2026-04-14

## 1) High-Level Flow

1. User opens template list pages:
   - Resume list: `/templates/modern/resumedesign`
   - Portfolio list: `/templates/portfoliodesign`
2. Frontend fetches templates from backend:
   - `GET /api/v1/user/templates?type=resume`
   - `GET /api/v1/user/templates?type=portfolio`
3. User clicks a template card.
4. Frontend opens view page:
   - Resume view: `/templates/resumedesign/:id`
   - Portfolio view: `/templates/portfoliodesign/:id`
5. Frontend fetches selected template:
   - New dynamic route: `GET /api/templates/:templateId?type=resume|portfolio`
   - Legacy fallback route: `GET /api/v1/user/templates/:id`
6. Frontend fetches user content data from:
   - `GET /api/v1/user/get-detail`
7. Renderer decides:
   - If `layout` exists and has nodes -> dynamic JSON rendering
   - If `layout` is empty (legacy templates) -> fallback legacy component rendering

---

## 2) Backend Flow

### Template Model (`Backend/src/models/Template.model.js`)

- Main fields:
  - `name` (`modern | classic | minimal | premium`)
  - `templateId` (unique logical id, e.g. `modern_resume`)
  - `type` (`resume | portfolio`)
  - `layout` (array of JSON nodes)
  - `createdAt`
- Uniqueness:
  - Compound unique index on `{ templateId, type }`

### Template JSON Node Shape

Each `layout` node supports:

```json
{
  "type": "container | section | heading | text | list",
  "key": "string",
  "value": "string with {{placeholders}}",
  "source": "string path for array data",
  "styles": {},
  "children": []
}
```

### APIs

- `GET /api/templates`
  - Optional query: `?type=resume|portfolio`
  - Returns grouped templates in `data.resume` / `data.portfolio`
  - Also returns compatibility array in `items`
- `GET /api/templates/:templateId?type=resume|portfolio`
  - Looks up by `templateId + type`
  - Backward compatible with Mongo `_id` links

### Seed

- Script: `Backend/src/scripts/seedTemplates.js`
- Data: `Backend/src/data/templateLayouts.js`
- Command:

```bash
cd Backend
npm run seed:templates
```

---

## 3) Frontend Flow

## Resume

- List page: `Frontend/src/modernResumedesignviewpage.jsx`
  - Fetches resume templates
  - Filters modern templates (supports legacy records with missing `style`)
- View page: `Frontend/src/ResumeView.jsx`
  - Fetch template by id/templateId
  - Fetch user detail data
  - Render:
    - Dynamic renderer if `layout.length > 0`
    - Legacy resume layout components if no layout

## Portfolio

- List page: `Frontend/src/TemplatesDesign.jsx`
  - Fetches portfolio templates
  - Filters style with legacy-safe logic
- View page: `Frontend/src/PortfolioDesignView.jsx`
  - Fetch template by id/templateId
  - Fetch user detail data
  - Render:
    - Dynamic renderer if `layout.length > 0`
    - Legacy fallbacks for Portfolio 1-6 when layout is empty

---

## 4) Dynamic Renderer Flow

### Files

- `Frontend/src/components/DynamicTemplateRenderer.jsx`
- `Frontend/src/utils/placeholder.js`

### Runtime Steps

1. Read template `layout` from API response.
2. Call `renderNode(node, data)` recursively.
3. Resolve placeholders via `replacePlaceholders("{{...}}", data)`.
4. For list nodes:
   - Read array by `source`
   - Iterate items
   - Render `value`/children for each item
5. Apply styles from `node.styles` as:
   - `className` (Tailwind classes)
   - inline styles (remaining style object)

---

## 5) Compatibility Rules (Current)

- Old templates without `style` are treated as modern for listing.
- Old links that pass Mongo `_id` still work for `/api/templates/:templateId`.
- Old templates with empty `layout` still render using legacy fallback components.

---

## 6) Recommended Next Steps

1. Add full layout JSON for every existing template in DB.
2. Verify each template output matches old design exactly.
3. Once all layouts are present, remove legacy fallback rendering paths.
4. Keep only dynamic route usage in frontend (remove old `/api/v1/user/templates/:id` fallback).

---

## 7) Documentation Notes

- This file documents current behavior and compatibility paths.
- If template APIs or fallback rendering change, update this file together with the related controllers/pages.

