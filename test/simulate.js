// Simulates Vapi tool-call payloads to verify each handler works before a live call.
// Run with: node test/simulate.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const identifyNiche = require('../src/tools/identifyNiche');
const calculateROI = require('../src/tools/calculateROI');
const logLead = require('../src/tools/logLead');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

async function run(label, fn, args) {
  try {
    const result = await fn(args);
    console.log(`${GREEN}✓ ${label}${RESET}`);
    console.log('  →', result);
    console.log();
  } catch (err) {
    console.log(`${RED}✗ ${label}: ${err.message}${RESET}\n`);
  }
}

(async () => {
  console.log('=== Meridian Tool Simulation ===\n');

  // identify_niche
  await run('identify_niche — roofing', identifyNiche, { business_description: 'I run a roofing and storm restoration company in Florida' });
  await run('identify_niche — HVAC', identifyNiche, { business_description: 'air conditioning and heating repair' });
  await run('identify_niche — legal', identifyNiche, { business_description: 'personal injury law firm' });
  await run('identify_niche — dental (HIPAA)', identifyNiche, { business_description: 'dental office, general dentistry' });
  await run('identify_niche — unknown', identifyNiche, { business_description: 'I sell vintage furniture online' });

  // calculate_roi
  await run('calculate_roi — roofing, 5 missed/week', calculateROI, { niche: 'roofing', calls_missed_per_week: 5 });
  await run('calculate_roi — hvac, volume known', calculateROI, { niche: 'hvac', weekly_call_volume: 30 });
  await run('calculate_roi — legal, custom job value', calculateROI, { niche: 'legal', calls_missed_per_week: 3, avg_job_value: 8000 });

  // log_lead (writes to local leads.json since GHL not configured in test)
  await run('log_lead — booked', logLead, {
    name: 'Test Owner',
    business_type: 'Roofing',
    detected_niche: 'roofing',
    phone: '555-123-4567',
    estimated_calls_missed: 5,
    calculated_monthly_loss: 60200,
    outcome: 'booked',
    booked_time: '2026-06-16T14:00:00Z',
    notes: 'Simulation test',
  });

  await run('log_lead — captured only', logLead, {
    name: 'Jane HVAC',
    business_type: 'HVAC',
    detected_niche: 'hvac',
    phone: '555-987-6543',
    outcome: 'captured',
    notes: 'Not ready to book, follow up next week',
  });

  console.log('=== Done. Check leads.json for local log entries. ===');
})();
