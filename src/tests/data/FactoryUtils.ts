import * as faker from "faker";

export enum TimeUnits {
  Seconds,
  Minutes,
  Hours,
  Days,
  Months,
  Years,
}

export class FactoryUtils {
  public static create<T>(n: number, fn: () => T): T[] {
    return Array(n).fill(null).map(fn);
  }

  public static pickRandomValue<T>(values: T[]): T {
    const i = FactoryUtils.getRandomNumber(0, values.length - 1);
    return values[i];
  }

  public static getRandomNumber(min: number, max: number, scale = 1): number {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    return value * scale;
  }

  public static getRandomLetter(): string {
    return "abcdefghijklmnopqrstuvwxyz".charAt(
      FactoryUtils.getRandomNumber(0, 25),
    );
  }

  public static getRandomBoolean(): boolean {
    return Boolean(Math.round(Math.random()));
  }

  public static getRandomHexString(): string {
    return faker.datatype.hexaDecimal(10);
  }

  public static getTimeInMilliseconds(amount: number, units: TimeUnits) {
    /**
     * Returns the amount of time in milliseconds, under the assumption that there are
     * 30 days in a month and 365 days in a year.
     *
     * @param amount The amount of time as an integer
     * @param units  The units of time (i.e. seconds, minutes) in enum
     * @returns      The amount of time in milliseconds
     */
    switch (units) {
      case TimeUnits.Seconds:
        return amount * 1000;
      case TimeUnits.Minutes:
        return amount * 1000 * 60;
      case TimeUnits.Hours:
        return amount * 1000 * 60 * 60;
      case TimeUnits.Days:
        return amount * 1000 * 60 * 60 * 24;
      case TimeUnits.Months:
        return amount * 1000 * 60 * 60 * 24 * 30;
      case TimeUnits.Years:
        return amount * 1000 * 60 * 60 * 24 * 365;
    }
  }
}
