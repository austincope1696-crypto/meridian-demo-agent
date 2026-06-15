const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const LEADS_FILE = path.join(__dirname, '../../leads.json');

function readLeads() {
  try {
    if (!fs.existsSync(LEADS_FILE)) return [];
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function appendToFile(lead) {
  const leads = readLeads();
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

module.exports = async function handler(args) {
  const lead = {
    ...args,
    logged_at: new Date().toISOString(),
    source: 'Savannah Demo Call',
  };

  // 1. Try GoHighLevel webhook
  if (config.ghlWebhookUrl) {
    try {
      await axios.post(config.ghlWebhookUrl, lead, { timeout: 8000 });
      // Also write locally as backup
      appendToFile({ ...lead, synced_to_ghl: true });
      return `Lead logged: ${lead.name || 'unknown'} — ${lead.outcome || 'captured'}.`;
    } catch (err) {
      // GHL failed — fall through to local file
      console.error('[logLead] GHL webhook failed:', err.message);
    }
  }

  // 2. Fallback: local leads.json — never lose a lead
  try {
    appendToFile({ ...lead, synced_to_ghl: false });
    return `Lead saved locally: ${lead.name || 'unknown'} — ${lead.outcome || 'captured'}.`;
  } catch (fileErr) {
    console.error('[logLead] File write failed:', fileErr.message);
    // Return success-ish so Savannah keeps composure — team will see the call transcript
    return 'Lead noted — team will follow up.';
  }
};
