

export const MILLISECONDS_PER_MINUTE = 60 * 1000;
export const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
export const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

/**
 * The {@link TimePart} that is closest to midnight but before.
 * @constant
 */
export const PRE_MIDNIGHT_TIME_PART = {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999.
};

/**
 * The {@link TimePart} for midnight.
 * @constant
 */
export const MIDNIGHT_TIME_PART = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
};

/**
 * @typedef {object} TimePart
 * @property {number} [hours] The hours, always rounded to an integer.
 * @property {number} [minutes] The minutes, always rounded to an integer.
 * @property {number} [seconds] The seconds, always rounded to an integer.
 * @property {number} [milliseconds] The milliseconds, always rounded to an integer.
 */


/**
 * Cleans up a {@link TimePart}, adjusting values so the hours, minutes, seconds, and
 * milliseconds are all whole numbers, with minutes &gt; -60 and &lt; 60, the 
 * seconds &gt; -60 and &lt; 60, and milliseconds &gt; -1000 and &lt; 1000.
 * All properties are assigned values.
 * If any adjustments are needed they are made to a copy of the original TimePart,
 * if no changes then the original TimePart is returned.
 * @param {TimePart} timePart 
 * @returns {TimePart|undefined} <code>undefined</code> is returned if timePart
 * is <code>undefined</code>
 */
export function cleanTimePart(timePart) {
    if (typeof timePart === 'undefined') {
        return;
    }
    else if (typeof timePart !== 'object') {
        timePart = {};
    }

    let { hours, minutes, seconds, milliseconds } = timePart;

    if (typeof hours !== 'number') {
        hours = 0;
    }
    if (typeof minutes !== 'number') {
        minutes = 0;
    }
    if (typeof seconds !== 'number') {
        seconds = 0;
    }
    if (typeof milliseconds !== 'number') {
        milliseconds = 0;
    }

    let rounding = cleanValue(milliseconds, 1000);
    milliseconds = rounding.value;
    seconds += rounding.carry;

    rounding = cleanValue(seconds, 60);
    seconds = rounding.value;
    minutes += rounding.carry;

    rounding = cleanValue(minutes, 60);
    minutes = rounding.value;
    hours += rounding.carry;

    hours = Math.round(hours);

    if ((hours !== timePart.hours)
     || (minutes !== timePart.minutes)
     || (seconds !== timePart.seconds)
     || (milliseconds !== timePart.milliseconds)) {
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds,
        };
    }

    return timePart;
}

function cleanValue(value, bound) {
    let sign;
    if (value < 0) {
        sign = -1;
        value = -value;
    }
    else {
        sign = 1;
    }

    if (value >= bound) {
        const carry = Math.floor(value / bound);
        value -= carry * bound;
        return {
            value: sign * Math.round(value),
            carry: sign * carry,
        };
    }
    return {
        value: sign * Math.round(value),
        carry: 0,
    };
}


/**
 * Determines if something is a {@link TimePart}. Something is a TimePart if it
 * meets the following:
 * <li>It is an object
 * <li>It has at least one of the properties of an {@link TimePart}
 * <li>Any properties of an {@link TimePart} it has are either a number or
 * are <code>undefined</code>.
 * @param {*} item 
 * @returns {boolean}
 */
export function isTimePart(item) {
    if ((typeof item === 'object')
     && isUndefinedOrNumber(item.hours)
     && isUndefinedOrNumber(item.minutes)
     && isUndefinedOrNumber(item.seconds)
     && isUndefinedOrNumber(item.milliseconds)) {
        return (typeof item.hours === 'number')
         || (typeof item.minutes === 'number')
         || (typeof item.seconds === 'number')
         || (typeof item.milliseconds === 'number');
    }
}

function isUndefinedOrNumber(value) {
    return value === undefined || (typeof value === 'number');
}


/**
 * Returns a string representation of a {@link TimePart}, which is of the
 * form:
 * <pre><code>hh:mm:ss.ms</code></pre>
 * The .ms part is not generated if the milliseconds property does not exist.
 * This string can be converted by an equivalent TimePart by passing it to
 * {@link TimePartFromString}().
 * Note that {@link cleanTimePart} is called before conversion.
 * @param {TimePart} timePart 
 * @param {string} [options] If 'no-ms' then milliseconds are not included
 * in the output, but the seconds are rounded accordingly.
 * @returns {string|undefined}
 */
export function timePartToString(timePart, options) {
    if (timePart) {
        timePart = cleanTimePart(timePart);

        let { hours, minutes, seconds, milliseconds } = timePart;

        let secondsPart;
        if (milliseconds) {
            if (options === 'no-ms') {
                seconds = Math.round(seconds + milliseconds / 1000);
                if ((seconds >= 60) || (seconds <= -60)) {
                    // Gotta handle overflows...
                    timePart = cleanTimePart({
                        hours: hours,
                        minutes: minutes,
                        seconds: seconds,
                    });
                    hours = timePart.hours;
                    minutes = timePart.minutes;
                    seconds = timePart.seconds;
                }
                secondsPart = hmsToStringPart(seconds);
            }
            else {
                seconds = Math.round(seconds * 1000 + milliseconds) / 1000;
                secondsPart = hmsToStringPart(seconds);

                const decimalIndex = secondsPart.indexOf('.');
                if (decimalIndex >= 0) {
                    if (secondsPart.length - decimalIndex > 4) {
                        secondsPart = secondsPart.slice(0, decimalIndex + 4);
                    }
                }
            }
        }

        if (!secondsPart) {
            secondsPart = hmsToStringPart(seconds);
        }

        return hmsToStringPart(hours)
            + ':' + hmsToStringPart(minutes)
            + ':' + secondsPart;
    }
}

function hmsToStringPart(value) {
    if (value < 10) {
        if (value > -10) {
            if (value >= 0) {
                return '0' + value.toString();
            }
            else {
                return '-0' + -value.toString();
            }
        }
    }

    return value.toString();
}


/**
 * Creates a {@link TimePart} object from a string of the forms:
 * <pre><code>hh:mm:ss.ms</code></pre>
 * <pre><code>hh:mm:ss</code></pre>
 * <pre><code>hh:mm</code></pre>
 * Note that {@link cleanTimePart} is called on the created object.
 * @param {string} text 
 * @returns {TimePart|undefined} The parsed time part, <code>undefined</code> if text does not
 * represent a valid time part.
 */
export function timePartFromString(text) {
    if (!text) {
        return text;
    }


    if (typeof text === 'string') {
        text = text.trim();
        const parts = text.split(':');
        if (!parts || ((parts.length !== 2) && (parts.length !== 3))) {
            return;
        }

        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        if (isNaN(hours) || isNaN(minutes)) {
            return;
        }
        
        let seconds;
        let milliseconds;
        if (parts.length === 3) {
            let fullSeconds = parseFloat(parts[2]);
            if (isNaN(fullSeconds)) {
                return;
            }

            let sign;
            if (fullSeconds < 0) {
                sign = -1;
                fullSeconds = -fullSeconds;
            }
            else {
                sign = 1;
            }

            seconds = Math.floor(fullSeconds);
            milliseconds = cleanValue((fullSeconds - seconds) * 1000, 1000).value;

            // Avoid -0s.
            if (seconds) {
                seconds *= sign;
            }
            else {
                seconds = 0;
            }

            if (milliseconds) {
                milliseconds *= sign;
            }
            else {
                milliseconds = 0;
            }
        }

        return cleanTimePart({
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds,
        });
    }
}


/**
 * Calculates and returns the equivalent milliseconds of an {@link TimePart}.
 * Note that all the time part properties are rounded prior to converting to
 * milliseconds, so say 3.25 seconds converts to 3000 ms.
 * @param {TimePart} timePart 
 * @returns {number|undefined} <code>undefined</code> is returned if timePart is
 * not an object.
 */
export function timePartTo_ms(timePart) {
    if (!timePart) {
        return timePart;
    }

    if (typeof timePart === 'object') {
        let milliseconds = Math.round(timePart.milliseconds || 0, 1000);
        if (typeof timePart.seconds === 'number') {
            milliseconds += Math.round(timePart.seconds) * 1000;
        }
        if (typeof timePart.minutes === 'number') {
            milliseconds += Math.round(timePart.minutes) * 60000;
        }
        if (typeof timePart.hours === 'number') {
            milliseconds += Math.round(timePart.hours) * 3600000;
        }
        return milliseconds;
    }
}


/**
 * Creates a {@link TimePart} that's an equivalent number of milliseconds from midnight.
 * @param {number} ms 
 * @param {number} [wrapAround_ms = undefined] If specified, the milliseconds will be adjusted
 * as needed so it is &ge; 0 and &lt; wrapAround_ms. For example, to convert milliseconds to
 * 24 hour time, set wrapAround_ms to MILLISECONDS_PER_DAY.
 * @returns {TimePart|undefined}    <code>undefined</code> is returned if ms is not
 * a number.
 */
export function timePartFrom_ms(ms, wrapAround_ms) {
    if (typeof ms === 'number') {
        // 
        if (wrapAround_ms > 0) {
            if (ms >= wrapAround_ms) {
                ms = Math.round(ms % wrapAround_ms);
            }
            else if (ms < 0) {
                ms = wrapAround_ms + Math.round(ms % wrapAround_ms);
            }
        }

        let totalSeconds = Math.round(ms) / 1000;
        let sign;
        if (totalSeconds < 0) {
            sign = -1;
            totalSeconds = -totalSeconds;
        }
        else {
            sign = 1;
        }

        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds -= hours * 3600;

        const minutes = Math.floor(totalSeconds / 60);
        totalSeconds -= minutes * 60;

        const seconds = Math.floor(totalSeconds);
        totalSeconds -= seconds;

        const milliseconds = cleanValue(totalSeconds * 1000, 1000).value;

        return {
            hours: (hours) ? hours * sign : 0,
            minutes: (minutes) ? minutes * sign : 0,
            seconds: (seconds) ? seconds * sign : 0,
            milliseconds: (milliseconds) ? milliseconds * sign : 0,
        };
    }
}



/**
 * Compares two {@link TimePart} objects. The comparison is performed by calling
 * {@link timePartTo_ms} on each time part and then comparing the results.
 * @param {TimePart} a May be <code>undefined</code>
 * @param {TimePart} b May be <code>undefined</code>
 * @returns {number} A number &lt; 0 if the millisecond equivalent of a is less
 * than the millsecond equivalent of b, &gt; 0 if greater, and 0 if equal. If
 * an argument cannot be converted to milliseconds it is treated as <code>undefined</code>.
 * <code>undefined</code> values are treated as occurring before any millisecond values.
 */
export function compareTimeParts(a, b) {
    if (a === b) {
        return 0;
    }

    a = timePartTo_ms(a);
    b = timePartTo_ms(b);

    if (typeof a !== 'number') {
        return (typeof b !== 'number') ? 0 : -1;
    }
    else if (typeof b !== 'number') {
        return 1;
    }

    return a - b;
}


/**
 * Returns the time portion of a Date object as a {@link TimePart}.
 * @param {Date} time 
 * @returns {TimePart|undefined} <code>undefined</code> is returned if time is not an object.
 */
export function timePartFromDate(time) {
    if (typeof time === 'object') {
        return {
            hours: time.getHours(),
            minutes: time.getMinutes(),
            seconds: time.getSeconds(),
            milliseconds: time.getMilliseconds(),
        };
    }
}

/**
 * Applies a {@link TimePart} to a Date object.
 * Note that {@link cleanTimePart} is called before application.
 * @param {TimePart} timePart 
 * @param {Date} [time] If <code>undefined</code> new Date() is called.
 * @returns {Date} The time object ot which the time part was applied.
 */
export function applyTimePartToDate(timePart, time) {
    time = time || new Date();

    if (typeof timePart === 'object') {
        timePart = cleanTimePart(timePart);
        time.setHours(timePart.hours);
        time.setMinutes(timePart.minutes);
        time.setSeconds(timePart.seconds);
        time.setMilliseconds(timePart.milliseconds);
    }

    return time;
}


/**
 * Compares the time part properties of two time parts to see if they are
 * identical. The validity of the properties are not checked, nor equivalent
 * times.
 * @param {TimePart} a 
 * @param {TimePart} b 
 * @returns {boolean}
 */
export function areTimePartsIdentical(a, b) {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return (a.hours === b.hours)
     && (a.minutes === b.minutes)
     && (a.seconds === b.seconds)
     && (a.milliseconds === b.milliseconds);
}


/**
 * Determines if two time parts represent the same time. This is done by cleaning
 * the time parts and then comparing the time part properties.
 * @param {TimePart} a 
 * @param {TimePart} b 
 * @returns {boolean}
 */
export function areTimePartsEquivalent(a, b) {
    if (areTimePartsIdentical(a, b)) {
        return true;
    }
    
    a = cleanTimePart(a);
    b = cleanTimePart(b);
    return areTimePartsIdentical(a, b);
}


/**
 * Defines a filter to test a {@link TimePart} against. The properties
 * are all optional. If a property is not specified, then any value for
 * that property is acceptable.
 * <p>
 * If all properties are specified then an actual time comparison is performed
 * as with {@link compareTimeParts}.
 * @typedef {object} TimePartSingleFilter
 * @property {number} [hours]
 * @property {number} [minutes]
 * @property {number} [seconds]
 * @property {number} [milliseconds]
 */

/**
 * Used to filter {@link TimePart}s, testing against an earliest time,
 * latest time, or specific time.
 * @typedef {object} TimePartFilter
 * @property {TimePartSingleFilter} [earliestTimePart]
 * @property {TimePartSingleFilter} [latestTimePart]
 * @property {TimePartSingleFilter} [timePart]
 */



/**
 * Determines if something is a {@link TimePartSingleFilter} that has
 * something to apply.
 * @param {TimePartSingleFilter} filter 
 * @returns {boolean} <code>true</code> if filter has something to apply.
 */
export function isTimePartSingleFilter(filter) {
    if (filter) {
        return (typeof filter.hours === 'number')
         || (typeof filter.minutes === 'number')
         || (typeof filter.seconds === 'number')
         || (typeof filter.milliseconds === 'number');
    }
}

/**
 * Determines if something is a {@link TimePartFilter} that has
 * something to apply.
 * @param {TimePartFilter} filter 
 * @returns {boolean} <code>true</code> if filter has something to apply.
 */
export function isTimePartFilter(filter) {
    if (filter) {
        return isTimePartSingleFilter(filter.earliestTimePart)
         || isTimePartSingleFilter(filter.latestTimePart)
         || isTimePartSingleFilter(filter.timePart);
    }
}


/**
 * Determines if something is a {@link TimePartSingleFilter} that is partially
 * specified.
 * @param {TimePartSingleFilter} filter 
 * @returns {boolean} <code>true</code> if filter is partially specified.
 */
export function isPartialTimePartSingleFilter(filter) {
    if (filter) {
        if (typeof filter.hours === 'number') {
            if ((typeof filter.minutes !== 'number')
             || (typeof filter.seconds !== 'number')
             || (typeof filter.milliseconds !== 'number')) {
                return true;
            }
        }
        else if ((typeof filter.minutes === 'number')
         || (typeof filter.seconds === 'number')
         || (typeof filter.milliseconds === 'number')) {
            return true;
        }
    }
}


/**
 * Determines if a {@link TimePart} falls on or before a single filter.
 * <p>
 * An <code>undefined</code> timePart always returns <code>false</code>.
 * <p>
 * If timePart is specified, <code>false</code> is returned if for any of the filter properties
 * in filter the value of the corresponding property in timePart is &gt; the filter property value.
 * @param {TimePartSingleFilter} filter 
 * @param {TimePart} timePart 
 * @returns {boolean}
 */
export function isTimePartOnOrBeforeSingleFilter(filter, timePart) {
    if (!timePart) {
        return false;
    }

    if (filter) {
        const { hours, minutes, seconds, milliseconds } = filter;
        if (typeof hours === 'number') {
            if ((typeof minutes === 'number') && (typeof seconds === 'number')
             && (typeof milliseconds === 'number')) {
                return compareTimeParts(timePart, filter) <= 0;
            }
            if (timePart.hours > hours) {
                return false;
            }
        }
        if ((typeof minutes === 'number') && (timePart.minutes > minutes)) {
            return false;
        }
        if ((typeof seconds === 'number') && (timePart.seconds > seconds)) {
            return false;
        }
        if ((typeof milliseconds === 'number') && (timePart.milliseconds > milliseconds)) {
            return false;
        }
    }
    return true;
}


/**
 * Determines if a {@link TimePart} falls on or after a single filter.
 * <p>
 * An <code>undefined</code> timePart always returns <code>false</code>.
 * <p>
 * If timePart is specified, <code>false</code> is returned if for any of the filter properties
 * in filter the value of the corresponding property in timePart is &lt; the filter property value.
 */
export function isTimePartOnOrAfterSingleFilter(filter, timePart) {
    if (!timePart) {
        return false;
    }

    if (filter) {
        const { hours, minutes, seconds, milliseconds } = filter;
        if (typeof hours === 'number') {
            if ((typeof minutes === 'number') && (typeof seconds === 'number')
             && (typeof milliseconds === 'number')) {
                return compareTimeParts(timePart, filter) >= 0;
            }
            if (timePart.hours < hours) {
                return false;
            }
        }
        if ((typeof minutes === 'number') && (timePart.minutes < minutes)) {
            return false;
        }
        if ((typeof seconds === 'number') && (timePart.seconds < seconds)) {
            return false;
        }
        if ((typeof milliseconds === 'number') && (timePart.milliseconds < milliseconds)) {
            return false;
        }
    }
    return true;
}


function resolveFilter(filter) {
    if (filter) {
        if (filter.earliestTimePart || filter.latestTimePart) {
            return filter;
        }

        const { timePart } = filter;
        if (timePart) {
            return {
                earliestTimePart: timePart,
                latestTimePart: timePart,
            };
        }
    }
}

/**
 * Determines if a time part satisfies a time part filter.
 * <p>
 * An <code>undefined</code> timePart always returns <code>false</code>.
 * <p>
 * <code>false</code> is returned if any of the following are true:
 * <li>earliestTimePart is specified in filter and the time part
 * fails to satisfy {@link isTimePartOnOrAfterSingleFilter} with that filter.
 * <li>latestDataPart is specified in filter and the time part
 * fails to satisfy {@link isTimePartOnOrBeforeSingleFilter} with that filter.
 * @param {TimePartFilter} filter 
 * @param {TimePart} timePart 
 * @returns {boolean}
 */
export function isTimePartInFilter(filter, timePart) {
    if (!timePart) {
        return false;
    }

    filter = resolveFilter(filter);
    if (!filter) {
        return true;
    }

    return isTimePartOnOrBeforeSingleFilter(filter.latestTimePart, timePart)
     && isTimePartOnOrAfterSingleFilter(filter.earliestTimePart, timePart);
}

/**
 * Determines if a time range defined by two time parts falls entirely within a time part filter.
 * @param {TimePartFilter} filter 
 * @param {TimePart} timePartA 
 * @param {TimePart} timePartB 
 * @returns {boolean}
 */
export function isTimePartRangeFullyInFilter(filter, timePartA, timePartB) {
    if (!timePartA || !timePartB) {
        return false;
    }

    filter = resolveFilter(filter);
    if (!filter) {
        return true;
    }
    return isTimePartInFilter(filter, timePartA)
     && isTimePartInFilter(filter, timePartB);
}

/**
 * Determines if any portion of a time range defined by two time parts overlaps a time part filter.
 * <p>
 * The time range overlaps if the later of the time parts satisfies
 * {@link isTimePartOnOrAfterSingleFilter} and the earlier of the time parts satisfies
 * {@link isTimePartOnOrBeforeSingleFilter}.
 * <p>
 * Note that the earlier and later of the time parts is determined by the actual time parts, while
 * the earliestTimePart and latestTimePart properties are as defined in the filter.
 * @param {TimePartFilter} filter 
 * @param {TimePart} timePartA 
 * @param {TimePart} timePartB 
 * @returns {boolean}
 */
export function isTimePartRangeOverlappingFilter(filter, timePartA, timePartB) {
    if (!timePartA || !timePartB) {
        return false;
    }

    filter = resolveFilter(filter);
    if (!filter) {
        return true;
    }

    if (compareTimeParts(timePartA, timePartB) > 0) {
        [ timePartA, timePartB, ] = [ timePartB, timePartA, ];
    }

    if (isPartialTimePartSingleFilter(filter.earliestTimePart)
     || ((filter.earliestTimePart !== filter.latestTimePart)
      && isPartialTimePartSingleFilter(filter.latestTimePart))) {
        return _isTimePartRangeOverlappingPartialFilter(filter, timePartA, timePartB);
    }

    return isTimePartOnOrBeforeSingleFilter(filter.latestTimePart, timePartA)
     && isTimePartOnOrAfterSingleFilter(filter.earliestTimePart, timePartB);
}


function _isTimePartRangeOverlappingPartialFilter(filter, earlierTimePart, laterTimePart) {
    const earliestFilter = Object.assign(
        {
            hours: Number.MIN_SAFE_INTEGER,
            minutes: Number.MIN_SAFE_INTEGER,
            seconds: Number.MIN_SAFE_INTEGER,
            milliseconds: Number.MIN_SAFE_INTEGER,
        },
        filter.earliestTimePart);
    const latestFilter = Object.assign(
        {
            hours: Number.MAX_SAFE_INTEGER,
            minutes: Number.MAX_SAFE_INTEGER,
            seconds: Number.MAX_SAFE_INTEGER,
            milliseconds: Number.MAX_SAFE_INTEGER,
        },
        filter.latestTimePart);
    
    if ((earlierTimePart.hours > latestFilter.hours) || (laterTimePart.hours < earliestFilter.hours)) {
        return false;
    }

    const hoursSpan = laterTimePart.hours - earlierTimePart.hours;
    let minutesSpan = laterTimePart.minutes - earlierTimePart.minutes;
    if (hoursSpan < 1) {
        // If the hours are the same then earlierTimePart.minutes <= laterTimePart.minutes
        if (earliestFilter.minutes > latestFilter.minutes) {
            // The valid minute range is earliest minutes to 60, then 0 to latest minutes.
            if ((earlierTimePart.minutes > latestFilter.minutes) && (earlierTimePart.minutes < earliestFilter.minutes)
             && (laterTimePart.minutes > latestFilter.minutes) && (laterTimePart.minutes < earliestFilter.minutes)) {
                return false;
            }
        }
        else {
            if ((earlierTimePart.minutes > latestFilter.minutes) || (laterTimePart.minutes < earliestFilter.minutes)) {
                return false;
            }
        }
    }
    else if (hoursSpan < 2) {
        // The minutes always cross 60 minutes.
        if (earliestFilter.minutes > latestFilter.minutes) {
            // Always valid since the filter crosses 60 minutes as well.
            return true;
        }
        else {
            if ((earlierTimePart.minutes > latestFilter.minutes) && (laterTimePart.minutes < earliestFilter.minutes)) {
                return false;
            }
        }
        minutesSpan += 60;
    }
    else {
        // 2 or more hours the minutes and seconds cover everything...
        return true;
    }


    let secondsSpan = laterTimePart.seconds - earlierTimePart.seconds;
    if (minutesSpan < 1) {
        // If the minutes are the same then earlierTimePart.seconds <= laterTimePart.seconds
        if (earliestFilter.seconds > latestFilter.seconds) {
            // The valid seconds range is earliest seconds to 60, then 0 to latest seconds.
            if ((earlierTimePart.seconds > latestFilter.seconds) && (earlierTimePart.seconds < earliestFilter.seconds)
             && (laterTimePart.seconds > latestFilter.seconds) && (laterTimePart.seconds < earliestFilter.seconds)) {
                return false;
            }
        }
        else {
            if ((earlierTimePart.seconds > latestFilter.seconds) || (laterTimePart.seconds < earliestFilter.seconds)) {
                return false;
            }
        }
    }
    else if (minutesSpan < 2) {
        // Seconds always cross 60 seconds.
        if (earliestFilter.seconds > latestFilter.seconds) {
            // Always valid since the filter crosses 60 seconds as well.
            return true;
        }
        else {
            if ((earlierTimePart.seconds > latestFilter.seconds) && (laterTimePart.seconds < earliestFilter.seconds)) {
                return false;
            }
        }
        secondsSpan += 60;
    }
    else {
        // 2 or more minutes the seconds and milliseconds are always covered...
        return true;
    }


    if (secondsSpan < 1) {
        // If the seconds are the same then earlierTimePart.milliseconds <= laterTimePart.milliseconds.
        if (earliestFilter.milliseconds > latestFilter.milliseconds) {
            // The valid milliseconds range is earliest ms to 1000, then 0 to latest ms.
            if ((earlierTimePart.milliseconds > latestFilter.milliseconds)
             && (earlierTimePart.milliseconds < earliestFilter.milliseconds)
             && (laterTimePart.milliseconds > latestFilter.milliseconds)
             && (laterTimePart.milliseconds < earliestFilter.milliseconds)) {
                return false;
            }
        }
        else {
            if ((earlierTimePart.milliseconds > latestFilter.milliseconds)
             || (laterTimePart.milliseconds < earliestFilter.milliseconds)) {
                return false;
            }
        }
    }
    else if (secondsSpan < 2) {
        // ms always cross 1000 ms.
        if (earliestFilter.milliseconds > latestFilter.milliseconds) {
            // Always valid...
            return true;
        }
        else {
            if ((earlierTimePart.milliseconds > latestFilter.milliseconds)
             && (laterTimePart.milliseconds < earliestFilter.milliseconds)) {
                return false;
            }
        }
    }

    return true;
}