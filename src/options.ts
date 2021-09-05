export interface Options {
  outputHashes?: boolean;
  outputWeekdayNames?: boolean;
  outputMonthNames?: boolean;
  timezone?: string;
}

export class InternalOptions {
  outputHashes: boolean = false;
  outputWeekdayNames: boolean = false;
  outputMonthNames: boolean = false;
  timezone: string = null;
  constructor(options: Options | undefined) {
    if (options) {
      if (options.outputHashes) {
        this.outputHashes = options.outputHashes;
      }
      if (options.outputWeekdayNames) {
        this.outputWeekdayNames = options.outputWeekdayNames;
      }
      if (options.outputMonthNames) {
        this.outputMonthNames = options.outputMonthNames;
      }
    }
  }
}
