# Meridian Demo Agent — Savannah

Inbound AI sales demo. Business owners call one number, Savannah detects their industry,
runs their missed-call math live, and books a discovery call with the Meridian team.

## Setup

```bash
cd meridian-demo-agent
npm install
cp .env.example .env
# Fill in .env values (see below)
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default 3000) |
| `GHL_WEBHOOK_URL` | GoHighLevel inbound webhook for lead logging |
| `CALCOM_API_KEY` | Cal.com API key (get from cal.com/settings/developer) |
| `CALCOM_EVENT_TYPE_ID` | The ID of the 15-min discovery call event type |
| `MERIDIAN_BOOKING_WINDOW` | e.g. "weekdays 9am–5pm ET" |
| `TEAM_NAME` | e.g. "the Meridian team" |
| `CALLBACK_TIMEFRAME` | e.g. "within one business day" |

## Local Testing

```bash
npm test
# Runs simulate.js — exercises all tool handlers with sample payloads.
# Writes test leads to leads.json (safe to delete after testing).
```

For live call testing, expose the server publicly with ngrok:
```bash
npx ngrok http 3000
# Copy the https URL — use it as your Vapi tool server.url
```

## Deploy (Render — recommended, free tier works)

1. Push this repo to GitHub.
2. Go to render.com → New Web Service → connect your repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all env vars in Render's dashboard.
6. Copy the public Render URL (e.g. `https://meridian-demo.onrender.com`).

Railway and Vercel (serverless) also work — see notes below.

## Wiring Up in Vapi

### 1. Create or update the assistant
- **Model:** claude-sonnet-4-6 (or gpt-4o)
- **System prompt:** paste the contents of `prompts/savannah_system_prompt.md` verbatim.
  Replace `{{MERIDIAN_BOOKING_WINDOW}}`, `{{TEAM_NAME}}`, `{{CALLBACK_TIMEFRAME}}` with your values.
- **Voice:** Vapi → Savannah (or ElevenLabs Alice — owner's preference)
- **First message:** `Hi there, this is Savannah with Meridian AI! You're talking to our AI receptionist live — so feel free to throw whatever you want at me. Who do I have the pleasure of speaking with?`
- **Transcriber:** Deepgram nova-3 (default)

### 2. Register the four tools
In the Vapi dashboard under your assistant → Tools → Add Tool (Custom):

**Tool 1: identify_niche**
```json
{
  "name": "identify_niche",
  "description": "Detects the caller's industry from their business description. Call this immediately after learning what business they run.",
  "parameters": {
    "type": "object",
    "properties": {
      "business_description": {
        "type": "string",
        "description": "What the caller said about their business, in their own words"
      }
    },
    "required": ["business_description"]
  },
  "server": { "url": "https://YOUR_SERVER_URL/vapi/tools" }
}
```

**Tool 2: calculate_roi**
```json
{
  "name": "calculate_roi",
  "description": "Calculates missed-call revenue loss. Call after identifying the niche and learning how many calls they miss per week.",
  "parameters": {
    "type": "object",
    "properties": {
      "niche": { "type": "string", "description": "The detected niche key (e.g. roofing, hvac, legal)" },
      "calls_missed_per_week": { "type": "number", "description": "How many calls the caller estimates they miss per week" },
      "avg_job_value": { "type": "number", "description": "Average job value if the caller provides one" },
      "weekly_call_volume": { "type": "number", "description": "Total weekly call volume if missed count unknown" }
    },
    "required": ["niche"]
  },
  "server": { "url": "https://YOUR_SERVER_URL/vapi/tools" }
}
```

**Tool 3: book_call**
```json
{
  "name": "book_call",
  "description": "Books a 15-minute discovery call with the Meridian team. Call when the prospect agrees to meet.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Caller's full name" },
      "business_type": { "type": "string", "description": "Their business type" },
      "phone": { "type": "string", "description": "Their phone number" },
      "email": { "type": "string", "description": "Their email (optional)" },
      "preferred_time": { "type": "string", "description": "Preferred time as ISO 8601 string or natural language" }
    },
    "required": ["name", "phone", "preferred_time"]
  },
  "server": { "url": "https://YOUR_SERVER_URL/vapi/tools" }
}
```

**Tool 4: log_lead**
```json
{
  "name": "log_lead",
  "description": "Logs the lead to the CRM. Call at the end of every call, whether booked or not.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "business_type": { "type": "string" },
      "detected_niche": { "type": "string" },
      "phone": { "type": "string" },
      "email": { "type": "string" },
      "estimated_calls_missed": { "type": "number" },
      "calculated_monthly_loss": { "type": "number" },
      "outcome": { "type": "string", "enum": ["booked", "captured", "info_only"] },
      "booked_time": { "type": "string" },
      "notes": { "type": "string" },
      "curveballs_thrown": { "type": "string" }
    },
    "required": ["outcome"]
  },
  "server": { "url": "https://YOUR_SERVER_URL/vapi/tools" }
}
```

### 3. Point the phone number at the assistant
In Vapi → Phone Numbers → your Meridian number → set Inbound Call Handler to this assistant.

## Adapter Pattern (swap booking provider)

To switch from Cal.com to GoHighLevel or Calendly, only edit `src/tools/bookCall.js` —
replace the `createCalcomBooking()` function body. The handler interface (`name, phone, email,
business_type, preferred_time`) stays the same.

## Lead Fallback

If the GHL webhook is down, every lead is written to `leads.json` in the project root.
Check this file if you ever suspect a lead was lost. It is append-only and never deleted.
