import { InternalOptions, Options } from "./options";
import Part from "./part";
import Seeker from "./seeker";
import units from "./units";

/**
 * Cron objects each represent a cron schedule.
 */
class Cron {
  options: InternalOptions;
  parts: Part[];
  /**
   * Creates an instance of Cron.
   *
   * @param {Options | undefined} options The options to use
   */
  constructor(options: Options | undefined = undefined) {
    this.options = new InternalOptions(options);
    this.parts = null;
  }

  /**
   * Parses a cron string.
   *
   * @param {string} str The string to parse.
   */
  fromString(str: string): Cron {
    if (typeof str !== "string") {
      throw new Error("Invalid cron string");
    }
    const parts = str.replace(/\s+/g, " ").trim().split(" ");
    if (parts.length === 5) {
      const options = this.options;
      this.parts = parts.map(function (str, idx) {
        const part = new Part(units[idx], options);
        part.fromString(str);
        return part;
      });
    } else {
      throw new Error("Invalid cron string format");
    }
    return this;
  }

  /**
   * Returns the cron schedule as a string.
   *
   * @returns {string} The cron schedule as a string.
   */
  toString(): string {
    if (this.parts === null) {
      throw new Error("No schedule found");
    }
    return this.parts.join(" ");
  }

  /**
   * Parses a 2-dimentional array of integers as a cron schedule.
   *
   * @param {number[][]} cronArr The array to parse.
   */
  fromArray(cronArr: number[][]): Cron {
    if (cronArr.length === 5) {
      this.parts = cronArr.map(function (
        partArr: number[],
        idx: string | number
      ) {
        const part = new Part(units[idx], this.options);
        part.fromArray(partArr);
        return part;
      },
      this);
    } else {
      throw new Error("Invalid cron array");
    }
    return this;
  }

  /**
   * Returns the cron schedule as
   * a 2-dimentional array of integers.
   *
   * @returns {number[][]} The cron schedule as an array.
   */
  toArray(): number[][] {
    if (this.parts === null) {
      throw new Error("No schedule found");
    }
    return this.parts.map(function (part) {
      return part.toArray();
    });
  }

  /**
   * Returns the time the schedule would run next.
   *
   * @param {any} now A Date object
   * @returns {object} A schedule iterator.
   */
  schedule(now: any = undefined): Seeker {
    return new Seeker(this, now);
  }
}

export default Cron;
