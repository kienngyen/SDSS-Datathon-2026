# SDSS Datathon 2026 — Airfare Markets Under Pressure

## Prerequisites

- Python 3.12+
- Node.js 20+

## Setup & Run

### 1. Install Python dependencies (for notebooks/analysis)

```bash
pip install -r requirements.txt
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Build for deployment (GitHub Pages)

```bash
npm run build
```

Static files will be in the `frontend/dist/` folder.

## Project Structure

```
├── data_case/
│   └── Airline Tickets/
│       ├── airline_ticket_dataset.csv
│       └── context.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # React components (USMap, MapContainer)
│   │   ├── data/              # Static JSON data (airport coords, TopoJSON)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── requirements.txt
```
