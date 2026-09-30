# 📦 Small Retail Survival Agent

> **An Autonomous Multi-Agent GenAI & Forecasting Copilot for Independent Retailers (Kirana Stores, Boutiques, Cafes).**  
> Helping small shop owners know **what to stock**, **what to clear**, and **what to promote** — without complex BI spreadsheets or expensive data teams.

---

## 🌟 Executive Overview & Problem Statement

Small, independent retailers run primarily on gut feel. Unlike large supermarket chains with dedicated business intelligence teams, small shopkeepers lack the tools to:
1. **Detect impending stockouts** before supplier lead-time gaps leave shelves empty.
2. **Identify slow-moving dead stock and perishable spoilage risks** that lock up scarce working capital.
3. **Design high-impact, margin-accretive weekly promotions** without hurting profitability.

**Small Retail Survival Agent** acts as that missing retail analyst team. It ingests raw daily sales transaction CSVs, coordinates **5 distinct LangGraph-orchestrated agents** via an explicit Pydantic state machine, and produces a plain-language executive action briefing, inventory risk mitigation ledger, and on-demand explainability Q&A.

---

## 🏗️ Multi-Agent LangGraph Architecture

Rather than chained prompt calls or simple LLM wrappers, this system is built as a **true multi-agent state graph** using `LangGraph` and `Pydantic`.

```mermaid
graph TD
    A[Raw Sales CSV / Seed Data] --> B[Node 1: Sales Analyst Agent]
    B -->|State: SalesSummary + Velocity Metrics| C[Node 2: Demand Forecaster Agent]
    C -->|State: 7/14/30d Forecasts + Fallback Metadata| D[Node 3: Inventory Strategist Agent]
    D -->|State: Stockout Risks + Dead Capital + Safety Buffers| E[Node 4: Marketing Advisor Agent]
    E -->|State: Single Focused Promotion + Trade-off| F[Node 5: Orchestrator Agent]
    F -->|Compiled Final Report| G[SQLite Database & Executive Action Report]
    G -.->|Lightweight Q&A Query| H[Explainability Path: /api/explain/{sku}]
```

### The 5 Agent Nodes & Responsibilities

| Agent Node | Core Responsibilities & Methods | Explicit State Output |
| :--- | :--- | :--- |
| **1. Sales Analyst** | Ingests transactions, validates date continuity, filters anomalies (negative quantities, duplicate dates), computes 7d/14d/30d/all-time sell-through velocity, category shares, and day-of-week seasonality (weekend surges & month-start salary cycle). | `SalesSummary` (Pydantic) |
| **2. Demand Forecaster** | Generates probabilistic 7, 14, and 30-day demand forecasts with upper/lower confidence bands. **Automatic Sparse Fallback:** Uses `Statsmodels ETS` (Holt-Winters seasonal smoothing) or Ridge lag regression for rich SKUs (>=8 weeks history), and automatically falls back to a category momentum moving-average heuristic for newly launched or sparse SKUs. | `ForecastReport` (Pydantic) |
| **3. Inventory Strategist** | Reasons over multi-factor trade-offs (lead time vs margins vs perishable shelf life). Computes safety stock ($Z \cdot \sqrt{L} \cdot \sigma_d$) and suggested reorder quantities. Flags critical stockout cliffs ($Days \le LeadTime$) and spoilage hazards. | `StrategistOutput` (Pydantic) |
| **4. Marketing Advisor** | Selects **EXACTLY ONE** high-conviction weekly promotional move (bundle, flash markdown, or volume tier). Explains the operational trade-off in warm, practical language (like a seasoned retail mentor talking to a friend over tea). | `MarketingOutput` (Pydantic) |
| **5. Orchestrator** | Intercepts cross-agent tensions (e.g., prevents marketing from promoting stockout-risk items), balances reorder capital against clearance cash unlocked, compiles the executive briefing, and serves the lightweight `/explain/{sku}` Q&A endpoint without re-running the forecasting pipeline. | `FullWeeklyReport` & Q&A Handler |

---

## 🎯 3 Deliberately Engineered Showcase Scenarios

The included 12-month synthetic Kirana dataset (50 SKUs across 4 categories: *Staples & Grains, Dairy & Perishables, Snacks & Beverages, Personal & Home Care*) contains 3 engineered scenarios to showcase all 3 agent outputs in one pass:

### 1. 🚨 The Stockout Catch (`SKU-STAPLE-01` — Royal Basmati Rice 5kg)
- **Scenario**: Recent sales surged (+55% velocity), but current stock is down to **12 bags** (~2.6 days of supply remaining) with a **7-day supplier lead time**.
- **Agent Action**: Inventory Strategist flags a **Critical Stockout Risk** and calculates an immediate reorder recommendation of **+55 bags** (including safety buffer) to prevent an empty shelf.

### 2. ⚠️ The Clearance & Spoilage Catch (`SKU-DAIRY-06` — Artisanal Organic Paneer 200g)
- **Scenario**: **38 units in stock** with only **7 days of shelf life remaining**, while sales velocity has slowed to 1.5 units/day (25 days of inventory). **₹3,724 in working capital is at 100% risk of spoilage loss.**
- **Agent Action**: Strategist & Marketing Advisor flag a **Perishable Spoilage Hazard** and suggest an immediate 20% weekend markdown to liquidate stock in 48–72 hours and recover liquid cash.

### 3. 💡 The Strategic Promotion Pick (`SKU-SNACK-03` — Grand Reserve Masala Chai 250g)
- **Scenario**: High gross margin item (**62% margin**) with healthy stock. Pairs naturally with Butter Biscuits (`SKU-SNACK-08`) for morning weekend footfall.
- **Agent Action**: Marketing Advisor chooses this as the **Single Weekly Promotion: "Morning Chai & Biscuit Combo"**, projecting a **+28% volume lift** and adding incremental gross profit per basket.

---

## 🔍 Lightweight Explainability & Q&A Path (`/api/explain/{sku}`)

Unlike naive systems that re-execute entire LLM chains or forecasting pipelines when asked a question, the Orchestrator answers *"Why did you recommend this?"* by querying the **stored multi-agent state** directly:
- Retrieves exact burn rate, days left, lead time, margin, and confidence intervals.
- Delivers a grounded, numbers-backed explanation in seconds.
- Allows the shop owner to ask follow-up questions (e.g., *"Why shouldn't I discount it by 50%?"*).

---

## 🛠️ Tech Stack

- **Orchestration**: LangGraph (5 distinct nodes with shared Pydantic `RetailState` handoff)
- **LLM Engine**: Groq-hosted Llama 3 (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with automatic fallback to domain-grounded heuristic reasoning
- **Forecasting**: `statsmodels` (ExponentialSmoothing / Holt-Winters), `scikit-learn` Ridge regression, and moving-average category heuristics
- **Backend**: FastAPI, SQLite, Pydantic v2, Pandas, NumPy, Uvicorn
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Design Language**: Dark Kirana Aesthetic
  - Background: `#12211c`
  - Panels: `#1b2d26` (Border: `#2a443a`)
  - Accent Amber: `#e6a94a`
  - Sage (Muted Text): `#8fa598`
  - Headlines: *Fraunces* (Editorial Serif)
  - Body: *Inter* (Clean Modern Sans)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# (Optional) Set your Groq API Key
set GROQ_API_KEY=your_groq_api_key_here  # Windows CMD
# or: export GROQ_API_KEY="your_groq_api_key_here"  # Linux / Mac

# Run backend server (FastAPI on port 8000)
python run.py
```
*The backend will start on `http://127.0.0.1:8000` and automatically seed the SQLite database with 12 months of synthetic data on first run.*

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 📊 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/showcases` | Returns metadata for the 3 engineered showcase demo scenarios |
| `GET` | `/api/skus` | Returns all SKUs with current stock levels & category |
| `POST` | `/api/generate-synthetic` | Seeds SQLite with 12 months of synthetic retail data & runs pipeline |
| `POST` | `/api/upload` | Uploads and validates custom sales CSV, reports row-level errors |
| `POST` | `/api/analyze` | Executes the 5 LangGraph agent nodes synchronously |
| `GET` | `/api/analyze/stream` | Server-Sent Events (SSE) stream of agent execution steps |
| `GET` | `/api/report/latest` | Fetches the most recent generated weekly report |
| `GET` | `/api/explain/{sku}` | Orchestrator Q&A explainability for a specific SKU |
| `POST` | `/api/chat` | Freeform store-wide strategic chat with Orchestrator |

---

## 📄 License
MIT License. Built for small retailers everywhere.
