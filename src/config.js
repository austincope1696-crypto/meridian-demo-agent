require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  ghlWebhookUrl: process.env.GHL_WEBHOOK_URL,
  calcom: {
    apiKey: process.env.CALCOM_API_KEY,
    eventTypeId: process.env.CALCOM_EVENT_TYPE_ID,
  },
  meridian: {
    ownerName: process.env.OWNER_NAME || 'Austin',
    ownerPhone: process.env.OWNER_PHONE || '',
    phone: process.env.MERIDIAN_PHONE || '',
    website: process.env.MERIDIAN_WEBSITE || 'meridianai.com',
    monthlyPrice: process.env.MONTHLY_PRICE || '1,000',
    setupFee: process.env.SETUP_FEE || '500',
    clientsActive: process.env.CLIENTS_ACTIVE || '3',
    avgCallsRecovered: process.env.AVG_CALLS_RECOVERED || '94',
  },
  prompt: {
    bookingWindow: process.env.MERIDIAN_BOOKING_WINDOW || 'weekdays 9am–5pm ET',
    teamName: process.env.TEAM_NAME || 'Austin and the Meridian team',
    callbackTimeframe: process.env.CALLBACK_TIMEFRAME || 'within one business day',
  },
  hours: {
    start: parseInt(process.env.BUSINESS_HOURS_START || '9'),
    end: parseInt(process.env.BUSINESS_HOURS_END || '17'),
    timezone: process.env.BUSINESS_TIMEZONE || 'America/New_York',
  },
};
