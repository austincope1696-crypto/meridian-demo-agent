require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  ghlWebhookUrl: process.env.GHL_WEBHOOK_URL,
  calcom: {
    apiKey: process.env.CALCOM_API_KEY,
    eventTypeId: process.env.CALCOM_EVENT_TYPE_ID,
  },
  prompt: {
    bookingWindow: process.env.MERIDIAN_BOOKING_WINDOW || 'weekdays 9am–5pm ET',
    teamName: process.env.TEAM_NAME || 'the Meridian team',
    callbackTimeframe: process.env.CALLBACK_TIMEFRAME || 'within one business day',
  },
};
