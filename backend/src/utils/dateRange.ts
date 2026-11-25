type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function getCalendarDate(date: Date, timeZone: string): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function toZonedDate(
  date: CalendarDate,
  timeZone: string,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  const desiredUtc = Date.UTC(
    date.year,
    date.month - 1,
    date.day,
    hour,
    minute,
    second,
    millisecond,
  );
  let timestamp = desiredUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = getCalendarDate(new Date(timestamp), timeZone);
    const actualTime = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(timestamp));
    const timeValues = Object.fromEntries(
      actualTime.map(({ type, value }) => [type, value]),
    );
    const representedUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      Number(timeValues.hour),
      Number(timeValues.minute),
      Number(timeValues.second),
      millisecond,
    );
    const adjustment = desiredUtc - representedUtc;
    timestamp += adjustment;
    if (adjustment === 0) break;
  }

  return new Date(timestamp);
}

function parseDateOnly(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const normalized = new Date(Date.UTC(date.year, date.month - 1, date.day));
  if (
    normalized.getUTCFullYear() !== date.year ||
    normalized.getUTCMonth() + 1 !== date.month ||
    normalized.getUTCDate() !== date.day
  ) {
    throw new RangeError("Fecha de calendario inválida");
  }
  return date;
}

export function parseDateStart(value: string, timeZone: string): Date {
  const calendarDate = parseDateOnly(value);
  if (calendarDate) return toZonedDate(calendarDate, timeZone);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError("Fecha inválida");
  return date;
}

export function parseDateEnd(value: string, timeZone: string): Date {
  const calendarDate = parseDateOnly(value);
  if (calendarDate) {
    const nextDay = new Date(
      Date.UTC(calendarDate.year, calendarDate.month - 1, calendarDate.day + 1),
    );
    return new Date(
      toZonedDate(
        {
          year: nextDay.getUTCFullYear(),
          month: nextDay.getUTCMonth() + 1,
          day: nextDay.getUTCDate(),
        },
        timeZone,
      ).getTime() - 1,
    );
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError("Fecha inválida");
  return date;
}

export function startOfMonth(date: Date, timeZone: string): Date {
  const current = getCalendarDate(date, timeZone);
  return toZonedDate({ year: current.year, month: current.month, day: 1 }, timeZone);
}

export function startOfNextMonth(date: Date, timeZone: string): Date {
  const current = getCalendarDate(date, timeZone);
  const nextMonth = new Date(Date.UTC(current.year, current.month, 1));
  return toZonedDate(
    {
      year: nextMonth.getUTCFullYear(),
      month: nextMonth.getUTCMonth() + 1,
      day: 1,
    },
    timeZone,
  );
}
