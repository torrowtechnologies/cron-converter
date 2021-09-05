import { Unit } from "./units";
import { InternalOptions } from "./options";
import { sort, flatten, dedup, range } from "./util";

/**
 * Part objects represent a collection of positive integers.
 */
class Part {
  options: InternalOptions;
  unit: Unit;
  values: number[];

  /**
   * Creates an instance of Part.
   *
   * @constructor
   * @param {Unit} unit The unit of measurement of time (see units.js).
   * @param {InternalOptions} options The options to use
   */
  constructor(unit: Unit, options: InternalOptions) {
    this.unit = unit;
    this.options = options;
  }

  /**
   * Creates a new Error object.
   * Appends the unit name to the message.
   *
   * @param {string} message A message string to use for the message.
   * @returns {Error} An error to thro
   */
  error(message: string) : Error {
    return new Error(`${message} for ${this.unit.name}`);
  }

  /**
   * Validates a range of positive integers.
   *
   * @param {array} arr An array of positive integers.
   */
  fromArray(arr: number[]) {
    const values = sort(
      dedup(
        this.fixSunday(
          arr.map((value) => {
            if (isNaN(value)) {
              throw this.error(`Invalid value "${value}"`);
            }
            return value;
          }, this)
        )
      )
    );
    if (!values.length) {
      throw this.error("Empty interval value");
    }
    const value = this.outOfRange(values);
    if (typeof value !== "undefined") {
      throw this.error(`Value "${value}" out of range`);
    }
    this.values = values;
  }

  /**
   * Parses a string as a range of positive integers.
   *
   * @param {string} str The string to be parsed as a range.
   */
  fromString(str: string) {
    const unit = this.unit;
    const stringParts = str.split("/");
    if (stringParts.length > 2) {
      throw this.error(`Invalid value "${str}"`);
    }
    const rangeString = this.replaceAlternatives(stringParts[0]);
    let parsedValues: number[];
    if (rangeString === "*") {
      parsedValues = range(unit.min, unit.max);
    } else {
      parsedValues = sort(
        dedup(
          this.fixSunday(
            flatten(
              rangeString.split(",").map(function (range) {
                return this.parseRange(range, str);
              }, this)
            )
          )
        )
      );
      const value = this.outOfRange(parsedValues);
      if (typeof value !== "undefined") {
        throw this.error(`Value "${value}" out of range`);
      }
    }
    const step = this.parseStep(stringParts[1]);
    const intervalValues = this.applyInterval(parsedValues, step);
    if (!intervalValues.length) {
      throw this.error(`Empty interval value "${str}"`);
    }
    this.values = intervalValues;
  }

  /**
   * Replace all 7 with 0 as Sunday can
   * be represented by both.
   *
   * @param {number[]} values The values to process.
   * @returns {number[]} The resulting array.
   */
  fixSunday(values: number[]): number[] {
    if (this.unit.name === "weekday") {
      values = values.map(function (value) {
        if (value === 7) {
          return 0;
        }
        return value;
      });
    }
    return values;
  }

  /**
   * Parses a range string
   *
   * @param {string} range The range string.
   * @param {string} context The operation context string.
   * @returns {array} The resulting array.
   */
  parseRange(str: string, context: string): number[] {
    const subparts = str.split("-");
    if (subparts.length === 1) {
      const value = parseInt(subparts[0], 10);
      if (isNaN(value)) {
        throw this.error(`Invalid value "${context}"`);
      }
      return [value];
    } else if (subparts.length === 2) {
      const minValue = parseInt(subparts[0], 10);
      const maxValue = parseInt(subparts[1], 10);
      if (maxValue < minValue) {
        throw this.error(`Max range is less than min range in "${str}"`);
      }
      return range(minValue, maxValue);
    } else {
      throw this.error(`Invalid value "${str}"`);
    }
  }

  /**
   * Parses the step from a part string
   *
   * @param {string} step The step string.
   * @returns {number | undefined} The step value.
   */
  parseStep(step: string): number | undefined {
    if (typeof step !== "undefined") {
      const parsedStep = parseInt(step, 10);
      if (isNaN(parsedStep) || parsedStep < 1) {
        throw this.error(`Invalid interval step value "${step}"`);
      }
      return parsedStep;
    }
    return undefined;
  }

  /**
   * Applies an interval step to a collection of values
   *
   * @param {number[]} values A collection of numbers.
   * @param {number} step The step value.
   * @returns {number[]} The resulting collection.
   */
  applyInterval(values: number[], step: number): number[] {
    if (step) {
      const minVal = values[0];
      values = values.filter(function (value) {
        return value % step === minVal % step || value === minVal;
      });
    }
    return values;
  }

  /**
   * Replaces the alternative representations of numbers in a string
   *
   * @param {string} str The string to process.
   * @returns {string} The processed string.
   */
  replaceAlternatives(str: string): string {
    const unit = this.unit;
    if (unit.alt) {
      str = str.toUpperCase();
      for (let i = 0; i < unit.alt.length; i++) {
        str = str.replace(unit.alt[i], (i + unit.min).toString());
      }
    }
    return str;
  }

  /**
   * Finds an element from values that is outside of the range of this.unit
   *
   * @param {number[]} values The values to test.
   * @returns {number | undefined} An integer is a value out of range was found,
   *                otherwise undefined.
   */
  outOfRange(values: number[]): number | undefined {
    const first = values[0];
    const last = values[values.length - 1];
    if (first < this.unit.min) {
      return first;
    } else if (last > this.unit.max) {
      return last;
    } else {
      return undefined;
    }
  }

  /**
   * Returns the smallest value in the range.
   *
   * @returns {number} The smallest value.
   */
  min(): number {
    return this.values[0];
  }

  /**
   * Returns the largest value in the range.
   *
   * @returns {number} The largest value.
   */
  max(): number {
    return this.values[this.values.length - 1];
  }

  /**
   * Returns true if range has all the values of the unit.
   *
   * @returns {boolean} true/false.
   */
  isFull(): boolean {
    return this.values.length === this.unit.max - this.unit.min + 1;
  }

  /**
   * Returns the difference between first and second elements in the range.
   *
   * @returns {number | undefined} step size
   */
  getStep(): number | undefined {
    if (this.values.length > 2) {
      const step = this.values[1] - this.values[0];
      if (step > 1) {
        return step;
      }
    }
    return undefined;
  }

  /**
   * Returns true if the range can be represented as an interval.
   *
   * @param {number} step The difference between numbers in the interval.
   * @returns {boolean} true/false.
   */
  isInterval(step: number): boolean {
    for (let i = 1; i < this.values.length; i++) {
      const prev = this.values[i - 1];
      const value = this.values[i];
      if (value - prev !== step) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns true if the range contains all the interval values.
   *
   * @param {number} step The difference between numbers in the interval.
   * @returns {boolean} true/false.
   */
  isFullInterval(step: number): boolean {
    const unit = this.unit;
    const min = this.min();
    const max = this.max();
    const haveAllValues = this.values.length === (max - min) / step + 1;
    if (min === unit.min && max + step > unit.max && haveAllValues) {
      return true;
    }
    return false;
  }

  /**
   * Checks if the range contains the specified value
   *
   * @param {number} value The value to look for.
   * @returns {boolean} Whether the value is present in the range.
   */
  has(value: number): boolean {
    return this.values.indexOf(value) > -1;
  }

  /**
   * Returns the range as an array of positive integers.
   *
   * @returns {array} The range as an array.
   */
  toArray(): Array<any> {
    return this.values;
  }

  /**
   * Returns the range as an array of ranges
   * defined as arrays of positive integers.
   *
   * @returns {array} The range as a multi-dimentional array.
   */
  toRanges(): Array<any> {
    const retval = [];
    let startPart = null;
    this.values.forEach(function (value, index, self) {
      if (value !== self[index + 1] - 1) {
        if (startPart !== null) {
          retval.push([startPart, value]);
          startPart = null;
        } else {
          retval.push(value);
        }
      } else if (startPart === null) {
        startPart = value;
      }
    });
    return retval;
  }

  /**
   * Returns the range as a string.
   *
   * @returns {string} The range as a string.
   */
  toString(): string {
    let retval = "";
    if (this.isFull()) {
      if (this.options.outputHashes) {
        retval = "H";
      } else {
        retval = "*";
      }
    } else {
      const step = this.getStep();
      let format: string;
      if (step && this.isInterval(step)) {
        if (this.isFullInterval(step)) {
          if (this.options.outputHashes) {
            retval = `H/${step}`
          } else {
            retval = `*/${step}`
          }
        } else {
          const min = this.formatValue(this.min())
          const max = this.formatValue(this.max())
          if (this.options.outputHashes) {
            retval = `H(${min}-${max})/${step}`;
          } else {
            retval = `${min}-${max}/${step}`;
          }
        }
      } else {
        retval = this.toRanges()
          .map(function (range) {
            if (range.length) {
              const from = this.formatValue(range[0])
              const to = this.formatValue(range[1])
              return `${from}-${to}`
            } else {
              return this.formatValue(range);
            }
          }, this)
          .join(",");
      }
    }
    return retval;
  }

  /**
   * Formats weekday and month names as string
   * when the relevant options are set.
   *
   * @param {number} value The value to process.
   * @returns {number | string} The formatted string or number.
   */
  formatValue(value: number): number | string {
    if (
      (this.options.outputWeekdayNames && this.unit.name === "weekday") ||
      (this.options.outputMonthNames && this.unit.name === "month")
    ) {
      return this.unit.alt[value - this.unit.min];
    }
    return value;
  }
}

export default Part;
