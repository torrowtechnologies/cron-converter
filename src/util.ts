/**
 * Creates an array of integers from start to end, inclusive.
 *
 * @param {number} start The first number in the range
 * @param {number} end The last number in the range
 * @returns {number[]} The range, as an array of integers
 */
export const range = function (start: number, end: number): number[] {
  const array = [];
  for (let i = start; i <= end; i++) {
    array.push(i);
  }
  return array;
};

/**
 * Sorts an array of numbers.
 *
 * @param {number[]} array The array to sort
 * @returns {number[]} The sorted array
 */
export const sort = function (array: number[]): number[] {
  array.sort(function (a, b) {
    return a - b;
  });
  return array;
};

/**
 * Flattens a 2-dimensional array
 *
 * @param {number[][]} arrays A 2-dimensional array
 * @returns {number[]} The flattened array
 */
export const flatten = function (arrays: number[][]): number[] {
  return [].concat.apply([], arrays);
};

/**
 * Removes duplicate entries from an array
 *
 * @param {number[]} array An array
 * @returns {number[]} The de-duplicated array
 */
export const dedup = function (array: number[]): number[] {
  const result = [];
  array.forEach(function (i) {
    if (result.indexOf(i) < 0) {
      result.push(i);
    }
  });
  return result;
};
