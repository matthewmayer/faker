import type { Faker } from '../..';
import type { DateEntryDefinition } from '../../definitions';
import { FakerError } from '../../errors/faker-error';
import { SimpleModuleBase } from '../../internal/module-base';
import { assertLocaleData } from '../../locale-proxy';

/**
 * Converts a date passed as a `string`, `number` or `Date` to a valid `Date` object.
 *
 * @param date The date to convert.
 * @param name The reference name used for error messages. Defaults to `'refDate'`.
 *
 * @throws If the given date is invalid.
 */
function toDate(date: string | Date | number, name: string = 'refDate'): Date {
  const converted = new Date(date);

  if (Number.isNaN(converted.valueOf())) {
    throw new FakerError(`Invalid ${name} date: ${date.toString()}`);
  }

  return converted;
}

/**
 * Module to generate dates (without methods requiring localized data).
 */
export class SimpleDateModule extends SimpleModuleBase {
  /**
   * Generates a random date that can be either in the past or in the future.
   *
   * @param options The optional options object.
   * @param options.refDate The date to use as reference point for the newly generated date. Defaults to `faker.defaultRefDate()`.
   *
   * @see faker.date.between(): For generating dates in a specific range.
   * @see faker.date.past(): For generating dates explicitly in the past.
   * @see faker.date.future(): For generating dates explicitly in the future.
   *
   * @example
   * faker.date.anytime() // '2022-07-31T01:33:29.567Z'
   *
   * @since 8.0.0
   */
  anytime(
    options: {
      /**
       * The date to use as reference point for the newly generated date.
       *
       * @default faker.defaultRefDate()
       */
      refDate?: string | Date | number;
    } = {}
  ): Date {
    const { refDate = this.faker.defaultRefDate() } = options;
    const time = toDate(refDate).getTime();

    return this.between({
      from: time - 1000 * 60 * 60 * 24 * 365,
      to: time + 1000 * 60 * 60 * 24 * 365,
    });
  }

  /**
   * Generates a random date in the past.
   *
   * @param options The optional options object.
   * @param options.years The range of years the date may be in the past. Defaults to `1`.
   * @param options.refDate The date to use as reference point for the newly generated date. Defaults to `faker.defaultRefDate()`.
   *
   * @see faker.date.recent(): For generating dates in the recent past (days instead of years).
   *
   * @example
   * faker.date.past() // '2021-12-03T05:40:44.408Z'
   * faker.date.past({ years: 10 }) // '2017-10-25T21:34:19.488Z'
   * faker.date.past({ years: 10, refDate: '2020-01-01T00:00:00.000Z' }) // '2017-08-18T02:59:12.350Z'
   *
   * @since 8.0.0
   */
  past(
    options: {
      /**
       * The range of years the date may be in the past.
       *
       * @default 1
       */
      years?: number;
      /**
       * The date to use as reference point for the newly generated date.
       *
       * @default faker.defaultRefDate()
       */
      refDate?: string | Date | number;
    } = {}
  ): Date {
    const { years = 1, refDate = this.faker.defaultRefDate() } = options;

    if (years <= 0) {
      throw new FakerError('Years must be greater than 0.');
    }

    const time = toDate(refDate).getTime();

    return this.between({
      from: time - years * 365 * 24 * 3600 * 1000,
      to: time - 1000,
    });
  }

  /**
   * Generates a random date in the future.
   *
   * @param options The optional options object.
   * @param options.years The range of years the date may be in the future. Defaults to `1`.
   * @param options.refDate The date to use as reference point for the newly generated date. Defaults to `faker.defaultRefDate()`.
   *
   * @see faker.date.soon(): For generating dates in the near future (days instead of years).
   *
   * @example
   * faker.date.future() // '2022-11-19T05:52:49.100Z'
   * faker.date.future({ years: 10 }) // '2030-11-23T09:38:28.710Z'
   * faker.date.future({ years: 10, refDate: '2020-01-01T00:00:00.000Z' }) // '2020-12-13T22:45:10.252Z'
   *
   * @since 8.0.0
   */
  future(
    options: {
      /**
       * The range of years the date may be in the future.
       *
       * @default 1
       */
      years?: number;
      /**
       * The date to use as reference point for the newly generated date.
       *
       * @default faker.defaultRefDate()
       */
      refDate?: string | Date | number;
    } = {}
  ): Date {
    const { years = 1, refDate = this.faker.defaultRefDate() } = options;

    if (years <= 0) {
      throw new FakerError('Years must be greater than 0.');
    }

    const time = toDate(refDate).getTime();

    return this.between({
      from: time + 1000,
      to: time + years * 365 * 24 * 3600 * 1000,
    });
  }

  /**
   * Generates a random date between the given boundaries.
   *
   * @param options The options object.
   * @param options.from The early date boundary.
   * @param options.to The late date boundary.
   *
   * @throws If `from` or `to` are not provided.
   * @throws If `from` is after `to`.
   *
   * @example
   * faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2030-01-01T00:00:00.000Z' }) // '2026-05-16T02:22:53.002Z'
   *
   * @since 8.0.0
   */
  between(options: {
    /**
     * The early date boundary.
     */
    from: string | Date | number;
    /**
     * The late date boundary.
     */
    to: string | Date | number;
  }): Date {
    if (!options || !options.from || !options.to) {
      throw new FakerError(
        'Must pass an options object with `from` and `to` values.'
      );
    }

    const { from, to } = options;

    const fromMs = toDate(from, 'from').getTime();
    const toMs = toDate(to, 'to').getTime();
    if (fromMs > toMs) {
      throw new FakerError('`from` date must be before `to` date.');
    }

    return new Date(this.faker.number.int({ min: fromMs, max: toMs }));
  }

  /**
   * Generates random dates between the given boundaries. The dates will be returned in an array sorted in chronological order.
   *
   * @param options The options object.
   * @param options.from The early date boundary.
   * @param options.to The late date boundary.
   * @param options.count The number of dates to generate. Defaults to `3`.
   *
   * @throws If `from` or `to` are not provided.
   * @throws If `from` is after `to`.
   *
   * @example
   * faker.date.betweens({ from: '2020-01-01T00:00:00.000Z', to: '2030-01-01T00:00:00.000Z' })
   * // [
   * //   2022-07-02T06:00:00.000Z,
   * //   2024-12-31T12:00:00.000Z,
   * //   2027-07-02T18:00:00.000Z
   * // ]
   * faker.date.betweens({ from: '2020-01-01T00:00:00.000Z', to: '2030-01-01T00:00:00.000Z', count: 2 })
   * // [ 2023-05-02T16:00:00.000Z, 2026-09-01T08:00:00.000Z ]
   * faker.date.betweens({ from: '2020-01-01T00:00:00.000Z', to: '2030-01-01T00:00:00.000Z', count: { min: 2, max: 5 }})
   * // [
   * //   2021-12-19T06:35:40.191Z,
   * //   2022-09-10T08:03:51.351Z,
   * //   2023-04-19T11:41:17.501Z
   * // ]
   *
   * @since 8.0.0
   */
  betweens(options: {
    /**
     * The early date boundary.
     */
    from: string | Date | number;
    /**
     * The late date boundary.
     */
    to: string | Date | number;
    /**
     * The number of dates to generate.
     *
     * @default 3
     */
    count?:
      | number
      | {
          /**
           * The minimum number of dates to generate.
           */
          min: number;
          /**
           * The maximum number of dates to generate.
           */
          max: number;
        };
  }): Date[] {
    if (!options || !options.from || !options.to) {
      throw new FakerError(
        'Must pass an options object with `from` and `to` values.'
      );
    }

    const { from, to, count = 3 } = options;
    return this.faker.helpers
      .multiple(() => this.between({ from, to }), { count })
      .sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Generates a random date in the recent past.
   *
   * @param options The optional options object.
   * @param options.days The range of days the date may be in the past. Defaults to `1`.
   * @param options.refDate The date to use as reference point for the newly generated date. Defaults to `faker.defaultRefDate()`.
   *
   * @see faker.date.past(): For generating dates further back in time (years instead of days).
   *
   * @example
   * faker.date.recent() // '2022-02-04T02:09:35.077Z'
   * faker.date.recent({ days: 10 }) // '2022-01-29T06:12:12.829Z'
   * faker.date.recent({ days: 10, refDate: '2020-01-01T00:00:00.000Z' }) // '2019-12-27T18:11:19.117Z'
   *
   * @since 8.0.0
   */
  recent(
    options: {
      /**
       * The range of days the date may be in the past.
       *
       * @default 1
       */
      days?: number;
      /**
       * The date to use as reference point for the newly generated date.
       *
       * @default faker.defaultRefDate()
       */
      refDate?: string | Date | number;
    } = {}
  ): Date {
    const { days = 1, refDate = this.faker.defaultRefDate() } = options;

    if (days <= 0) {
      throw new FakerError('Days must be greater than 0.');
    }

    const time = toDate(refDate).getTime();

    return this.between({
      from: time - days * 24 * 3600 * 1000,
      to: time - 1000,
    });
  }

  /**
   * Generates a random date in the near future.
   *
   * @param options The optional options object.
   * @param options.days The range of days the date may be in the future. Defaults to `1`.
   * @param options.refDate The date to use as reference point for the newly generated date. Defaults to `faker.defaultRefDate()`.
   *
   * @see faker.date.future(): For generating dates further in the future (years instead of days).
   *
   * @example
   * faker.date.soon() // '2022-02-05T09:55:39.216Z'
   * faker.date.soon({ days: 10 }) // '2022-02-11T05:14:39.138Z'
   * faker.date.soon({ days: 10, refDate: '2020-01-01T00:00:00.000Z' }) // '2020-01-01T02:40:44.990Z'
   *
   * @since 8.0.0
   */
  soon(
    options: {
      /**
       * The range of days the date may be in the future.
       *
       * @default 1
       */
      days?: number;
      /**
       * The date to use as reference point for the newly generated date.
       *
       * @default faker.defaultRefDate()
       */
      refDate?: string | Date | number;
    } = {}
  ): Date {
    const { days = 1, refDate = this.faker.defaultRefDate() } = options;

    if (days <= 0) {
      throw new FakerError('Days must be greater than 0.');
    }

    const time = toDate(refDate).getTime();

    return this.between({
      from: time + 1000,
      to: time + days * 24 * 3600 * 1000,
    });
  }

  /**
   * Returns a random birthdate.
   *
   * @param options The options to use to generate the birthdate. If no options are set, an age between 18 and 80 (inclusive) is generated.
   * @param options.min The minimum age or year to generate a birthdate.
   * @param options.max The maximum age or year to generate a birthdate.
   * @param options.refDate The date to use as reference point for the newly generated date. Defaults to `now`.
   * @param options.mode The mode to generate the birthdate. Supported modes are `'age'` and `'year'` .
   *
   * There are two modes available `'age'` and `'year'`:
   * - `'age'`: The min and max options define the age of the person (e.g. `18` - `42`).
   * - `'year'`: The min and max options define the range the birthdate may be in (e.g. `1900` - `2000`).
   *
   * Defaults to `year`.
   *
   * @example
   * faker.date.birthdate() // 1977-07-10T01:37:30.719Z
   * faker.date.birthdate({ min: 18, max: 65, mode: 'age' }) // 2003-11-02T20:03:20.116Z
   * faker.date.birthdate({ min: 1900, max: 2000, mode: 'year' }) // 1940-08-20T08:53:07.538Z
   *
   * @since 7.0.0
   */
  birthdate(
    options: {
      /**
       * The minimum age or year to generate a birthdate.
       *
       * @default 18
       */
      min?: number;
      /**
       * The maximum age or year to generate a birthdate.
       *
       * @default 80
       */
      max?: number;
      /**
       * The mode to generate the birthdate. Supported modes are `'age'` and `'year'` .
       *
       * There are two modes available `'age'` and `'year'`:
       * - `'age'`: The min and max options define the age of the person (e.g. `18` - `42`).
       * - `'year'`: The min and max options define the range the birthdate may be in (e.g. `1900` - `2000`).
       *
       * @default 'year'
       */
      mode?: 'age' | 'year';
      /**
       * The date to use as reference point for the newly generated date.
       *
       * @default faker.defaultRefDate()
       */
      refDate?: string | Date | number;
    } = {}
  ): Date {
    const { mode = 'year', refDate = this.faker.defaultRefDate() } = options;
    const date = toDate(refDate);
    const refYear = date.getUTCFullYear();

    // If no min or max is specified, generate a random date between (now - 80) years and (now - 18) years respectively
    // So that people can still be considered as adults in most cases

    // Convert to epoch timestamps
    let min: number;
    let max: number;
    if (mode === 'age') {
      min = new Date(date).setUTCFullYear(refYear - (options.max ?? 80) - 1);
      max = new Date(date).setUTCFullYear(refYear - (options.min ?? 18));
    } else {
      // Avoid generating dates the first and last date of the year
      // to avoid running into other years depending on the timezone.
      min = new Date(Date.UTC(0, 0, 2)).setUTCFullYear(
        options.min ?? refYear - 80
      );
      max = new Date(Date.UTC(0, 11, 30)).setUTCFullYear(
        options.max ?? refYear - 19
      );
    }

    if (max < min) {
      throw new FakerError(
        `Max ${options.max} should be larger than or equal to min ${options.min}.`
      );
    }

    return new Date(this.faker.number.int({ min, max }));
  }
}

/**
 * Module to generate dates.
 *
 * ### Overview
 *
 * To quickly generate a date in the past, use [`recent()`](https://fakerjs.dev/api/date.html#recent) (last day) or [`past()`](https://fakerjs.dev/api/date.html#past) (last year).
 * To quickly generate a date in the future, use [`soon()`](https://fakerjs.dev/api/date.html#soon) (next day) or [`future()`](https://fakerjs.dev/api/date.html#future) (next year).
 * For a realistic birthdate for an adult, use [`birthdate()`](https://fakerjs.dev/api/date.html#birthdate).
 *
 * For more control, any of these methods can be customized with further options, or use [`between()`](https://fakerjs.dev/api/date.html#between) to generate a single date between two dates, or [`betweens()`](https://fakerjs.dev/api/date.html#betweens) for multiple dates.
 *
 * Dates can be specified as Javascript Date objects, strings or UNIX timestamps.
 * For example to generate a date between 1st January 2000 and now, use:
 * ```ts
 * faker.date.between({ from: '2000-01-01', to: Date.now() });
 * ```
 *
 * You can generate random localized month and weekday names using [`month()`](https://fakerjs.dev/api/date.html#month) and [`weekday()`](https://fakerjs.dev/api/date.html#weekday).
 *
 * These methods have additional concerns about reproducibility, see [Reproducible Results](https://fakerjs.dev/guide/usage.html#reproducible-results).
 */
export class DateModule extends SimpleDateModule {
  constructor(protected readonly faker: Faker) {
    super(faker);
  }

  /**
   * Returns a random name of a month.
   *
   * @param options The optional options to use.
   * @param options.abbreviated Whether to return an abbreviation. Defaults to `false`.
   * @param options.context Whether to return the name of a month in the context of a date. In the default `en` locale this has no effect, however, in other locales like `fr` or `ru`, this may affect grammar or capitalization, for example `'январь'` with `{ context: false }` and `'января'` with `{ context: true }` in `ru`. Defaults to `false`.
   *
   * @example
   * faker.date.month() // 'October'
   * faker.date.month({ abbreviated: true }) // 'Feb'
   * faker.date.month({ context: true }) // 'June'
   * faker.date.month({ abbreviated: true, context: true }) // 'Sep'
   *
   * @since 3.0.1
   */
  month(
    options: {
      /**
       * Whether to return an abbreviation.
       *
       * @default false
       */
      abbreviated?: boolean;
      /**
       * Whether to return the name of a month in the context of a date.
       *
       * In the default `en` locale this has no effect,
       * however, in other locales like `fr` or `ru`, this may affect grammar or capitalization,
       * for example `'январь'` with `{ context: false }` and `'января'` with `{ context: true }` in `ru`.
       *
       * @default false
       */
      context?: boolean;
    } = {}
  ): string {
    const { abbreviated = false, context = false } = options;

    const source = this.faker.definitions.date.month;
    let type: keyof DateEntryDefinition;
    if (abbreviated) {
      const useContext = context && source['abbr_context'] != null;
      type = useContext ? 'abbr_context' : 'abbr';
    } else {
      const useContext = context && source['wide_context'] != null;
      type = useContext ? 'wide_context' : 'wide';
    }

    const values = source[type];
    assertLocaleData(values, 'date.month', type);
    return this.faker.helpers.arrayElement(values);
  }

  /**
   * Returns a random day of the week.
   *
   * @param options The optional options to use.
   * @param options.abbreviated Whether to return an abbreviation. Defaults to `false`.
   * @param options.context Whether to return the day of the week in the context of a date. In the default `en` locale this has no effect, however, in other locales like `fr` or `ru`, this may affect grammar or capitalization, for example `'Lundi'` with `{ context: false }` and `'lundi'` with `{ context: true }` in `fr`. Defaults to `false`.
   *
   * @example
   * faker.date.weekday() // 'Monday'
   * faker.date.weekday({ abbreviated: true }) // 'Thu'
   * faker.date.weekday({ context: true }) // 'Thursday'
   * faker.date.weekday({ abbreviated: true, context: true }) // 'Fri'
   *
   * @since 3.0.1
   */
  weekday(
    options: {
      /**
       * Whether to return an abbreviation.
       *
       * @default false
       */
      abbreviated?: boolean;
      /**
       * Whether to return the day of the week in the context of a date.
       *
       * In the default `en` locale this has no effect,
       * however, in other locales like `fr` or `ru`, this may affect grammar or capitalization,
       * for example `'Lundi'` with `{ context: false }` and `'lundi'` with `{ context: true }` in `fr`.
       *
       * @default false
       */
      context?: boolean;
    } = {}
  ): string {
    const { abbreviated = false, context = false } = options;

    const source = this.faker.definitions.date.weekday;
    let type: keyof DateEntryDefinition;
    if (abbreviated) {
      const useContext = context && source['abbr_context'] != null;
      type = useContext ? 'abbr_context' : 'abbr';
    } else {
      const useContext = context && source['wide_context'] != null;
      type = useContext ? 'wide_context' : 'wide';
    }

    const values = source[type];
    assertLocaleData(values, 'date.weekday', type);
    return this.faker.helpers.arrayElement(values);
  }
}
