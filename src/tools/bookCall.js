const axios = require('axios');
const config = require('../config');
const logLead = require('./logLead');

// Books a 15-min discovery call on Cal.com.
// Swap the body of createCalcomBooking() for GoHighLevel or Calendly — interface stays the same.
async function createCalcomBooking({ name, phone, email, business_type, preferred_time }) {
  if (!config.calcom.apiKey || !config.calcom.eventTypeId) {
    throw new Error('Cal.com credentials not configured');
  }

  // Cal.com v2 API — creates a booking
  const response = await axios.post(
    'https://api.cal.com/v2/bookings',
    {
      eventTypeId: Number(config.calcom.eventTypeId),
      start: preferred_time, // ISO 8601 string, e.g. "2026-06-16T14:00:00Z"
      attendee: {
        name,
        email: email || `${phone.replace(/\D/g, '')}@noemail.meridianai.com`,
        timeZone: 'America/New_York',
        phoneNumber: phone,
      },
      metadata: { business_type, source: 'Savannah Demo Call' },
    },
    {
      headers: {
        Authorization: `Bearer ${config.calcom.apiKey}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2024-08-13',
      },
    }
  );

  return response.data;
}

module.exports = async function handler({ name, business_type, phone, email, preferred_time }) {
  try {
    const booking = await createCalcomBooking({ name, phone, email, business_type, preferred_time });

    const confirmedTime = booking?.data?.start
      ? new Date(booking.data.start).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
      : preferred_time || 'the time you selected';

    return (
      `Booked! You're confirmed for a 15-minute call with ${config.prompt.teamName} on ${confirmedTime}. ` +
      `You'll get a text confirmation at ${phone}. We're looking forward to it.`
    );
  } catch (err) {
    // Booking failed — still log the lead and promise manual follow-up
    await logLead({ name, business_type, phone, email, outcome: 'booking_failed', notes: `Preferred time: ${preferred_time}. Error: ${err.message}` }).catch(() => {});
    return (
      `I wasn't able to lock that slot in right this second, but I've got all your details and ` +
      `${config.prompt.teamName} will reach out ${config.prompt.callbackTimeframe} to confirm a time. ` +
      `You won't fall through the cracks.`
    );
  }
};
