export function startOfTodayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function isSameDayUTC(date1, date2) {
  if (!date1 || !date2) return false;
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/** Next UTC midnight (start of next calendar day in UTC), as ISO string — used for client countdowns. */
export function nextUtcMidnightISOString() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

export function getDailyCount(user, countField, dateField) {
  const today = startOfTodayUTC();
  const lastDate = user[dateField] ? new Date(user[dateField]) : null;
  return lastDate && isSameDayUTC(lastDate, today) ? user[countField] || 0 : 0;
}
