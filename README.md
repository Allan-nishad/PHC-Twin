# PHC-Twin 🏥⚡

> **"From Resource Availability to Healthcare Capability"**  
> *"We don't just measure what healthcare facilities have. We measure what healthcare they can actually deliver."*

---

## 🏆 Hackathon Context

- **Competition**: Google Cloud Hackathon — *Build with AI: Code for Communities (Second Edition)*
- **Track**: Smart Health & Supply Chain Resilience
- **BRICS Theme**: Resilience
- **Focus**: AI-Powered Healthcare Capability Intelligence Platform across India's Primary Health Centre (PHC) Network and decentralized health supply chains.

---

## 💡 The Core Problem

Across primary healthcare networks in India and developing economies, public health dashboards traditionally report **Resource Availability**:
- *"Facility has 1 hematology analyzer"*
- *"Facility has 12 beds"*
- *"Facility has 84% medicine stock"*

However, **Resource Availability ≠ Healthcare Capability**.

A facility may possess all physical equipment and medicines, yet the clinical service remains completely unavailable because a single prerequisite dependency is missing:
1. **Diagnostic Machine exists** but the **trained lab technician is absent** ➔ Diagnostic service is **0% capable**.
2. **Emergency crash cart & oxygen exist** but the **attending doctor is absent** ➔ Emergency trauma care is **unavailable**.
3. **Maternity labor table exists** but **running water / radiant warmer power is disrupted** ➔ Safe deliveries cannot proceed.
4. **Beds exist** but **insufficient nurses** limit the safe patient-to-nurse monitoring ratio.

**PHC-Twin** transforms health telemetry by continuously answering:
> *"What healthcare services can this PHC actually deliver right now, what is the exact bottleneck, and what is the optimal inter-facility intervention?"*

---

## 🔬 Core Innovation: The Healthcare Service Capability Engine

PHC-Twin models every primary healthcare facility as a multi-tier dependency graph:

```
PHC Telemetry (Staff, Equipment, Supplies, Utilities)
                  │
                  ▼
   5 Core Clinical Service Streams
  ┌───────────────┬─────────────────┬─────────────┬─────────────┬─────────────┐
  │ Basic Outpatient │ Maternal Care │ Diagnostics │ Emergency   │ Inpatient   │
  │ (OPD)         │ & Newborn Care  │ & Lab Tests │ & Trauma    │ Observation │
  └───────────────┴─────────────────┴─────────────┴─────────────┴─────────────┘
                  │
                  ▼
   Deterministic Dependency Evaluation
  (Critical prerequisites vs. Non-critical constraints)
                  │
                  ▼
   Explainable Capability State & Throughput
  [AVAILABLE (Green) | LIMITED (Yellow) | UNAVAILABLE (Red)]
                  │
                  ▼
   Gemini AI Multi-Facility Decision Intelligence
  (Donor safety margins, route distance, rotational staff / supply dispatch)
                  │
                  ▼
   Human-in-the-Loop Chief Medical Officer (CMO) Decision Gate
```

Every degraded service produces an explainable root cause and an actionable operational intervention.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict typing for clinical dependencies & telemetry)
- **Styling**: Tailwind CSS (Government/Public-Health neutral theme, accessible semantic status badges)
- **Visualizations**: Recharts (7-Day inventory depletion curve, demand projections)
- **Icons**: Lucide React
- **AI / Generative AI**: Google Gemini 1.5 Flash (`@google/generative-ai` SDK via secure server-side API `/api/gemini/analyze`)
- **Ready for Google Cloud Deployment**: Cloud Run, BigQuery, Vertex AI, Google Maps Platform.

---

## 🌐 India-Scale Data Model

The prototype includes 15 synthetic, realistic Primary and Community Health Centres across diverse Indian states and geographic zones:
- **Uttar Pradesh** (Sitapur, Lakhimpur Kheri) — *PHC Rampur, PHC Shivapur, PHC Lakshmipur, PHC Sitapur Urban*
- **Maharashtra** (Thane, Nashik, Ratnagiri) — *PHC Kalyanpur, PHC Nandgaon, PHC Rajapur*
- **Assam** (Kamrup, Barpeta) — *PHC Sonapur, PHC Borpeta*
- **Rajasthan** (Rajsamand) — *PHC Devgarh*
- **Odisha** (Baleswar, Cuttack) — *PHC Chandipur, PHC Haripur*
- **West Bengal** (Paschim Bardhaman) — *PHC Durgapur*
- **Jharkhand** (Deoghar) — *PHC Madhupur*
- **Chhattisgarh** (Bilaspur) — *PHC Bilaspur Rural*

---

## 🚀 Key Features

1. **Healthcare Capability Engine**: Deterministic classification of all 5 clinical streams into `AVAILABLE`, `LIMITED`, or `UNAVAILABLE`.
2. **Effective Operational Capacity**: Computes actual daily patient throughput supported based on staff-to-bed ratios and supply buffers.
3. **Stock-Out Early Warning & 7-Day Demand Forecast**: Analyzes historical consumption to predict depletion horizons.
4. **Interactive Sandbox & Guided Demo**: One-click simulation of technician absence, demonstrating immediate service failure from GREEN to RED.
5. **Gemini Decision Intelligence**: Google Gemini 1.5 Flash evaluates nearby candidate facilities, checks donor safety margins, and generates structured administrative orders.
6. **Before / After Impact Analysis**: Quantifies projected coverage restoration and community lives protected.
7. **Operational Data Confidence Indicator**: Evaluates reporting consistency between digital telemetry and physical ledgers.
8. **BRICS Federated Learning Blueprint**: Conceptual privacy-preserving model aggregation across sovereign national healthcare nodes.

---

## 🧪 Guaranteed Demo Scenario (Walkthrough)

1. Click **"Run Judge Demo Flow"** on the top bar.
2. Step 1: Inspect **PHC Rampur** in Sitapur, UP. Equipment is functional, reagents are in stock, and 1 technician is present ➔ Diagnostic Capability = **AVAILABLE (GREEN)**.
3. Step 2: Click **"Simulate Technician Outage"**. Technician availability drops to `0`.
4. Step 3: Observe the core thesis: Hardware remains 100% functional, yet Diagnostic Capability immediately transitions to **UNAVAILABLE (RED)**.
5. Step 4: Inspect the **WHY** explanation and dependency graph.
6. Step 5: Nearby facility engine identifies **PHC Sitapur Urban** (5.2 km away) with 3 active technicians.
7. Step 6: Click **"Ask Gemini Reasoning"** to generate an inter-facility rotational technician dispatch order.
8. Step 7: View the **Before / After Impact Card**: Diagnostic coverage restored from **52% to 81%** across the district, protecting **28 patient tests daily**.
9. Click **"Reset Scenario"** to restore baseline state.

---

## 💻 Getting Started Locally

### 1. Clone & Install Dependencies

```bash
cd PHC-Twin
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (refer to `.env.example`):

```bash
cp .env.example .env.local
```

Add your Google Gemini API Key:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> *Note: If no API key is provided, the application automatically uses its deterministic fallback operational intelligence engine so that the entire demo remains 100% functional offline.*

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 🛡️ Product Scope & Ethical Safeguards

- **Decision Support Only**: PHC-Twin does **not** autonomously reallocate staff or medications; all interventions require explicit human review by the Chief Medical Officer or District Health Officer.
- **Not a Medical Diagnosis System**: The system models operational infrastructure and supply readiness, not clinical patient diagnoses.
- **Privacy-Preserving**: Telemetry is aggregated at the facility level; no individual patient medical records (EHR) are processed.

---

## 📄 License

Built for the Google Cloud Hackathon: *Build with AI: Code for Communities*.
