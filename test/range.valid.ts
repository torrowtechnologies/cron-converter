import Part from "../src/part";
import { expect } from "chai";

const validRanges = [
  {
    input: "0-4",
    arr: [0, 1, 2, 3, 4],
    output: "0-4",
    min: 0,
    max: 6,
    name: 'DUMMY',
  },
  {
    input: "SUN",
    arr: [0],
    output: "0",
    min: 0,
    max: 6,
    alt: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    name: 'DUMMY',
  },
  {
    input: "SUN,MON,TUE",
    arr: [0, 1, 2],
    output: "0-2",
    min: 0,
    max: 6,
    alt: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    name: 'DUMMY',
  },
  {
    input: "mon-fri",
    arr: [1, 2, 3, 4, 5],
    output: "1-5",
    min: 0,
    max: 6,
    alt: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    name: 'DUMMY',
  },
  {
    input: "1,2,3",
    arr: [1, 2, 3],
    output: "1-3",
    min: 1,
    max: 10,
    name: 'DUMMY',
  },
  {
    input: "1,3,2",
    arr: [1, 2, 3],
    output: "*",
    min: 1,
    max: 3,
    name: 'DUMMY',
  },
  {
    input: "1,2,5-10",
    arr: [1, 2, 5, 6, 7, 8, 9, 10],
    output: "1-2,5-10",
    min: 1,
    max: 30,
    name: 'DUMMY',
  },
  {
    input: "*",
    arr: [1, 2, 3, 4, 5],
    output: "*",
    min: 1,
    max: 5,
    name: 'DUMMY',
  },
  {
    input: "5",
    arr: [5],
    output: "5",
    min: 1,
    max: 5,
    name: 'DUMMY',
  },
  {
    input: "1-10/5",
    arr: [1, 6],
    output: "1,6",
    min: 0,
    max: 59,
    name: 'DUMMY',
  },
  {
    input: "5-30/5",
    arr: [5, 10, 15, 20, 25, 30],
    output: "5-30/5",
    min: 0,
    max: 59,
    name: 'DUMMY',
  },
  {
    input: "5,10,15,20,25,30",
    arr: [5, 10, 15, 20, 25, 30],
    output: "5-30/5",
    min: 0,
    max: 59,
    name: 'DUMMY',
  },
  {
    input: "5-20,35-45/5",
    arr: [5, 10, 15, 20, 35, 40, 45],
    output: "5,10,15,20,35,40,45",
    min: 0,
    max: 59,
    name: 'DUMMY',
  },
  {
    input: "5,5,6,6,7,7",
    arr: [5, 6, 7],
    output: "5-7",
    min: 0,
    max: 59,
    name: 'DUMMY',
  },
  {
    input: "1-1",
    arr: [1],
    output: "1",
    min: 1,
    max: 5,
    name: 'DUMMY',
  },
];
describe("Should parse valid string", function () {
  validRanges.forEach(function (validRange) {
    const range = new Part(validRange, {
      outputHashes: false,
      outputMonthNames: false,
      outputWeekdayNames: false,
      timezone: null,
    });
    range.fromString(validRange.input);
    it(validRange.input + " as array", function () {
      expect(range.toArray()).to.eql(validRange.arr);
    });
    it(validRange.input + " as string", function () {
      expect(range.toString()).to.equal(validRange.output);
    });
  });
});
