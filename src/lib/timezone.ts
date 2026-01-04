export const MEXICO_TZ = 'America/Mexico_City';

export function getZonedParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: MEXICO_TZ,
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

export function todayISO_MX(date = new Date()) {
  const { year, month, day } = getZonedParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function nowMx(date = new Date()) {
  const { year, month, day, hour, minute, second } = getZonedParts(date);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

export function formatTime_MX(date = new Date()) {
  const { hour, minute, second } = getZonedParts(date);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

export function formatDateTime_MX(date = new Date()) {
  const { year, month, day, hour, minute, second } = getZonedParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(
    minute,
  ).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

export function diffDays(fromISO: string, toISO: string) {
  const [fromYear, fromMonth, fromDay] = fromISO.split('-').map(Number);
  const [toYear, toMonth, toDay] = toISO.split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.ceil((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

export function addDays(iso: string, delta: number) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;
}

export function monthDays(iso: string) {
  const [year, month] = iso.split('-').map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const days: string[] = [];
  const monthIndex = first.getUTCMonth();
  let cursor = first;
  while (cursor.getUTCMonth() === monthIndex) {
    days.push(
      `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(
        cursor.getUTCDate(),
      ).padStart(2, '0')}`,
    );
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 1));
  }
  return days;
}
