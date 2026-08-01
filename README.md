# Médiku Labarik (MédLab)

AI-powered **maternal & child health assistant for Timor-Leste** — a pitch demo for the EU-ASEAN SCOPE Trade Project.

MédLab helps mothers and caregivers:

- **Check symptoms** for a child (age-aware, IMCI danger-sign screening) or during pregnancy (gestation-aware red flags), by text or photo, with AI analysis in **Tetum, English, or Indonesian**
- **Track a pregnancy** week by week with WHO 8-contact ANC visit reminders
- **Follow the EPI vaccination schedule** for each child with due/overdue status
- **Find health facilities** across Timor-Leste's municipalities
- **Chat or call a doctor** (simulated in this demo) behind a mocked Premium subscription

All data (family profile, vaccine records) is stored locally in the browser — this demo has no backend.

## Run locally

**Prerequisites:** Node.js and [Ollama](https://ollama.com) running locally.

1. Install dependencies:
   ```
   npm install
   ```
2. Pull the AI models:
   ```
   ollama pull gemma3
   ollama pull llava
   ```
3. Run the app:
   ```
   npm run dev
   ```
   Then open http://localhost:3000

## Configuration (optional)

Create `.env.local` to override the AI defaults:

```
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_TEXT_MODEL=gemma3
VITE_OLLAMA_VISION_MODEL=llava
```

To demo from a phone on the same network, point `VITE_OLLAMA_URL` at your laptop's LAN IP and start Ollama with `OLLAMA_HOST=0.0.0.0`.

**Demo performance tip:** the app disables model "thinking" automatically, but large models (e.g. a 26B) can still take minutes per analysis on a laptop. For a live pitch, use a small fast model (`ollama pull gemma3:4b`, then set `VITE_OLLAMA_TEXT_MODEL=gemma3:4b`) and warm it up with one request before going on stage.

## Build

```
npm run build
```

Output goes to `dist/` (static files, deployable to any web server).

## Demo notes

- The doctor chat/call and the Premium subscription are **simulated** — no real telemedicine or payment is wired up (roadmap items).
- Facility phone numbers and specialist profiles are demo data.
- MédLab provides information only; it is not a substitute for professional medical advice.
