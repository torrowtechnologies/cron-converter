'use strict';

var luxon = require('luxon');
var DateTime = luxon.DateTime;

/**
 * Creates an instance of Seeker.
 * Seeker objects search for execution times of a cron schedule.
 *
 * @constructor
 * @this {Seeker}
 */
function Seeker(cron, now) {
  if (cron.parts === null) {
    throw new Error('No schedule found');
  }
  var date;
  if (now !== undefined) {
    if (typeof now == 'string') {
      date = DateTime.fromISO(now, {zone: 'UTC'});
    } else {
      date = DateTime.fromJSDate(now, {zone: 'UTC'});
    }
  } else {
    date = DateTime.utc();
  }

  if (cron.options.timezone) {
    date = date
      .setZone(cron.options.timezone)
      .setZone('UTC', {keepLocalTime: true});
  }

  if (!date.isValid) {
    throw new Error('Invalid date provided');
  }

  if (date.get('second') > 0) {
    // Add a minute to the date to prevent returning dates in the past
    date = date.plus({minutes: 1});
  }
  this.cron = cron;
  this.now = date;
  this.date = date;
  this.pristine = true;
}

/**
 * Resets the iterator.
 *
 * @this {Seeker}
 */
Seeker.prototype.reset = function() {
  this.pristine = true;
  this.date = DateTime.fromJSDate(this.now.toJSDate(), {zone: 'UTC'});
};

/**
 * Returns the time the schedule would run next.
 *
 * @this {Seeker}
 * @return {Date} The time the schedule would run next.
 */
Seeker.prototype.next = function() {
  if (this.pristine) {
    this.pristine = false;
  } else {
    this.date = this.date.plus({minutes: 1});
  }

  this.date = findDate(this.cron.parts, this.date);
  return this.date;
};

/**
 * Returns the time the schedule would have last run at.
 *
 * @this {Seeker}
 * @return {Date} The time the schedule would have last run at.
 */
Seeker.prototype.prev = function() {
  this.pristine = false;
  this.date = findDate(this.cron.parts, this.date, true);
  return this.date;
};

/**
 * Returns the time the schedule would run next.
 *
 * @param {array} parts An array of Cron parts.
 * @param {Date} date The reference date.
 * @param {boolean} reverse Whether to find the previous value instead of next.
 * @return {luxon} The date the schedule would have executed at.
 */
var findDate = function(parts, date, reverse) {
  var operation = 'plus';
  var reset = 'startOf';
  if (reverse) {
    operation = 'minus';
    reset = 'endOf';
    date = date.minus({minutes: 1}); // Ensure prev and next cannot be same time
  }
  var retry = 24;
  while (--retry) {
    date = shiftMonth(parts, date, operation, reset);
    var dayShift = shiftDay(parts, date, operation, reset);
    date = dayShift.date;
    if (!dayShift.isChanged) {
      var hourShift = shiftHour(parts, dayShift.date, operation, reset);
      date = hourShift.date;
      if (!hourShift.isChanged) {
        var minuteShift = shiftMinute(parts, hourShift.date, operation, reset);
        date = minuteShift.date;
        if (!minuteShift.isChanged) {
          break;
        }
      }
    }
  }
  if (!retry) {
    throw new Error('Unable to find execution time for schedule');
  }
  date = date.set({second: 0, millisecond: 0});

  // Return new luxon.DateTime object
  return date;
};

/**
 * Increments/decrements the month value of a date,
 * until a month that matches the schedule is found
 *
 * @param {array} parts An array of Cron parts.
 * @param {DateTime} date The date to shift.
 * @param {string} operation The function to call on date: 'plus' or 'minus'
 * @param {string} reset The function to call on date: 'startOf' or 'endOf'
 */
var shiftMonth = function(parts, date, operation, reset) {
  while (!parts[3].has(date.month)) {
    date = date[operation]({months: 1})[reset]('month');
  }

  return date;
};

/**
 * Increments/decrements the day value of a date,
 * until a day that matches the schedule is found
 *
 * @param {array} parts An array of Cron parts.
 * @param {DateTime} date The date to shift.
 * @param {string} operation The function to call on date: 'plus' or 'minus'
 * @param {string} reset The function to call on date: 'startOf' or 'endOf'
 * @return {object} Whether the month of the date was changed
 */
var shiftDay = function(parts, date, operation, reset) {
  var currentMonth = date.month;
  while (!parts[2].has(date.day) || !parts[4].has(date.weekday)) {
    date = date[operation]({days: 1})[reset]('day');
    if (currentMonth !== date.month) {
      return {isChanged: true, date: date};
    }
  }
  return {isChanged: false, date: date};
};

/**
 * Increments/decrements the hour value of a date,
 * until an hour that matches the schedule is found
 *
 * @param {array} parts An array of Cron parts.
 * @param {DateTime} date The date to shift.
 * @param {string} operation The function to call on date: 'plus' or 'minus'
 * @param {string} reset The function to call on date: 'startOf' or 'endOf'
 * @return {object} Whether the day of the date was changed
 */
var shiftHour = function(parts, date, operation, reset) {
  var currentDay = date.day;
  while (!parts[1].has(date.hour)) {
    date = date[operation]({hours: 1})[reset]('hour');
    if (currentDay !== date.day) {
      return {isChanged: true, date: date};
    }
  }
  return {isChanged: false, date: date};
};

/**
 * Increments/decrements the minute value of a date,
 * until an minute that matches the schedule is found
 *
 * @param {array} parts An array of Cron parts.
 * @param {DateTime} date The date to shift.
 * @param {string} operation The function to call on date: 'plus' or 'minus'
 * @param {string} reset The function to call on date: 'startOf' or 'endOf'
 * @return {object} Whether the hour of the date was changed
 */
var shiftMinute = function(parts, date, operation, reset) {
  var currentHour = date.hour;
  while (!parts[0].has(date.minute)) {
    date = date[operation]({minutes: 1})[reset]('minute');
    if (currentHour !== date.hour) {
      return {isChanged: true, date: date};
    }
  }
  return {isChanged: false, date: date};
};

module.exports = Seeker;
