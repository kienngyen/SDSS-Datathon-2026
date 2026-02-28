# analysis execution.md — Airline Ticket Data Analysis

## Project Context
- **Competition:** SDSS Datathon 2026
- **Goal:** Analyze domestic U.S. airfare markets to uncover structural drivers of ticket
  affordability across competition, hub dominance, route demand, and distance
- **Data:** `dataset/airline_ticket_data.csv` — 14,004 rows, one row per city-pair/quarter
- **Output:** A Jupyter notebook (`analysis/analysis.ipynb`) with all analysis and
  visualizations for a 15-slide presentation

## Column Reference
| Column | Role |
|---|---|
| `fare` | **Target variable** — average ticket price |
| `nsmiles` | Distance (miles) |
| `passengers` | Daily demand |
| `large_ms`, `fare_lg`, `carrier_lg` | Dominant carrier market share + price |
| `lf_ms`, `fare_low`, `carrier_low` | LCC/cheapest carrier share + price |
| `TotalPerPrem_city1/2` | City-level fare premium (+ = expensive, − = discount) |
| `TotalPerLFMkts_city1/2` | % of city's passengers on routes with LCC |
| `TotalFaredPax_city1/2` | Total city market size |
| `Year`, `quarter` | Time dimension (2022–2025, Q1–Q4) |

## Notebook Structure
The notebook must follow this exact phase order. Each phase = its own clearly marked
section with a markdown header. Do not skip ahead or reorder phases.

---

### Phase 0: Setup & Data Loading
- Import libraries (pandas, numpy, matplotlib, seaborn)
- Load `dataset/airline_ticket_data.csv`
- Parse `passengers` (strip commas) and `fare` (strip `$`, commas) to float
- Print `.info()`, `.describe()`, and check for nulls
- Engineer derived columns used across all phases:
  - `fare_per_mile` = fare / nsmiles
  - `distance_band` = "Short" (<300 mi), "Medium" (300–800 mi), "Long" (800–1500 mi), "Ultra" (>1500 mi)
  - `competition_tier` = "Monopoly" (large_ms > 0.80), "Dominant" (0.50–0.80), "Competitive" (<0.50)
  - `has_lcc` = boolean, True if lf_ms > 0.05
  - `city_size_1/2` = "Major" (TotalFaredPax > median) or "Secondary" (≤ median)
  - `route_type` = "Hub-Hub", "Hub-Secondary", "Secondary-Secondary" based on city_size_1/2
- **Deliverable:** Clean dataframe `df` ready for analysis

---

### Phase 1: Equity & Overpricing Analysis
**Goal:** Identify which routes and cities pay more than their peers at comparable distance

Steps:
1. **Overpriced routes (fare-per-mile benchmark):**
   - Within each `distance_band`, compute the median `fare_per_mile`
   - Flag routes where `fare_per_mile` > 1.5× their band's median as overpriced
   - List top 20 overpriced routes (route name, fare, fare_per_mile, competition_tier)

2. **Secondary city penalty:**
   - Compare mean `fare` for routes by `route_type` (Hub-Hub vs. Hub-Secondary vs. Secondary-Secondary)
   - Report the premium ($/ticket) that secondary cities pay vs. Hub-Hub routes
   - Control for distance: repeat comparison within each `distance_band`

3. **Monopoly fare premium:**
   - Group by `competition_tier`, compute mean `fare` and mean `fare_per_mile`
   - Report monopoly penalty ($) vs. competitive routes
   - Break down by `distance_band` to show where monopoly hurts most

4. **LCC desert analysis:**
   - Identify cities where `TotalPerLFMkts_city` < 0.50 (low LCC access)
   - Compare mean `fare` on routes touching LCC-desert cities vs. LCC-served cities

**Deliverable:** Affordability scatter plot (x = TotalPerPrem avg of city1+city2, y = fare_per_mile,
color = competition_tier, size = passengers)

---

### Phase 2: Temporal Dynamics
**Goal:** Identify fare trends and seasonal patterns (2022–2025)

Steps:
1. Average `fare` by Year + quarter → time series line chart
2. Seasonal index: for each quarter, compute % deviation from that year's annual mean fare
3. Route volatility: std dev of `fare` per route across all quarters
   - Rank top 20 most volatile and top 20 most stable routes
   - Compare characteristics (distance, competition_tier, route_type) of volatile vs. stable
4. Market evolution: plot average `large_ms` and mean `lf_ms` by year to show consolidation/LCC trends

**Deliverable:** Time series chart, seasonal pattern bar chart, route stability ranking table

---

### Phase 3: Six Pattern Analyses
Each pattern must produce exactly one key visualization and one quantified finding stated
as a markdown callout cell immediately after the chart.

1. **Distance Paradox** — fare_per_mile by distance_band × competition_tier (grouped bar chart)
   - Finding: short monopoly routes should show highest $/mile despite shortest distance

2. **LCC Valuation Effect** — mean fare for has_lcc=True vs. False, within each distance_band
   - Finding: quantify $ savings from LCC presence per distance band

3. **Hub Dominance Matrix** — heatmap of mean fare across route_type × competition_tier
   - Finding: which combination is most expensive for consumers

4. **Demand Paradox** — 2×2 grid (High/Low passengers × Competitive/Monopoly) mean fare
   - Split demand at median passengers; split competition at large_ms = 0.50
   - Finding: identify which quadrant is cheapest/most expensive

5. **Temporal Volatility** — scatter of route volatility (std dev fare) vs. mean fare
   - Color by route_type; annotate top 5 most volatile routes by name
   - Finding: do volatile routes also tend to be more expensive on average?

6. **Monopoly Penalty by Segment** — table: mean fare for Monopoly vs. Competitive
   within Short / Medium / Long / Ultra distance bands
   - Finding: where is the monopoly penalty largest in absolute and % terms?

---

### Phase 4: Findings Summary
- Synthesize top 5–7 findings
- Each finding: one-sentence headline + one supporting stat + one stakeholder recommendation
- Do not build slides here — this is the data layer the presentation will draw from

---

## Coding Conventions
- Use `matplotlib` + `seaborn` for all plots. No plotly unless requested.
- Every chart must have: title, axis labels, and a 1-sentence caption in a markdown cell below it
- Name all key intermediate dataframes clearly (e.g., `df_monopoly`, `df_seasonal`, `df_volatility`)
- Do not overwrite `df` — always create named copies
- Round all reported dollar figures to 2 decimal places; percentages to 1 decimal place

## What NOT to Do
- Do not build regression or machine learning models — descriptive and comparative analysis only
- Do not use external data sources — only `dataset/airline_ticket_data.csv`
- Do not combine all phases into one giant cell block; keep phases clearly separated
- Do not skip the derived columns in Phase 0; later phases depend on them
