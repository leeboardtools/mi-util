import { compareTimeParts, cleanTimePart } from './TimePart';
import { addDays, cleanDatePart, compareDateParts } from './DatePart';


/**
 * Defines a date with optional time.
 * @typedef {object} DateTimePart
 * @property {DatePart} datePart
 * @property {TimePart} [timePart]
 */

/**
 * Cleans a {@link DateTimePart}, adjusting the date and time as needed to ensure
 * the time part, if present, is a 'normal' time within a day. If any changes are to be
 * made they are made to a copy.
 * @param {DateTimePart} dateTimePart 
 * @returns {DateTimePart|undefined} <code>undefined</code> is returned if either dateTimePart
 * or dateTimePart.datePart is <code>undefined</code>.
 */
export function cleanDateTimePart(dateTimePart) {
    if (!dateTimePart) {
        return;
    }

    let datePart = cleanDatePart(dateTimePart.datePart);
    if (!datePart) {
        return;
    }

    let timePart = cleanTimePart(dateTimePart.timePart);
    if (timePart) {
        if (timePart.hours >= 24) {
            const days = Math.floor(timePart.hours / 24);
            datePart = addDays(datePart, days);
            timePart = Object.assign({}, timePart, {
                hours: timePart.hours - days * 24,
            });
        }
        else if (timePart.hours <= -24) {
            const days = Math.ceil(timePart.hours / 24);
            datePart = addDays(datePart, days);
            timePart = Object.assign({}, timePart, {
                hours: 24 + timePart.hours - days * 24,
            });
        }
    }

    if ((datePart !== dateTimePart.datePart) || (timePart !== dateTimePart.timePart)) {
        const result = {
            datePart: (datePart === dateTimePart.datePart) ? Object.assign({}, datePart) : datePart,
        };
        if (timePart) {
            result.timePart = (timePart === dateTimePart.timePart)
                ? Object.assign({}, timePart) : timePart;
        }
        return result;
    }

    return dateTimePart;
}




/**
 * The possible return values of {@link determineDateTimePartsRelation}.
 * @readonly
 * @enum {number}
 * @property {number} BEFORE a's date part is before b's date part.
 * @property {number} SAME_DATE_BEFORE_TIME The date parts of a and b are the same, but
 * either a doesn't have a time part and b does, or a's time part is before b's time part.
 * @property {number} SAME The date and time parts of a and b are all the same.
 * @property {number} SAME_DATE_AFTER_TIME The date parts of a and b are the same, but
 * either b doesn't have a time part and a does, or a's time part is after b's time part.
 * @property {number} AFTER a's date part is after b's date part.
 * 
 */
export const DateTimePartRelation = {
    BEFORE: -2,
    SAME_DATE_BEFORE_TIME: -1,
    SAME: 0,
    SAME_DATE_AFTER_TIME: 1,
    AFTER: 2,
};

/**
 * Determines the chronological ordering between two {@link DateTmePart}s.
 * @param {DateTimePart} a 
 * @param {DateTimePart} b 
 * @returns {DateTimePartRelation|undefined} <code>undefined</code> is returned if either a or
 * b is <code>undefined</code> or can't be cleaned.
 */
export function determineDateTimePartsRelation(a, b) {
    a = cleanDateTimePart(a);
    b = cleanDateTimePart(b);

    if (!a || !b) {
        return;
    }

    let result = compareDateParts(a.datePart, b.datePart);
    if (result < 0) {
        return DateTimePartRelation.BEFORE;
    }
    else if (result > 0) {
        return DateTimePartRelation.AFTER;
    }

    result = compareTimeParts(a.timePart, b.timePart);
    if (result < 0) {
        return DateTimePartRelation.SAME_DATE_BEFORE_TIME;
    }
    else if (result > 0) {
        return DateTimePartRelation.SAME_DATE_AFTER_TIME;
    }

    return DateTimePartRelation.SAME;
}



/**
 * Defines a date range with optional times.
 * @typedef {object} DateTimeRange
 * @property {object} startDatePart
 * @property {object} [startTimePart]
 * @property {object} finishDatePart
 * @property {object} [finishTimePart]
 */

/**
 * Cleans a {@link DateTimeRange}, cleaning the individual startDatePart/startTimePart and
 * finishDatePart/finishTimePart, and swapping them if the finishDatePart/finishTimePart
 * comes before the startDatePart/startTimePart. If any changes are necessary the are made
 * to a copy of the range.
 * @param {DateTimeRange} range 
 * @returns {DateTimeRange|undefined}
 */
export function cleanDateTimeRange(range) {
    if (!range) {
        return;
    }

    let { startDatePart, startTimePart, finishDatePart, finishTimePart } = range;
    let checkStartFinishOrdering;
    if (!finishDatePart) {
        if (!startDatePart) {
            return;
        }
        else {
            finishDatePart = Object.assign({}, startDatePart);
        }
    }
    else if (!startDatePart) {
        startDatePart = Object.assign({}, finishDatePart);
    }
    else {
        checkStartFinishOrdering = true;
    }

    let result;
    result = cleanDateTimePart({
        datePart: startDatePart,
        timePart: startTimePart,
    });
    startDatePart = result.datePart;
    startTimePart = result.timePart;

    result = cleanDateTimePart({
        datePart: finishDatePart,
        timePart: finishTimePart,
    });
    finishDatePart = result.datePart;
    finishTimePart = result.timePart;

    if (checkStartFinishOrdering
     && determineDateTimePartsRelation(
         {
             datePart: startDatePart,
             timePart: startTimePart,
         },
         {
             datePart: finishDatePart,
             timePart: finishTimePart,
         }
     ) > 0) {
        //
        // finish is before start, gotta swap them...

        [ startDatePart, finishDatePart ] = [ 
            Object.assign({}, finishDatePart), Object.assign({}, startDatePart), 
        ];
        [ startTimePart, finishTimePart ] = [ finishTimePart, startTimePart, ];
        if (startTimePart) {
            startTimePart = Object.assign({}, startTimePart);
        }
        if (finishTimePart) {
            finishTimePart = Object.assign({}, finishTimePart);
        }
    }

    if ((startDatePart !== range.startDatePart) || (startTimePart !== range.startTimePart)
     || (finishDatePart !== range.finishDatePart) || (finishTimePart !== range.finishTimePart)) {
        const result = {
            startDatePart: (range.startDatePart === startDatePart)
                ? Object.assign({}, startDatePart) : startDatePart,
            finishDatePart: (range.finishDatePart === finishDatePart)
                ? Object.assign({}, finishDatePart) : finishDatePart,
        };

        if (startTimePart) {
            result.startTimePart = startTimePart;
        }
        if (finishTimePart) {
            result.finishTimePart = finishTimePart;
        }

        return result;
    }

    return range;
}


/**
 * The possible return values of {@link determineDateTimePartRelationToRange}.
 * @readonly
 * @enum {number}
 * @property {number} BEFORE The date part is before the range's startDatePart
 * @property {number} START_DATE_BUT_BEFORE The date part is the same as the range's startDatePart,
 * but either the time part is before the range's startTimePart or the range doesn't have a
 * startTimePart.
 * @property {number} START The date/time parts match the range's startDatePart/startTimePart.
 * @property {number} DURING The date/time part falls between the startDatePart/startTimePart
 * and finishDatePart/finishTimePart, but not on either.
 * @property {number} FINISH The date/time parts match the range's finishDatePart/finishTimePart.
 * START_DATE_BUT_BEFORE and START take precedence over this.
 * @property {number} FINISH_DATE_BUT_AFTER The date part is the same as the range's finishDatePart,
 * but either the time part is after the range's finishTimePart or the range doesn't have a
 * finishTimePart. START_DATE_BUT_BEFORE and START take precedence over this.
 * @property {number} AFTER The date part is after the range's finishDatePart.
 * 
 */
export const DateTimeRangeRelation = {
    BEFORE: -3,
    START_DATE_BUT_BEFORE: -2,
    START: -1,
    DURING: 0,
    FINISH: 1,
    FINISH_DATE_BUT_AFTER: 2,
    AFTER: 3,
};


/**
 * Determines the relationship between a {@link DateTimePart} and a
 * {@link DateTimeRange}. Note that {@link cleanDateTimePart} and
 * {@link cleanDateTimeRange} are both called before comparisons are made.
 * @param {DateTimePart} dateTimePart 
 * @param {DateTimeRange} range 
 * @returns {DateTimeRangeRelation|undefined}
 */
export function determineDateTimePartRelationToRange(dateTimePart, range) {
    dateTimePart = cleanDateTimePart(dateTimePart);
    if (!dateTimePart) {
        return;
    }

    range = cleanDateTimeRange(range);
    if (!range) {
        return;
    }

    // At this point the range has both startDatePart and finishDatePart
    const startResult = determineDateTimePartsRelation(dateTimePart, 
        {
            datePart: range.startDatePart,
            timePart: range.startTimePart,
        });
    switch (startResult) {
    case DateTimePartRelation.BEFORE :
        return DateTimeRangeRelation.BEFORE;

    case DateTimePartRelation.SAME_DATE_BEFORE_TIME :
        return DateTimeRangeRelation.START_DATE_BUT_BEFORE;

    case DateTimePartRelation.SAME :
        return DateTimeRangeRelation.START;
    }

    // The finish side is a little tricky, since we want to treat the case
    // of no time specified as end of the day.
    let finishDateTimePart = (dateTimePart.timePart)
        ? dateTimePart
        : {
            datePart: addDays(dateTimePart.datePart, 1),
        };
    
    let rangeFinishDatePart = (range.finishTimePart)
        ? range.finishDatePart
        : addDays(range.finishDatePart, 1);

    const finishResult = determineDateTimePartsRelation(finishDateTimePart,
        {
            datePart: rangeFinishDatePart,
            timePart: range.finishTimePart,
        });
    switch (finishResult) {
    case DateTimePartRelation.AFTER :
        if (!compareDateParts(dateTimePart.datePart, range.finishDatePart)) {
            return DateTimeRangeRelation.FINISH_DATE_BUT_AFTER;
        }
        return DateTimeRangeRelation.AFTER;
        
    case DateTimePartRelation.SAME_DATE_AFTER_TIME :
        if (compareDateParts(dateTimePart.datePart, range.finishDatePart) > 0) {
            return DateTimeRangeRelation.AFTER;
        }
        return DateTimeRangeRelation.FINISH_DATE_BUT_AFTER;
        
    case DateTimePartRelation.SAME :
        return DateTimeRangeRelation.FINISH;
    }

    return DateTimeRangeRelation.DURING;
}
