require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');

const identifyNiche = require('./tools/identifyNiche');
const calculateROI = require('./tools/calculateROI');
const bookCall = require('./tools/bookCall');
const logLead = require('./tools/logLead');

const app = express();
app.use(cors());
app.use(express.json());

// Tool dispatcher — maps function names to handlers
const TOOLS = {
  identify_niche: identifyNiche,
  calculate_roi: calculateROI,
  book_call: bookCall,
  log_lead: logLead,
};

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Vapi webhook — single route handles all tool calls
app.post('/vapi/tools', async (req, res) => {
  try {
    const message = req.body?.message || req.body;

    // Vapi sends tool calls in message.toolCallList; fall back to message.toolCalls
    const toolCallList = message?.toolCallList || message?.toolCalls || [];

    if (!toolCallList.length) {
      // Not a tool-call message (e.g. status-update) — ack and move on
      return res.json({ results: [] });
    }

    const results = await Promise.all(
      toolCallList.map(async (call) => {
        const toolCallId = call.id;
        const fnName = call.function?.name;

        // Parse arguments defensively — may be a JSON string or already an object
        let args = {};
        try {
          const raw = call.function?.arguments;
          args = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
        } catch {
          args = {};
        }

        const handler = TOOLS[fnName];
        if (!handler) {
          console.warn(`[server] Unknown tool: ${fnName}`);
          return { toolCallId, result: `Tool "${fnName}" not found.` };
        }

        try {
          console.log(`[server] Calling ${fnName}`, args);
          const result = await handler(args);
          return { toolCallId, result: typeof result === 'string' ? result : JSON.stringify(result) };
        } catch (err) {
          console.error(`[server] Tool ${fnName} threw:`, err.message);
          // Graceful fallback — Savannah keeps talking
          return { toolCallId, result: 'Got it — I have your information and our team will take it from here.' };
        }
      })
    );

    return res.json({ results });
  } catch (err) {
    console.error('[server] Unhandled error:', err.message);
    return res.status(200).json({ results: [] }); // 200 so Vapi doesn't error the call
  }
});

app.listen(config.port, () => {
  console.log(`Meridian demo agent server running on port ${config.port}`);
  console.log(`Tool endpoint: POST http://localhost:${config.port}/vapi/tools`);
});
