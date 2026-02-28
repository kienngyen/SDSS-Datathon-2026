# Strategic Analysis Plan: Airfare Markets Under Pressure

## Executive Summary

This document outlines a **focused analytical strategy** for the airline ticket datathon case. Rather than exploring everything, we've prioritized **high-impact questions** that align with the case brief and judges' evaluation criteria.

**Guiding Principle:** Focus on problems that matter to real stakeholders (travelers, platforms, policymakers) and reveal actionable, contestable insights.

---

## Part 1: Strategic Framework

### Case Objective (From Brief)
> "To better understand the factors driving ticket affordability across domestic U.S. air travel, use evidence-based insights that focus on market fundamentals such as competition, hub dominance, route demand, and distance."

### Key Stakeholders & Their Questions

**1. TRAVELERS (Individual Consumers)**
- "When will I pay more or less for a flight?"
- "Which routes should I avoid? Which are good deals?"
- "How much can I save by choosing a different carrier?"
- **Insight Needed:** Actionable guidance on affordable vs. expensive routes

**2. TRAVEL PLATFORMS (Kayak, Google Flights, Expedia)**
- "How do we highlight good deals to users?"
- "Which routes should we warn users about (high prices)?"
- "Can we predict which routes will see price changes?"
- **Insight Needed:** Metrics & patterns to score route affordability

**3. AIRLINES**
- "How does our pricing compare to competitors?"
- "In which markets do I have pricing power?"
- "How does LCC presence affect my revenue?"
- **Insight Needed:** Competitive positioning analysis, hub value assessment

**4. POLICYMAKERS & CONSUMER ADVOCATES**
- "Are certain cities/travelers getting unfair prices?"
- "Is competition broken in certain markets?"
- "What market concentration levels are concerning?"
- **Insight Needed:** Equity analysis, monopoly identification, policy recommendations

### What Makes an Insight "Strong" for Judges?

✅ **Actionable:** Can someone actually use this to make a decision?  
✅ **Contestable:** Goes beyond surface-level ("farther = more expensive")  
✅ **Quantified:** Backed by data with effect sizes, not just correlations  
✅ **Explainable:** Tells a story about WHY, not just WHAT  
✅ **Surprising:** Challenges a common myth or reveals something non-obvious

---

## Part 2: Core Questions to Answer

We'll organize analysis around **3 nested research questions** (big → medium → small):

### **BIG QUESTION 1: What Structural Factors Drive Airfare Prices?**

This is the foundational question for modeling and prediction.

#### Questions to Investigate:
1. **Distance Effect:**
   - How much does distance alone explain fare variation?
   - Is the relationship linear or logarithmic?
   - Do certain distance bands behave differently?
   - *Why this matters:* Distance is a cost factor; understanding its power helps predict baseline fares

2. **Demand Effect (Passenger Volume):**
   - Do higher-demand routes have higher or lower fares?
   - Is there an "optimal demand" sweet spot?
   - How does demand interact with competition?
   - *Why this matters:* High demand could mean premium pricing (seller power) or lower fares (volume efficiency)

3. **Competition Effect (Market Concentration):**
   - What is the "fare penalty" for monopoly routes vs. competitive routes?
   - At what level of market concentration does pricing power kick in?
   - Quantify: Median largest carrier market share is 54% — is this competitive?
   - *Why this matters:* Core to understanding pricing power and consumer welfare

4. **Hub/City Power Effect:**
   - Do routes touching major hubs (NYC, Atlanta, Chicago) cost more?
   - Does city-level `TotalPerPrem_city*` predict route-level fares?
   - Are secondary cities systematically overcharged?
   - *Why this matters:* Geographic equity; reveals who pays premiums for convenience/connectivity

5. **LCC Presence Effect:**
   - How much cheaper are routes with low-cost carriers?
   - Is LCC presence correlated with lower market-wide fares?
   - Do LCCs undercut dominant carriers?
   - *Why this matters:* Policy question — does competition policy (LCC access) work?

**Success Metric:** Build a fare prediction model with 70%+ R² that identifies top 3–5 drivers

**Deliverable:** 
- Regression output showing which factors matter most
- "Fare driver importance" chart for presentation
- Example: "Distance explains 45% of variation; competition explains 35%; hub status explains 15%; demand explains 5%"

---

### **BIG QUESTION 2: Are Certain Routes/Cities Getting Unfairly High Prices?**

This is the **equity & affordability** question — critical for student/policy angle.

#### Questions to Investigate:
1. **Overpriced Routes:**
   - Which routes cost more than their "fundamentals" suggest?
   - *Approach:* Build prediction model from Q1; find large positive residuals
   - *Example:* "Route XYZ is 40% more expensive than similar routes"
   - *Why:* Identifies potentially exploitative markets or monopoly abuse

2. **Secondary City Penalty:**
   - Do routes involving smaller cities cost more?
   - Hypothesis: Secondary cities have less LCC competition, fewer airline options
   - Quantify the "secondary city tax"
   - *Example:* "Flights from Des Moines are on average $35 more expensive than comparable routes"
   - *Why this matters:* Regional equity; students/families in smaller cities pay more

3. **Hub Capture:**
   - Are routes connecting through major hubs more expensive?
   - Do passengers in hub cities enjoy cheaper fares (network connectivity)?
   - Or do they pay a premium for convenience?
   - *Hypothesis:* Major hubs have both (cheaper in some routes due to competition, but premium pricing power in others)

4. **Monopoly Routes:**
   - How many routes are served by a single carrier (100% market share)?
   - How many by duopolies (2 carriers > 80%)?
   - What is the fare premium for these routes?
   - *Example:* "15% of routes are monopoly; these routes are 25% more expensive than competitive routes"

5. **LCC Desert:**
   - Which cities have zero LCC service?
   - Do travelers from these cities pay higher fares?
   - *Example:* "In routes with no LCC, average fare is $285; with LCC, it's $245 (14% cheaper)"

**Success Metric:** Identify 5–10 "equity concerns" with quantified impact

**Deliverable:**
- "Affordability Heat Map": Geographic visualization showing expensive vs. cheap cities
- "Monopoly Routes Dashboard": List routes with concerning market concentration
- "Secondary City Penalty" analysis with effect size
- Policy recommendation: e.g., "Address LCC access to X cities; increases competition would save travelers $50M/year"

---

### **BIG QUESTION 3: How Have Prices Changed Over Time? Are There Seasonal Patterns?**

This is the **temporal dynamics** question — reveals trends and planning insights.

#### Questions to Investigate:
1. **Overall Price Trend (2022–2025):**
   - Are fares rising, falling, or stable?
   - How much of change is inflation vs. market structure change?
   - *Example:* "Real fares up 8% since 2022, driven by consolidation + fuel prices"

2. **Seasonal Patterns:**
   - Q1 (Winter/Spring): Budget season? Peak demand = high price?
   - Q2 (Spring/Summer): Summer vacation demand?
   - Q3 (Fall): Labor Day, back-to-school?
   - Q4 (Holiday): Holiday premium?
   - *Why:* Travelers want to know when to book

3. **Route-Specific Trends:**
   - Do all routes follow the same seasonal pattern?
   - Are some routes stable, others volatile?
   - *Hypothesis:* Business routes (NYC-SF) may be stable; leisure routes (NYC-Orlando) volatile
   - *Why:* Forecasting; identifying predictable vs. unpredictable markets

4. **Market Evolution:**
   - Has market concentration increased or decreased?
   - Is LCC penetration growing or shrinking?
   - *Example:* "LCC market share growing 2% per year; monopoly routes decreasing"

5. **Demand Trends:**
   - How has passenger volume changed?
   - Are high-volume routes growing faster/slower?

**Success Metric:** Clear temporal trends with 1–2 predictable seasonal patterns

**Deliverable:**
- Time series chart: Average fare by quarter (2022–2025)
- Seasonal decomposition: Identify Q1 vs. Q4 patterns
- Route volatility ranking: Which routes predictable vs. volatile?
- Forecast example: "Based on trends, expect Q4 2025 fares 5% higher than Q3"

---

## Part 3: Pattern Analysis (What to Investigate Across Dimensions)

### Pattern 1: The Distance Paradox
**Question:** Does distance always mean higher fares?

**Hypothesis:** Distance is a cost driver, but not the only one. Short routes with monopoly/hub power might be more expensive (per mile) than long, competitive routes.

**Analysis:**
- Segment routes by distance: <300 mi, 300–800 mi, 800–1500 mi, >1500 mi
- Within each segment, compare fares by market concentration
- Calculate: Price per mile for each route
- Expected pattern: Price per mile declines with distance (economy of scale) BUT increases with concentration

**Why This Matters:**
- Reveals that monopolies can charge more even on short routes
- Shows that LCC on long routes can undercut on distance alone
- **Narrative Hook:** "It's not about distance; it's about competition"

---

### Pattern 2: The LCC Valuation Effect
**Question:** How much is LCC presence worth to consumers?

**Hypothesis:** Routes with LCC present should have lower fares overall (competitive effect)

**Analysis:**
- Compare: Routes with lf_ms > 0 vs. routes with lf_ms ≈ 0 (no LCC)
- Control for: Distance, demand, hub status
- Calculate: Average fare and fare gap (largest carrier vs. LCC)
- Does LCC presence affect prices even for non-LCC carriers?

**Expected Pattern:**
- Routes with LCC: avg fare $220, gap between largest and LCC is $45
- Routes without LCC: avg fare $260, no competitive pressure
- **Effect size:** LCC presence worth ~$40/ticket to travelers

**Why This Matters:**
- Quantifies the value of competition policy
- Shows that even non-LCC carriers lower prices when LCC enters
- **Policy angle:** "Expanding LCC access to X cities could save $X million/year"

---

### Pattern 3: The Hub Dominance Matrix
**Question:** How do hubs use market power — to raise prices or build networks?

**Hypothesis:** Major hubs might have:
- **Premium pricing** on routes within the hub network (connectivity tax)
- **Competitive pricing** on routes from hub to secondary cities (defending market)

**Analysis:**
- Rank cities by TotalPerPrem_city* (pricing power)
- Identify major hubs: NYC, Atlanta, Chicago, Dallas, LA, San Francisco
- Classify routes as:
  - Hub-to-Hub (NYC↔LA, Chicago↔Atlanta)
  - Hub-to-Secondary (NYC↔Des Moines)
  - Secondary-to-Secondary (Des Moines↔Cincinnati)
- Compare fares and market concentration across these categories

**Expected Pattern:**
- Hub-to-Hub: Competitive (multiple airlines), moderate fares
- Hub-to-Secondary: Dominated by hub airline, higher fares
- Secondary-to-Secondary: Lowest fares, least competition

**Why This Matters:**
- Reveals hub airlines' strategy: network hub creates pricing power
- Shows geographic inequity: secondary cities pay premium to connect
- **Narrative:** "Hub airlines use their network to charge premium on connecting flights"

---

### Pattern 4: The Demand Paradox
**Question:** Does higher demand mean higher or lower prices?

**Hypothesis:** Complex relationship:
- **High demand with competition:** Lower fares (volume efficiency, capacity utilization)
- **High demand with monopoly:** Higher fares (seller power)
- **Low demand with monopoly:** Surprisingly high fares (thin market premium)

**Analysis:**
- Segment routes by passenger volume quartiles
- Within each quartile, compare fares by market concentration
- Create 2×2 matrix: High/Low demand × Competitive/Monopoly
- Calculate average fare in each quadrant

**Expected Pattern:**
```
                    Competitive (LCC > 0)    Monopoly (MS > 0.80)
High Demand         $210 (price war)         $280 (seller power)
Low Demand          $250 (premium)           $320 (thin market)
```

**Why This Matters:**
- Shows that both monopoly AND low demand hurt consumers
- Reveals the "sweet spot": high-demand competitive routes are cheapest
- **Narrative:** "Thin-market premium: rare routes cost more per seat even if fewer flights"

---

### Pattern 5: The Temporal Volatility Pattern
**Question:** Are prices predictable? Which routes are stable?

**Hypothesis:** Business/hub routes (NYC-SF) are stable; leisure/secondary routes (seasonal) are volatile

**Analysis:**
- Calculate standard deviation of fare across quarters (2022–2025) for each route
- Rank routes by volatility
- Compare: Volatile vs. stable routes by distance, demand, hub status
- Classify routes: Business-focused vs. leisure-focused

**Expected Pattern:**
- Stable routes: High-volume, hub-to-hub (NYC-LA, Atlanta-Chicago)
- Volatile routes: Seasonal leisure (NYC-Miami, Chicago-Phoenix spikes in winter)
- Hub status moderates volatility (hubs have stable year-round demand)

**Why This Matters:**
- Helps travelers decide when to book
- Identifies which routes benefit from advance booking
- **Narrative:** "Book 2 months ahead on leisure routes, but hub routes are predictable year-round"

---

### Pattern 6: The Monopoly Penalty Across Segments
**Question:** What is the price of monopoly? Does it vary by route type?

**Hypothesis:** Monopoly power's value depends on the market:
- **Long routes:** Limited LCC options anyway; monopoly premium moderate
- **Short routes:** LCC could easily serve; monopoly premium higher
- **Hub routes:** Network effects limit LCC entry; monopoly premium justified
- **Secondary routes:** Thin demand + monopoly = highest per-unit premium

**Analysis:**
- For each distance band and hub category, calculate:
  - Average fare when largest_ms > 0.80 (monopoly)
  - Average fare when largest_ms < 0.50 (competitive)
  - Difference = monopoly penalty

**Expected Pattern:**
```
                    Monopoly    Competitive    Penalty
Short-haul          $240        $180          +$60 (+33%)
Medium-haul         $260        $220          +$40 (+18%)
Long-haul           $310        $270          +$40 (+15%)
```

**Why This Matters:**
- Shows where monopoly abuse is most severe
- Informs policy: "Target short routes and secondary-city routes for LCC access"
- **Narrative:** "Monopoly is most harmful on short routes where competition is easiest"

---

## Part 4: Phased Analytical Roadmap

### Phase 1: Foundation (Days 1–1.5)
**Goal:** Answer "What drives fares?" with quantified model

**Tasks:**
1. Data cleaning & validation
2. Univariate analysis: Correlation of each feature with fare
3. Multiple regression: `fare ~ distance + passengers + large_ms + lf_ms + TotalPerPrem_city1/2 + year + quarter`
4. Feature importance ranking

**Deliverable:**
- Regression table showing coefficients, significance, R²
- Visualization: Feature importance bar chart
- Example insight: "Distance explains 40%, competition explains 35%"

**Success Criterion:** Clear ranking of top 3–5 fare drivers

---

### Phase 2: Equity & Overpricing (Days 1.5–2.5)
**Goal:** Identify "unfair" routes and cities

**Tasks:**
1. Calculate residuals from Phase 1 model (actual - predicted fare)
2. Rank routes by positive residuals (overpriced)
3. Identify secondary cities and quantify their fare penalty
4. Create "Affordability Heat Map" by city
5. Monopoly analysis: routes with large_ms > 0.80

**Deliverable:**
- "Overpriced Routes" list (top 20)
- "Secondary City Penalty" analysis with effect size
- Geographic heat map
- Monopoly route count and fare premium

**Success Criterion:** 5–10 specific, quantified equity findings

---

### Phase 3: Temporal Dynamics (Days 2.5–3)
**Goal:** Understand price trends and seasonality

**Tasks:**
1. Time series: Average fare by quarter (2022–2025)
2. Seasonal decomposition (if data permits)
3. Route volatility ranking: std dev of fare across time
4. Market structure trends: How has large_ms and lf_ms evolved?
5. Forecast simple model: "Next quarter's fares likely to be ±5%"

**Deliverable:**
- Time series chart with trend
- Seasonal pattern visualization
- Route volatility ranking
- Market evolution summary (consolidation? LCC growth?)

**Success Criterion:** Clear temporal pattern (e.g., Q4 is 5–10% more expensive)

---

### Phase 4: Pattern Analysis (Days 3–3.5)
**Goal:** Investigate the 6 key patterns above

**Tasks:**
1. Distance Paradox: Price per mile analysis by competition level
2. LCC Valuation: Quantify competitive effect
3. Hub Dominance: Matrix of hub-to-hub vs. secondary-to-secondary fares
4. Demand Paradox: 2×2 matrix of demand × competition
5. Temporal Volatility: Stable vs. volatile route classification
6. Monopoly Penalty: By distance and hub type

**Deliverable:**
- 6 detailed analyses with visualizations
- Specific effect sizes and example routes

**Success Criterion:** Each pattern yields a surprising or actionable insight

---

### Phase 5: Narrative & Recommendations (Days 3.5–4)
**Goal:** Synthesize findings into compelling, actionable story

**Tasks:**
1. Identify top 5–7 key findings
2. Rank by: Impact (how many travelers affected?) × Surprise (challenges myth?)
3. Develop narrative arc: Problem → Root cause → Impact → Recommendation
4. Draft 15-slide presentation skeleton
5. Identify 3–5 key visualizations

**Deliverable:**
- Presentation outline with talking points
- Draft visualizations
- List of recommendations for each stakeholder

**Success Criterion:** Story is clear, surprising, and actionable; judges want to hear more

---

## Part 5: Expected Key Findings

Based on the data structure, here are the insights we **expect** to uncover (to validate our plan):

### Expected Finding 1: "Distance is important, but competition dominates"
- Distance: Explains ~40% of fare variation (baseline cost)
- Market concentration: Explains ~35% (pricing power premium)
- Remaining 25%: Demand, temporal, hub effects
- **Narrative:** "It's not about how far; it's about who's flying it"

### Expected Finding 2: "LCC saves passengers $30–50 per ticket"
- Routes with LCC: Average fare $230
- Routes without LCC: Average fare $275
- Effect remains even controlling for distance/demand
- **Narrative:** "LCC is the most powerful price driver for consumers"

### Expected Finding 3: "Monopoly routes cost 20–30% more"
- Monopoly (large_ms > 0.80): Average fare $280
- Competitive (large_ms < 0.50): Average fare $220
- Effect largest on short routes ($60 difference) vs. long routes ($40 difference)
- **Narrative:** "Monopoly is a hidden tax; most harmful on short routes"

### Expected Finding 4: "Secondary cities pay a connectivity premium"
- Routes from secondary cities average $250
- Routes between major hubs average $220
- Premium driven by: hub airline dominance + lower LCC penetration
- **Narrative:** "Geography is destiny: where you live predicts what you pay"

### Expected Finding 5: "Seasonal patterns are strong but route-specific"
- Overall: Q4 fares ~8% higher than Q1 (holiday premium)
- Leisure routes (NYC-Miami): 15–20% Q4 premium
- Business routes (NYC-SF): Stable year-round
- **Narrative:** "Time your booking: leisure routes have seasonal taxes"

### Expected Finding 6: "Market concentration has increased slightly"
- Monopoly routes: Increased from 5% to 8% (2022–2025)
- LCC penetration: Growing from 65% to 72% of passengers
- Mixed signal: Consolidation among legacy carriers, but LCC access expanding
- **Narrative:** "Competition is contested: consolidation vs. LCC growth"

---

## Part 6: Success Metrics for Judges

Each phase should deliver **one of these** to impress judges:

| Category | What Judges Want | Example |
|----------|-----------------|---------|
| **Insight** | Surprising, non-obvious finding | "Secondary cities pay $35 more per flight due to hub control, not distance" |
| **Quantification** | Effect size, not just correlation | "LCC presence saves travelers $40 per ticket on average (2,000 flights/day impact)" |
| **Actionability** | Recommendation someone can use | "Prioritize LCC access to 15 high-premium secondary cities; saves $150M/year for travelers" |
| **Methodology** | Rigorous, transparent approach | "Residual analysis from OLS regression controls for confounders; identifies $X overpricing" |
| **Visualization** | Clear, compelling, non-obvious | Geographic heat map of expensive cities; monopoly routes highlighted |
| **Equity Angle** | Addresses fairness/policy | "Students and families in secondary cities are systematically overcharged" |

**Target:** Hit 3–4 of these categories across your findings

---

## Part 7: Key Success Factors

To execute this plan well:

1. **Start with the right mental model:**
   - Fares = baseline (distance) + competition premium + hub premium + seasonal adjustment
   - Your job: Quantify each component

2. **Focus on comparison, not just description:**
   - Don't say: "Average fare is $230"
   - Do say: "Routes with LCC are 18% cheaper than routes without" (exact comparison)

3. **Use residuals to find unfairness:**
   - Predict what fare "should" be based on distance/demand/competition
   - Find routes that are much more expensive than predicted
   - These are your equity cases

4. **Segment before comparing:**
   - Don't compare NYC-LAX to Denver-Omaha directly (different distance, demand, hub status)
   - Instead, compare within similar distance bands or demand levels
   - Or build regression that controls for these factors

5. **Lead with the surprise:**
   - "You'd think higher demand means cheaper fares, but actually..."
   - "Most people blame distance, but the data shows competition matters 2x more..."
   - Judges remember the contradiction, then the resolution

6. **Quantify impact for stakeholders:**
   - Travelers: "You could save $X by flying from a hub city"
   - Policymakers: "Expanding LCC access would save $Xmillion/year"
   - Airlines: "Your market share of X% commands Y% price premium"

---

## Summary: Your Analytical Roadmap

**BIG QUESTION 1:** What drives fares? (Model with 70%+ R²)  
**BIG QUESTION 2:** Who pays unfairly? (Equity analysis + overpricing)  
**BIG QUESTION 3:** How do prices change? (Temporal trends + forecasting)  

**6 PATTERNS to explore:** Distance paradox, LCC valuation, hub dominance, demand paradox, temporal volatility, monopoly penalty

**PHASED APPROACH:**
- Phase 1 (1–1.5 days): Regression model → feature importance
- Phase 2 (1.5–2.5 days): Residual analysis → overpricing & equity
- Phase 3 (2.5–3 days): Time series → seasonal patterns
- Phase 4 (3–3.5 days): 6 pattern analyses
- Phase 5 (3.5–4 days): Narrative synthesis & presentation

**DELIVERABLES:** Regression, heat maps, time series, 6 pattern analyses, compelling story with 5–7 key findings + recommendations

---

This plan is **comprehensive but focused**: it answers the right questions, uncovers unexpected patterns, and delivers insights that matter to real stakeholders. Execute this, and you'll have a strong competitive entry.