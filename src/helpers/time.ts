import { DateTime } from 'luxon';

export function nowMidnight() {
  return DateTime.utc().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
}

export function tomorrowMidnight() {
  const now = nowMidnight();
  return now.set({ day: now.day + 1 });
}
