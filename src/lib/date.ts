const TIME_ZONE = 'America/Mexico_City';

export function getZonedParts(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

export function todayISOInTZ(date: Date = new Date()) {
  const parts = getZonedParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function nowIsoInTZ(date: Date = new Date()) {
  const parts = getZonedParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(
    2,
    '0',
  )}T${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(
    parts.second,
  ).padStart(2, '0')}`;
}

export function addDays(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utc = Date.UTC(year, month - 1, day + days);
  const date = new Date(utc);
  const resultYear = date.getUTCFullYear();
  const resultMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const resultDay = String(date.getUTCDate()).padStart(2, '0');
  return `${resultYear}-${resultMonth}-${resultDay}`;
}

export function monthDays(dateStr: string) {
  const [year, month] = dateStr.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const endDate = new Date(Date.UTC(nextMonth.year, nextMonth.month - 1, 0));
  const end = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(
    endDate.getUTCDate(),
  ).padStart(2, '0')}`;
  const days: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function getAgeFromDob(dob: string, date: Date = new Date()) {
  const parts = getZonedParts(date);
  const [birthYear, birthMonth, birthDay] = dob.split('-').map(Number);
  let age = parts.year - birthYear;
  if (parts.month < birthMonth || (parts.month === birthMonth && parts.day < birthDay)) {
    age -= 1;
  }
  return age;
}

export function getMsUntilEndOfDay() {
  const parts = getZonedParts();
  const nowUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const endUtc = Date.UTC(parts.year, parts.month - 1, parts.day, 23, 59, 59);
  return Math.max(0, endUtc - nowUtc);
}

export { TIME_ZONE };
