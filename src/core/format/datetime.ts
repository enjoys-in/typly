import { format, formatDistanceToNow, type Locale } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB';
import { hi } from 'date-fns/locale/hi';

/**
 * How every date and time in the app is written.
 *
 * One place, because timestamps used to be formatted with a different pattern
 * at each call site — some 24-hour, some without a year, none with seconds.
 * Readable beats compact: a 12-hour clock with am/pm and seconds, and a month
 * name rather than a number, so nobody has to work out whether 03/09 is March
 * or September.
 */

/** '03 Sep 2026, 9:26:05 pm' */
const DATE_TIME = 'dd MMM yyyy, h:mm:ss aaa';
/** '03 Sep 2026' */
const DATE_FULL = 'dd MMM yyyy';
/** '03 Sep' — for dense rows where the year is implied. */
const DATE_SHORT = 'dd MMM';
/** '9:26:05 pm' */
const TIME_ONLY = 'h:mm:ss aaa';

/** Month and am/pm wording follows the interface language. */
const LOCALES: Record<string, Locale> = { en: enGB, hi };

function localeFor(lang: string): Locale {
  return LOCALES[lang] ?? enGB;
}

export interface DateFormatter {
  /** Full stamp: date, 12-hour time, seconds. */
  dateTime(value: string | number | Date): string;
  /** Date with the year. */
  date(value: string | number | Date): string;
  /** Date without the year. */
  dateShort(value: string | number | Date): string;
  /** Time of day with seconds. */
  time(value: string | number | Date): string;
  /** "3 hours ago" — relative, for things that just happened. */
  ago(value: string | number | Date): string;
}

/** Formatter bound to one interface language. */
export function dateFormatterFor(lang: string): DateFormatter {
  const locale = localeFor(lang);
  const at = (value: string | number | Date) => new Date(value);
  return {
    dateTime: (v) => format(at(v), DATE_TIME, { locale }),
    date: (v) => format(at(v), DATE_FULL, { locale }),
    dateShort: (v) => format(at(v), DATE_SHORT, { locale }),
    time: (v) => format(at(v), TIME_ONLY, { locale }),
    ago: (v) => formatDistanceToNow(at(v), { addSuffix: true, locale }),
  };
}
