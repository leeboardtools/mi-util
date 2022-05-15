

/**
 * @typedef {object} DatePart
 * @property {number} year Full year
 * @property {number} month 0 based month, 0 = January
 * @property {number} dayOfMonth 1 based day of the month.
 */


const quickMaxDayOfMonths = [
    31, // Jan
    28, // Feb
    31, // Mar
    30, // Apr
    31, // May
    30, // Jun
    31, // Jul
    31, // Aug
    30, // Sep
    31, // Oct
    30, // Nov
    31, // Dec
];


/**
 * Cleans up a {@link DatePart}, adjusting the year, month and date to ensure
 * they are all valid. If any changes result the changes are made to a copy of 
 * the original DatePart, if no changes then the original DatePart is returned.
 * Any missing parts are replaced with values from the current date.
 * @param {DatePart} datePart 
 * @returns {DatePart|undefined} <code>undefined</code> is returned if datePart
 * is <code>undefined</code>
 */
export function cleanDatePart(datePart) {
    if (typeof datePart === 'undefined') {
        return datePart;
    }
    else if (typeof datePart !== 'object') {
        datePart = {};
    }

    let { year, month, dayOfMonth } = datePart;
    if (typeof year !== 'number') {
        year = undefined;
    }
    if (typeof month !== 'number') {
        month = undefined;
    }
    if (typeof dayOfMonth !== 'number') {
        dayOfMonth = undefined;
    }

    if ((year === undefined) || (month === undefined) || (dayOfMonth === undefined)) {
        const date = new Date();
        if (year === undefined) {
            year = date.getFullYear();
        }
        if (month === undefined) {
            month = date.getMonth();
        }
        if (dayOfMonth === undefined) {
            dayOfMonth = date.getDate();
        }
    }

    // Avoid creating a Date object if possible...
    if ((month < 0) || (month > 11) || (dayOfMonth < 1)
     || (dayOfMonth > quickMaxDayOfMonths[month])) {
        const date = new Date(year, month, dayOfMonth);
        year = date.getFullYear();
        month = date.getMonth();
        dayOfMonth = date.getDate();
    }

    if ((year !== datePart.year)
     || (month !== datePart.month)
     || (dayOfMonth !== datePart.dayOfMonth)) {
        return {
            year: year,
            month: month,
            dayOfMonth: dayOfMonth,
        };
    }

    return datePart;
}


/**
 * Returns a string representation of a {@link DatePart}, which is of the
 * form:
 * <pre><code>yyyy-mm-dd</code></pre>
 * This string can be converted by an equivalent DatePart by passing it to
 * {@link datePartFromString}().
 * Note that {@link cleanDatePart} is called before conversion.
 * @param {DatePart} datePart 
 * @returns {string|undefined}
 */
export function datePartToString(datePart) {
    if (!datePart) {
        return datePart;
    }

    datePart = cleanDatePart(datePart);
    return datePart.year + '-' + (datePart.month + 1) + '-' + datePart.dayOfMonth;
}


/**
 * Creates a {@link DatePart} object from a string of the form:
 * <pre><code>yyyy-mm-dd</code></pre>
 * Note that {@link cleanDatePart} is called on the created object.
 * @param {string} text 
 * @returns {DatePart|undefined} The parsed date part, undefined if text does not
 * represent a valid date part.
 */
export function datePartFromString(text) {
    if (!text) {
        return text;
    }

    if (typeof text === 'string') {
        text = text.trim();
        const parts = text.split('-');
        if (!parts || (parts.length !== 3)) {
            return;
        }

        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const dayOfMonth = parseInt(parts[2]);
        if (isNaN(year) || isNaN(month) || isNaN(dayOfMonth)) {
            return;
        }

        return cleanDatePart({
            year: year,
            month: month - 1,
            dayOfMonth: dayOfMonth,
        });
    }
}


/**
 * Creates a Date object representing a {@link DatePart}. The time portion
 * is set to local midnight.
 * Note that {@link cleanDatePart} is called prior to the conversion.
 * @param {DatePart} datePart 
 * @returns {Date}
 */
export function datePartToDate(datePart) {
    if (!datePart) {
        return;
    }

    datePart = cleanDatePart(datePart);
    return new Date(datePart.year, datePart.month, datePart.dayOfMonth);
}


/**
 * Returns the date portion of a Date object as a {@link DatePart}
 * @param {Date} date 
 * @returns {DatePart|undefined}
 */
export function datePartFromDate(date) {
    if (!date) {
        return;
    }

    return {
        year: date.getFullYear(),
        month: date.getMonth(),
        dayOfMonth: date.getDate(),
    };
}


/**
 * Adds a number of days to a {@link DatePart}, returning a new object
 * unless deltaDays is 0.
 * @param {DatePart} datePart If this is <code>undefined</code> then today is used.
 * @param {number} deltaDays The number of days to add, may be negative.
 * @returns {DatePart} A copy of datePart updated by deltaDays, datePart if deltaDays is 0.
 */
export function addDays(datePart, deltaDays) {
    if (!datePart) {
        datePart = datePartFromDate(new Date());
    }

    if (deltaDays) {
        const date = datePartToDate(datePart);
        date.setDate(date.getDate() + deltaDays);
        return datePartFromDate(date);
    }

    return datePart;
}


/**
 * Adds a number of months to a {@link DatePart}, returning a new object
 * unless deltaMonths is 0.
 * <p>
 * If the resulting date has a dayOfMonth beyond the last day of the month of
 * the adjusted month the dayOfMonth is pinned to the last day of the month.
 * @param {DatePart} datePart If this is <code>undefined</code> then today is used.
 * @param {number} deltaMonths The number of months to add, may be negative.
 * @returns {DatePart} A copy of datePart updated by deltaMonths, datePart if deltaDays is 0.
 */
export function addMonths(datePart, deltaMonths) {
    if (!datePart) {
        datePart = datePartFromDate(new Date());
    }

    if (deltaMonths) {
        datePart = Object.assign({}, datePart);
        datePart.month += deltaMonths;
        if (datePart.month > 11) {
            datePart.year += Math.floor(datePart.month / 12);
            datePart.month = Math.round(datePart.month % 12);
        }
        else if (datePart.month < 0) {
            datePart.year += Math.floor(datePart.month / 12);
            datePart.month = 12 + Math.round(datePart.month % 12);
            if (datePart.month === 12) {
                datePart.month = 0;
            }
        }

        if ((datePart.month === 1) && (datePart.dayOfMonth >= 29)) {
            // Need to properly handle leap years...
            datePart.dayOfMonth = 29;
            const date = datePartToDate(datePart);
            if (date.getMonth() !== 1) {
                // Not a leap year...
                datePart.dayOfMonth = 28;
            }
        }
        else if (datePart.dayOfMonth > quickMaxDayOfMonths[datePart.month]) {
            datePart.dayOfMonth = quickMaxDayOfMonths[datePart.month];
        }
    }

    return datePart;
}



/**
 * Adds a number of years to a {@link DatePart}, returning a new object
 * unless deltaYears is 0.
 * <p>
 * If the date is February 29 of a leap year and the new year is not a leap year
 * the date is set to February 28.
 * @param {DatePart} datePart If this is <code>undefined</code> then today is used.
 * @param {number} deltaMonths The number of months to add, may be negative.
 * @returns {DatePart} A copy of datePart updated by deltaMonths, datePart if deltaDays is 0.
 */
export function addYears(datePart, deltaYears) {
    if (!datePart) {
        datePart = datePartFromDate(new Date());
    }

    if (deltaYears) {
        datePart = Object.assign({}, datePart);
        datePart.year += deltaYears;

        if ((datePart.month === 1) && (datePart.dayOfMonth >= 29)) {
            // Need to properly handle leap years...
            datePart.dayOfMonth = 29;
            const date = datePartToDate(datePart);
            if (date.getMonth() !== 1) {
                // Not a leap year...
                datePart.dayOfMonth = 28;
            }
        }
    }

    return datePart;
}


/**
 * Determines the number of days datePartB is after datePartA. The following will be
 * true:
 * <pre><code>
 *     compareDateParts(addDays(datePartA, deltaDays(datePartA, datePartB)), datePartB) === 0;
 * </code></pre>
 * @param {DatePart} datePartA 
 * @param {DatePart} datePartB 
 * @returns {number}
 */
export function deltaDays(datePartA, datePartB) {
    if ((datePartA.year === datePartB.year) && (datePartA.month === datePartB.month)) {
        return datePartB.dayOfMonth - datePartA.dayOfMonth;
    }

    const dateA = datePartToDate(datePartA);
    const dateB = datePartToDate(datePartB);
    return Math.round((dateB.valueOf() - dateA.valueOf()) / (24 * 60 * 60000));
}


/**
 * Compares two {@link DatePart} objects.
 * @param {DatePart} datePartA May be <code>undefined</code>
 * @param {DatePart} datePartB May be <code>undefined</code>
 * @returns {number} A number &lt; 0 if datePartA is earlier than datePartB,
 * a number &gt; 0 if datePartA is later than datePartB, and 0 if datePartA
 * and datePartB represent the same date. A date part that is <code>undefined</code>
 * or <code>null</code> is treated as earlier than any other date part.
 */
export function compareDateParts(datePartA, datePartB) {
    if (datePartA === datePartB) {
        return 0;
    }
    
    if (!datePartA) {
        return (datePartB) ? -1 : 0;
    }
    else if (!datePartB) {
        return 1;
    }

    let result = datePartA.year - datePartB.year;
    if (result) {
        return result;
    }

    result = datePartA.month - datePartB.month;
    if (result) {
        return result;
    }

    return datePartA.dayOfMonth - datePartB.dayOfMonth;
}


/**
 * Compares the date part properties of two date parts to see if they are
 * identical. The validity of the properties are not checked, nor equivalent
 * dates.
 * @param {DatePart} a 
 * @param {DatePart} b 
 * @returns {boolean}
 */
export function areDatePartsIdentical(a, b) {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return (a.dayOfMonth === b.dayOfMonth)
     && (a.month === b.month)
     && (a.year === b.year);
}


/**
 * Determines if two date parts represent the same date. This is done by cleaning
 * the date parts and then comparing the date part properties.
 * @param {DatePart} a 
 * @param {DatePart} b 
 * @returns {boolean}
 */
export function areDatePartsEquivalent(a, b) {
    if (areDatePartsIdentical(a, b)) {
        return true;
    }
    
    a = cleanDatePart(a);
    b = cleanDatePart(b);
    return areDatePartsIdentical(a, b);
}


/**
 * Retrieves a {@link DatePart} representing the closest Sunday prior to or the same
 * as a given {@link DatePart}.
 * @param {DatePart} datePart 
 * @returns {DatePart}
 */
export function getClosestSundayOnOrBefore(datePart) {
    const date = datePartToDate(datePart);
    if (date) {
        const dayOfWeek = date.getDay();
        if (!dayOfWeek) {
            return datePart;
        }
        return addDays(datePart, -dayOfWeek);
    }
}


/**
 * Defines a filter to test a {@link DatePart} against. The properties
 * are all optional. If a property is not specified, then any value for
 * that property is acceptable.
 * <p>
 * If all properties are specified then an actual time comparison is performed
 * as with {@link compareDateParts}.
 * @typedef {object} DatePartSingleFilter
 * @property {number} [year]
 * @property {number} [month]
 * @property {number} [dayOfMonth]
 */

/**
 * Used to filter {@link DatePart}s, testing against an earliest date,
 * latest date, or specific date.
 * @typedef {object} DatePartFilter
 * @property {DatePartSingleFilter} [earliestDatePart] If present only date parts
 * that occur on or after this filter are passed.
 * @property {DatePartSingleFilter} [latestDatePart] If present only date parts
 * that occur on or before this filter are passed.
 * @property {DatePartSingleFilter} [datePart] Only used if neither earliestDatePart
 * nor latestDatePart is specified, if present only date parts that match this
 * filter are passed.
 */


/**
 * Determines if something is a {@link DatePartSingleFilter} that has
 * something to apply.
 * @param {DatePartSingleFilter} filter 
 * @returns {boolean} <code>true</code> if filter has something to apply.
 */
export function isDatePartSingleFilter(filter) {
    if (filter) {
        return (typeof filter.year === 'number')
         || (typeof filter.month === 'number')
         || (typeof filter.dayOfMonth === 'number');
    }
}

/**
 * Determines if an object is a {@link DatePartSingleFilter} with at least
 * one property missing.
 * @param {DatePartSingleFilter} filter 
 * @returns {boolean}
 */
export function isPartialDatePartSingleFilter(filter) {
    if (filter) {
        if (typeof filter.year === 'number') {
            return (typeof filter.month !== 'number')
             || (typeof filter.dayOfMonth !== 'number');
        }
        return (typeof filter.month === 'number')
         || (typeof filter.dayOfMonth === 'number');
    }
}

/**
 * Determines if something is a {@link DatePartFilter} that has something
 * to apply.
 * @param {DatePartFilter} filter 
 * @returns {boolean} <code>true</code> if filter has something to apply.
 */
export function isDatePartFilter(filter) {
    if (filter) {
        return isDatePartSingleFilter(filter.earliestDatePart)
         || isDatePartSingleFilter(filter.latestDatePart)
         || isDatePartSingleFilter(filter.datePart);
    }
}


/**
 * Determines if a {@link DatePart} falls on or before a single filter.
 * <p>
 * An <code>undefined</code> datePart always returns <code>false</code>.
 * <p>
 * If datePart is specified, <code>false</code> is returned if for any of the filter properties
 * in filter the value of the corresponding property in datePart is &gt; the filter property value.
 * @param {DatePartSingleFilter} filter 
 * @param {DatePart} datePart 
 * @returns {boolean}
 */
export function isDatePartOnOrBeforeSingleFilter(filter, datePart) {
    if (!datePart) {
        return false;
    }

    if (filter) {
        const { year, month, dayOfMonth } = filter;
        if (typeof year === 'number') {
            if ((typeof month === 'number') && (typeof dayOfMonth === 'number')) {
                // Full comparison...
                return compareDateParts(datePart, filter) <= 0;
            }
            if (datePart.year > year) {
                return false;
            }
        }
        if ((typeof month === 'number') && (datePart.month > month)) {
            return false;
        }
        if ((typeof dayOfMonth === 'number') && (datePart.dayOfMonth > dayOfMonth)) {
            return false;
        }
    }
    return true;
}

/**
 * Determines if a {@link DatePart} falls on or after a single filter.
 * <p>
 * An <code>undefined</code> datePart always returns <code>false</code>.
 * <p>
 * If datePart is specified, <code>false</code> is returned if for any of the filter properties
 * in filter the value of the corresponding property in datePart is &lt; the filter property value.
 * @param {DatePartSingleFilter} filter 
 * @param {DatePart} datePart 
 * @returns {boolean}
 */
export function isDatePartOnOrAfterSingleFilter(filter, datePart) {
    if (!datePart) {
        return false;
    }

    if (filter) {
        const { year, month, dayOfMonth } = filter;
        if (typeof year === 'number') {
            if ((typeof month === 'number') && (typeof dayOfMonth === 'number')) {
                // Full comparison...
                return compareDateParts(datePart, filter) >= 0;
            }
            if (datePart.year < year) {
                return false;
            }
        }
        if ((typeof month === 'number') && (datePart.month < month)) {
            return false;
        }
        if ((typeof dayOfMonth === 'number') && (datePart.dayOfMonth < dayOfMonth)) {
            return false;
        }
    }
    return true;
}


function resolveFilterParts(filter) {
    if (filter) {
        if (filter.earliestDatePart || filter.latestDatePart) {
            return filter;
        }

        const { datePart } = filter;
        if (datePart) {
            return {
                earliestDatePart: datePart,
                latestDatePart: datePart,
            };
        }
    }
}


/**
 * Determines if a date part satisfies a date part filter.
 * <p>
 * An <code>undefined</code> datePart always returns <code>false</code>.
 * <p>
 * <code>false</code> is returned if any of the following are true:
 * <li>earliestDatePart is specified in filter and the date part
 * fails to satisfy {@link isDatePartOnOrAfterSingleFilter} with that filter.
 * <li>latestDataPart is specified in filter and the date part
 * fails to satisfy {@link isDatePartOnOrBeforeSingleFilter} with that filter.
 * @param {DatePartFilter} filter 
 * @param {DatePart} datePart 
 * @returns {boolean}
 */
export function isDatePartInFilter(filter, datePart) {
    if (!datePart) {
        return false;
    }

    filter = resolveFilterParts(filter);
    if (!filter) {
        return true;
    }

    return isDatePartOnOrAfterSingleFilter(
        filter.earliestDatePart, datePart)
     && isDatePartOnOrBeforeSingleFilter(
         filter.latestDatePart, datePart);
}

/**
 * Determines if a date range defined by two date parts falls entirely within a date part filter.
 * @param {DatePartFilter} filter 
 * @param {DatePart} datePartA 
 * @param {DatePart} datePartB 
 * @returns {boolean}
 */
export function isDatePartRangeFullyInFilter(filter, datePartA, datePartB) {
    if (!datePartA || !datePartB) {
        return false;
    }

    filter = resolveFilterParts(filter);
    if (!filter) {
        return true;
    }

    return isDatePartInFilter(filter, datePartA)
     && ((datePartA === datePartB) || isDatePartInFilter(filter, datePartB));
}

/**
 * Determines if any portion of a date range defined by two date parts overlaps a date part filter.
 * <p>
 * If the filter's single filters are full filters, that is, {@link isPartialDatePartSingleFilter}
 * returns <code>false</code> for all specified single filters, then the 
 * date range overlaps if the later of the date parts satisfies
 * {@link isDatePartOnOrAfterSingleFilter} and the earlier of the date parts satisfies
 * {@link isDatePartOnOrBeforeSingleFilter}
 * <p>
 * If the filter's single filters are not all full filters, then the test is a bit more complicated,
 * with the date range months and day of months appropriately spanning the year and month ends,
 * and the filters tested against those. Any date range with a span of 2 or more years and falling
 * within the year requirement, if any, will always pass. Note that for partial filters both
 * earliest and latest of a particular part should be specified, for example both 
 * filter.earliestDatePart.month and filter.latestDatePart.month if month is of interest, otherwise
 * the results may be unexpected. If only the earliest is not specified then it is treated
 * as if Number.MIN_SAFE_INTEGER were specified, if only the latest is not specified then it
 * is treated as if Number.MAX_SAFE_INTEGER were specified.
 * <p>
 * Note that the earlier and later of the date parts is determined by the actual date parts, while
 * the earliestDatePart and latestDatePart properties are as defined in the filter.
 * <p>
 * @param {DatePartFilter} filter 
 * @param {DatePart} datePartA 
 * @param {DatePart} datePartB 
 * @returns {boolean}
 */
export function isDatePartRangeOverlappingFilter(filter, datePartA, datePartB) {
    if (!datePartA || !datePartB) {
        return false;
    }
 
    filter = resolveFilterParts(filter);
    if (!filter) {
        return true;
    }

    if (compareDateParts(datePartA, datePartB) > 0) {
        [ datePartA, datePartB ] = [ datePartB, datePartA ];
    }

    if (isPartialDatePartSingleFilter(filter.earliestDatePart)
     || ((filter.earliestDatePart !== filter.latestDatePart)
      && isPartialDatePartSingleFilter(filter.latestDatePart))) {
        return _isDatePartRangeOverlappingPartialFilter(filter, datePartA, datePartB);
    }

    return isDatePartOnOrBeforeSingleFilter(filter.latestDatePart, datePartA)
     && isDatePartOnOrAfterSingleFilter(filter.earliestDatePart, datePartB);
}



function _isDatePartRangeOverlappingPartialFilter(filter, earlierDatePart, laterDatePart) {
    const earliestFilter = Object.assign(
        {
            year: Number.MIN_SAFE_INTEGER,
            month: Number.MIN_SAFE_INTEGER,
            dayOfMonth: Number.MIN_SAFE_INTEGER,
        },
        filter.earliestDatePart);
    const latestFilter = Object.assign(
        {
            year: Number.MAX_SAFE_INTEGER,
            month: Number.MAX_SAFE_INTEGER,
            dayOfMonth: Number.MAX_SAFE_INTEGER,

        },
        filter.latestDatePart);
    
    if ((earlierDatePart.year > latestFilter.year) || (laterDatePart.year < earliestFilter.year)) {
        return false;
    }

    const yearSpan = laterDatePart.year - earlierDatePart.year;
    let monthSpan = laterDatePart.month - earlierDatePart.month;
    if (yearSpan < 1) {
        // If the dates have the same year then earlierDatePart.month <= laterDatePart.month...
        // The filter fails if earlierDatePart.month is after laterFilter.month or laterDatePart.month
        // is before earlierFilter.month.
        if (latestFilter.month < earliestFilter.month) {
            // The good range is from earliestFilter.month through 11, then 0 through latestFilter.month.
            // We therfore fail if both the earlier and the later months fall in the bad range.
            if ((earlierDatePart.month > latestFilter.month) && (earlierDatePart.month < earliestFilter.month)
             && (laterDatePart.month > latestFilter.month) && (laterDatePart.month < earliestFilter.month)) {
                return false;
            }
        }
        else if ((earlierDatePart.month > latestFilter.month) || (laterDatePart.month < earliestFilter.month)) {
            return false;
        }
    }
    else if (yearSpan < 2) {
        // The date range always crosses New Year's...
        if (latestFilter.month < earliestFilter.month) {
            // The good range is from earliestFilter.month through 11, then 0 through latestFilter.month.
            // But since the date range always crosses New Year's, we're alway true...
            return true;
        }
        else {
            // Since the date range crosses New Year's, the only invalid dates will have the earlier
            // month after the latest filter month AND the later month before the earliest filter month.
            if ((earlierDatePart.month > latestFilter.month) && (laterDatePart.month < earliestFilter.month)) {
                return false;
            }
        }
        monthSpan += 12;
    }
    else {
        // 2 or more years then every month and DOM are covered...
        return true;
    }


    if (monthSpan < 1) {
        // Same month...
        if (latestFilter.dayOfMonth < earliestFilter.dayOfMonth) {
            // The good range is from earliest DOM to the end of the month, then 1 through latest DOM.
            // We therefore fail if both earlier and later DOMs fall between the latest and earliest DOMs.
            if ((earlierDatePart.dayOfMonth > latestFilter.dayOfMonth)
             && (earlierDatePart.dayOfMonth < earliestFilter.dayOfMonth)
             && (laterDatePart.dayOfMonth > latestFilter.dayOfMonth)
             && (laterDatePart.dayOfMonth < earliestFilter.dayOfMonth)) {
                return false;
            }
        }
        else if ((laterDatePart.dayOfMonth < earliestFilter.dayOfMonth)
         || (earlierDatePart.dayOfMonth > latestFilter.dayOfMonth)) {
            return false;
        }
    }
    else if (monthSpan < 2) {
        // The date range always crosses the end of the month...
        if (latestFilter.dayOfMonth < earliestFilter.dayOfMonth) {
            // The good range is from earliest DOM to the end of the month, then 1 through latest DOM.
            // Since the date range always crosses the end of the month we're valid.
        }
        else {
            // Since the date range crosses the end of the month, the only invalid ranges will have
            // the earlier DOM after the latest DOM AND the later DOM before the earliest DOM.
            if ((earlierDatePart.dayOfMonth > latestFilter.dayOfMonth)
             && (laterDatePart.dayOfMonth < earliestFilter.dayOfMonth)) {
                return false;
            }
        }
    }

    return true;
}