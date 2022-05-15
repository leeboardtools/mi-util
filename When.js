import * as DP from '../util/DatePart';
import * as TP from '../util/TimePart';
import { userMsg } from '../util/UserMessages';


/**
 * @typedef {object} When
 * Describes a when, which consists of a reference date part, an optional number
 * of days if a duration, an optional start time in the start date, and an optional
 * milliseconds of time duration if a start time is specified.
 * @property {DatePart} startDatePart
 * @property {number} [daysDuration] Rounded to whole numbers &ge; 0.
 * @property {TimePart} [startTimePart] The start time part must have all components
 * non-negative and the hours &lt; 24.
 * @property {number} [millisecondsDuration] Rounded to whole numbers &ge; 0.
 */

/**
 * Clones a {@link When} object, only copying the When properties.
 * @param {When} when 
 * @returns {When}
 */
export function cloneWhen(when) {
    if (when) {
        const newWhen = {};
        if (typeof when.startDatePart === 'object') {
            newWhen.startDatePart = Object.assign({}, when.startDatePart);
        }
        if (typeof when.daysDuration === 'number') {
            newWhen.daysDuration = when.daysDuration;
        }

        if (typeof when.startTimePart === 'object') {
            newWhen.startTimePart = Object.assign({}, when.startTimePart);
        }
        if (typeof when.millisecondsDuration === 'number') {
            newWhen.millisecondsDuration = when.millisecondsDuration;
        }
        return newWhen;
    }
}



/**
 * Result returned by {@link getFinishParts}.
 * @typedef {object} getFinishParts-Result
 * @property {DatePart} finishDatePart The finish date, which is the later of
 * startDatePart plus daysDuration or startDaysPart with startTimePart plus 
 * millisecondsDuration.
 * @property {TimePart} [finishTimePart] Only present if startTimePart is specified,
 * this is the startTimePart plus millisecondsDuration if millisecondsDuration is
 * specified, otherwise it is startTimePart.
 */

/**
 * Retrieves the finish date and time parts of a {@link When}. A When only
 * has a finish time part if it also has a start time part.
 * <p>
 * Note that days duration of 0 and 1 are the same - they both result in the
 * finish date matching the start date.
 * @param {When} when 
 * @returns {getFinishParts-Result | undefined}
 */
export function getFinishParts(when) {
    if (!when) {
        return;
    }

    const { startDatePart, daysDuration, startTimePart, millisecondsDuration 
    } = when;

    let finishDatePart = Object.assign({}, startDatePart);
    if ((typeof daysDuration === 'number') && (daysDuration > 0)) {
        finishDatePart = DP.addDays(finishDatePart, daysDuration - 1);
    }

    let finishTimePart;
    if (startTimePart) {
        if ((typeof millisecondsDuration === 'number')
         && (millisecondsDuration > 0)) {
            finishTimePart = TP.cleanTimePart(Object.assign({}, startTimePart, {
                milliseconds: (startTimePart.milliseconds || 0) + millisecondsDuration,
            }));

            if (finishTimePart.hours >= 24) {
                // Need to reduce the time to <= 24 hours and adjust the finish date
                // if necessary.
                const timeDays = Math.floor(finishTimePart.hours / 24);
                finishTimePart.hours = Math.round(finishTimePart.hours - timeDays * 24);

                const finishDatePart2 = DP.addDays(startDatePart, timeDays);
                if (DP.compareDateParts(finishDatePart, finishDatePart2) < 0) {
                    finishDatePart = finishDatePart2;
                }
            }
        }
        else {
            finishTimePart = Object.assign({}, startTimePart);
        }
    }

    const result = {
        finishDatePart: finishDatePart,
    };
    if (finishTimePart) {
        result.finishTimePart = finishTimePart;
    }
    return result;
}


/**
 * Determines the {@link DatePart} at which a {@link When} ends.
 * @param {When} when
 * @returns {DatePart|undefined}
 */
export function getFinishDatePart(when) {
    const result = getFinishParts(when);
    return (result) ? result.finishDatePart : undefined;
}


/**
 * Determines the {@link TimePart} at which a {@link When} ends.
 * Whens that do not have a start time will return <code>undefined</code>.
 * @param {When} when
 * @returns {TimePart|undefined}
 */
export function getFinishTimePart(when) {
    const result = getFinishParts(when);
    return (result) ? result.finishTimePart : undefined;
}


/**
 * Compares the starts of two {@link When}. This presumes the Whens have
 * been cleaned with {@link cleanWhen}.
 * @param {When} a 
 * @param {When} b 
 * @returns {number} A value &lt; 0 if a starts earlier than b, a value
 * &gt; 0 if a starts after b, and a value of 0 if a starts at the same time
 * as b. If a When does not have a startTimePart property then it is
 * treated as starting at midnight of the startDatePart. An <code>undefined</code>
 * arg is treated as starting before a When.
 */
export function compareStarts(a, b) {
    if (a === b) {
        return 0;
    }
    if (!a) {
        return -1;
    }
    else if (!b) {
        return 1;
    }

    let result = DP.compareDateParts(a.startDatePart, b.startDatePart);
    if (result) {
        return result;
    }

    return TP.compareTimeParts(a.startTimePart, b.startTimePart);
}


/**
 * Compares the finishes of two {@link When}. This presumes the Whens have
 * been cleaned with {@link cleanWhen}.
 * @param {When} a 
 * @param {When} b 
 * @returns {number} A value &lt; 0 if a finishes earlier than b, a value
 * &gt; 0 if a finishes after b, and a value of 0 if a finishes at the same time
 * as b. If a When does not have a startTimePart property then it is
 * treated as starting at midnight of the startDatePart. An <code>undefined</code>
 * arg is treated as starting before a When.
 */
export function compareFinishes(a, b) {
    if (a === b) {
        return 0;
    }
    if (!a) {
        return -1;
    }
    else if (!b) {
        return 1;
    }

    const finishA = getFinishParts(a);
    const finishB = getFinishParts(b);

    let result = DP.compareDateParts(finishA.finishDatePart, finishB.finishDatePart);
    if (result) {
        return result;
    }

    return TP.compareTimeParts(finishA.finishTimePart, finishB.finishTimePart);
}


/**
 * Default values to use by {@link cleanWhen}.
 * @typedef {object} cleanWhen-options-defaults
 * @property {DatePart} [startDatePart]
 */

/**
 * Options for {@link cleanWhen}
 * @typedef {object} cleanWhen-options
 * @property {boolean} [addChangeMessages=false]
 * @property {cleanWhen-options-defaults} [defaults]
 */

/**
 * Object returned by {@link cleanWhen} if the addChangeMessages property
 * of the {@link cleanWhen-options} is truthy.
 * @typedef {object} cleanWhen-Result
 * @property {When} when
 * @property {string[]} changeMessages
 */

/**
 * Updates a {@link When} as necessary to make it
 * valid. If no changes when is returned unless options.addMessages is specified,
 * in which case the when property of the results will be the when arg.
 * @param {When} when 
 * @param {cleanWhen-options} [options]
 * @returns {cleanWhen-Result|When} {@link cleanWhen-Result} is
 * returned if options is specified with options.addChangeMessages truthy, otherwise the
 * cleaned when is returned.
 */
export function cleanWhen(when, options) {
    options = options || {};
    let { addMessages, defaults } = options;
    defaults = defaults || {};

    
    const messages = (addMessages) ? [] : undefined;
    let cleanWhen = when;
    if (when) {
        let startDatePart = DP.cleanDatePart(when.startDatePart);
        if (!startDatePart) {
            if (defaults.startDatePart) {
                startDatePart = DP.cleanDatePart(defaults.startDatePart);
            }
            else {
                startDatePart = DP.datePartFromDate(new Date());
            }

            if (messages) {
                messages.push(userMsg('When-startDatePart_missing',
                    DP.datePartToDate(startDatePart).toLocaleDateString()));
            }
        }
        else if (startDatePart !== when.startDatePart) {
            if (messages) {
                messages.push(userMsg('When-startDatePart_cleaned',
                    DP.datePartToDate(startDatePart).toLocaleDateString()));
            }
        }

        let { daysDuration } = when;
        if (typeof daysDuration === 'number') {
            if (daysDuration < 0) {
                if (messages) {
                    messages.push(userMsg('When-daysDuration_negative'));
                }
                daysDuration = 0;
            }
        }
        else if (daysDuration) {
            if (messages) {
                messages.push(userMsg('When-daysDuration_invalid'));
            }
            daysDuration = undefined;
        }

        let startTimePart = TP.cleanTimePart(when.startTimePart);
        if (startTimePart) {
            if (TP.isTimePart(when.startTimePart)) {
                if ((startTimePart.hours < 0) || (startTimePart.minutes < 0)
                || (startTimePart.seconds < 0) || (startTimePart.milliseconds < 0)) {
                    if (messages) {
                        messages.push(userMsg('When-startTime_invalid'));
                    }
                    startTimePart = undefined;
                }
                else if (startTimePart.hours >= 24) {
                    if (startTimePart === when.startTimePart) {
                        startTimePart = Object.assign({}, startTimePart);
                    }
    
                    // Ignore multiples of 24 hours.
                    const timeDaysDuration = Math.floor(startTimePart.hours / 24);
                    startTimePart.hours = startTimePart.hours - timeDaysDuration * 24;
                    if (messages) {
                        messages.push(userMsg('When-startTime_exceeds_24hrs',
                            TP.timePartToString(startTimePart, 'no-ms')));
                    }
                }
                else if (startTimePart !== when.startTimePart) {
                    if (messages) {
                        messages.push(userMsg('When-startTime_cleaned',
                            TP.timePartToString(startTimePart, 'no-ms')));
                    }
                }
            }
            else {
                // If when.startTimePart is not a time part then we don't want
                // the cleaned time part, since that will be 00:00:00.0
                if (messages) {
                    messages.push(userMsg('When-startTime_invalid'));
                }
                startTimePart = undefined;
            }
        }

        let { millisecondsDuration } = when;
        if (typeof millisecondsDuration === 'number') {
            if (millisecondsDuration < 0) {
                if (messages && startTimePart) {
                    messages.push(userMsg('When-millisecondsDuration_invalid'));
                }
                millisecondsDuration = undefined;
            }
            else if (startTimePart && (typeof daysDuration === 'number')
             && (millisecondsDuration > TP.MILLISECONDS_PER_DAY)) {
                // Check the final time/date against the final date.
                const finalMilliseconds = TP.timePartTo_ms(startTimePart) + millisecondsDuration;
                const timeDaysDuration = Math.floor(finalMilliseconds / TP.MILLISECONDS_PER_DAY);
                if (timeDaysDuration > daysDuration) {
                    if (messages) {
                        messages.push(userMsg('When-millisecondsDuration_exceeds_daysDuration',
                            timeDaysDuration));
                    }
                    daysDuration = undefined;
                }
            }
        }
        else if (millisecondsDuration) {
            if (messages && startTimePart) {
                messages.push(userMsg('When-millisecondsDuration_invalid'));
            }
            millisecondsDuration = undefined;
        }


        let isChanged = (startDatePart !== when.startDatePart)
            || (daysDuration !== when.daysDuration)
            || (startTimePart !== when.startTimePart)
            || (millisecondsDuration !== when.millisecondsDuration);
        if (isChanged) {
            cleanWhen = cloneWhen({
                startDatePart: startDatePart,
                daysDuration: daysDuration,
                startTimePart: startTimePart,
                millisecondsDuration: millisecondsDuration,
            });
        }
    }

    if (!messages) {
        return cleanWhen;
    }
    return {
        when: cleanWhen,
        changeMessages: messages,
    };
}

