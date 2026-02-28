# SDSS-Datathon-2026

## Frontend Map MVP

We've added a rough React/TypeScript/Tailwind skeleton to display an interactive US map. The new files are in `frontend/src/components`:

- `USMap.tsx` – placeholder SVG map that reports click coordinates
- `FlightPath.tsx` – draws a line between two points
- `MapContainer.tsx` – coordinates state (start/end) and renders the map with path

To see it in action, run the frontend app (`cd frontend && npm install && npm run dev`) and click on the map to select a start and end point.

> **Tailwind setup**: if not already installed, add the required packages:
> ```bash
> cd frontend
> npm install -D tailwindcss postcss autoprefixer
> npx tailwindcss init -p
> ```
> and make sure `tailwind.config.js` includes the content paths and that `@tailwind base`, `@tailwind components`, and `@tailwind utilities` are included at the top of `src/index.css` (see the repo for an example).

> **Note**: `postcss.config.js` now uses ESM syntax (`export default`) because the frontend `package.json` declares
> `

Feel free to replace the placeholder SVG with a real US topology or map library later.

SDSS Datathon 2026 source code by:
