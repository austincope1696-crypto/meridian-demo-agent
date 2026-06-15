const niches = require('../../data/niches.json');

// Calculates missed-call revenue loss and returns a spoken-friendly string.
module.exports = async function handler({ niche, calls_missed_per_week, avg_job_value, weekly_call_volume }) {
  try {
    const profile = niches[niche] || niches.generic;

    // If caller doesn't know how many they miss, estimate from volume * miss_rate
    let missedPerWeek = Number(calls_missed_per_week);
    if (!missedPerWeek && weekly_call_volume) {
      missedPerWeek = Math.round(Number(weekly_call_volume) * profile.miss_rate);
    }
    if (!missedPerWeek || missedPerWeek < 1) missedPerWeek = 3; // conservative default

    const jobValue = Number(avg_job_value) || profile.missed_call_value;
    const weeklyLoss = missedPerWeek * jobValue;
    const monthlyLoss = Math.round(weeklyLoss * 4.3);
    const annualLoss = monthlyLoss * 12;

    const fmt = (n) => '$' + n.toLocaleString();

    return (
      `Based on ${missedPerWeek} missed calls per week at ${fmt(jobValue)} per call, ` +
      `that's roughly ${fmt(monthlyLoss)} a month — or ${fmt(annualLoss)} a year — walking out the door. ` +
      `And that's the conservative number. Most owners are surprised it's that high.`
    );
  } catch (err) {
    return 'Even missing a few calls a week adds up to tens of thousands of dollars a year for most businesses.';
  }
};
