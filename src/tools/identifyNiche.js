const niches = require('../../data/niches.json');

// Takes a free-text business description and returns the matching niche + full profile.
// Falls back to "generic" if nothing matches.
function identifyNiche({ business_description }) {
  if (!business_description) {
    return { niche: 'generic', profile: niches.generic };
  }

  const text = business_description.toLowerCase();

  for (const [niche, profile] of Object.entries(niches)) {
    if (niche === 'generic') continue;
    const matched = profile.keywords.some((kw) => text.includes(kw.toLowerCase()));
    if (matched) {
      return { niche, profile };
    }
  }

  return { niche: 'generic', profile: niches.generic };
}

// Returns a spoken-friendly string Savannah can read naturally mid-call.
function formatForVoice({ niche, profile }) {
  const avgJobLow = profile.avg_job ? profile.avg_job[0].toLocaleString() : null;
  const avgJobHigh = profile.avg_job ? profile.avg_job[1].toLocaleString() : null;
  const jobRange = avgJobLow ? ` Jobs typically run $${avgJobLow} to $${avgJobHigh}.` : '';
  const compliance = profile.compliance ? ` Note: ${niche} requires ${profile.compliance} compliance — route to discovery call.` : '';

  return (
    `Niche identified: ${niche}. ` +
    `Missed call value: $${profile.missed_call_value.toLocaleString()}.` +
    jobRange +
    ` Miss rate: ${Math.round(profile.miss_rate * 100)}%.` +
    ` Pain point: ${profile.pain}.` +
    ` Hook: ${profile.hook}` +
    compliance
  );
}

module.exports = async function handler(args) {
  try {
    const result = identifyNiche(args);
    return formatForVoice(result);
  } catch (err) {
    // Never crash the call — return generic fallback
    return `Niche: general business. ${niches.generic.hook}`;
  }
};
