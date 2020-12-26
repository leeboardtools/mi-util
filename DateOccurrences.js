import { getYMDDate, getYMDDateString, YMDDate, 
    getMonthNthDayOfWeek, getYearNthDayOfWeek, getYMDDateWithDOM } from './YMDDate';
import { userError } from './UserMessages';


/**
 * @typedef {object} OccurrenceTypeDef
 * @property {string} name
 * @property {boolean} [hasOffset = undefined]
 * @property {boolean} [hasDayOfWeek = undefined]
 * @property {boolean} [isFromEnd = undefined]
 * @property {boolean} [hasSpecificMonth = undefined]
 */

/**
 * The types of specifying date occurances.
 * @readonly
 * @enum {OccurrenceTypeDef}
 * @property {OccurrenceTypeDef} DAY_OF_WEEK Date specified by the day of the week. 
 * The dayOfWeek property of {@link DateOccurrenceDefinition} is used.
 * Only the NO_REPEAT and WEEKLY repeat types are supported.
 * @property {OccurrenceTypeDef} DAY_OF_MONTH Date specifed by the day of the month.
 * The offset property of {@link DateOccurrenceDefinition} is the offset of the day
 * from the first day of the month (offset 0 is the first day of the month). If the offset
 * would result in a day beyond the end of the month the last day of the month is used.
 * Only the NO_REPEAT, MONTHLY, and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DAY_END_OF_MONTH Date specifed by the number of days
 * from the last day of the month. The offset property of 
 * {@link DateOccurrenceDefinition} is the offset of the day from the last day of
 * the month (offset 0 is the last day of the month). If the offset would result in a day
 * before the first day of the month the first day of the month is used.
 * Only the NO_REPEAT, MONTHLY, and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DOW_OF_MONTH Date specifed as the n'th occurrence of
 * a day of the week in the month (i.e. the 2nd Sunday). The offset and dayOfWeek
 * properties of {@link DateOccurrenceDefinition} are used. The selected date is NOT
 * restricted to fall in the month.
 * Only the NO_REPEAT, MONTHLY, and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DOW_END_OF_MONTH Date specifed as the n'th occurrence 
 * back of a day of the week from the last day of the month (i.e. the second to last 
 * Sunday). The offset and dayOfWeek properties of {@link DateOccurrenceDefinition} 
 * are used. The selected date is NOT restricted to fall in the month.
 * Only the NO_REPEAT, MONTHLY, and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DAY_OF_SPECIFIC_MONTH Date specified in a specific
 * month. The offset and month properties of {@link DateOccurrenceDefinition} are used. 
 * The offset property is the offset from the first day of the specified month (offset
 * 0 is the first day of the month). If the offset would result in a day beyond the end 
 * of the month the last day of the month is used.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DAY_END_OF_SPECIFIC_MONTH Date specified from the end
 * of a specific month. The offset and month properties of 
 * {@link DateOccurrenceDefinition} are used. The offset property is the offset from 
 * the last day of the specified month (offset 0 is the last day of the month). 
 * If the offset would result in a day before the first day of the month then the
 * first day of the month is used.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DOW_OF_SPECIFIC_MONTH Date specified as the n'th 
 * occurrence of a day of the week in a specified month. The offset, dayOfWeek, and
 * month properties of {@link DateOccurrenceDefinition} are used. The selected date
 * is NOT restricted to fall in the month.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DOW_END_OF_SPECIFIC_MONTH Date specified as the n'th 
 * occurrence back of a day of the week from the end of a specified month. The offset, 
 * dayOfWeek, and month properties of {@link DateOccurrenceDefinition} are used. 
 * The selected date is NOT restricted to fall in the month.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DAY_OF_YEAR Date specified as an offset from the
 * first day of the year. The offset property of {@link DateOccurrenceDefinition} is
 * used. Offset of 0 is January 1 of the year.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DAY_END_OF_YEAR Date specified as an offset from the
 * last day of the year. The offset property of {@link DateOccurrenceDefinition} is
 * used. Offset of 0 is December 31 of the year.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DOW_OF_YEAR Date specified as the n'th occurrence of
 * a day of the week from January 1. January 1 is the first occurrence of whatever
 * day of the week it falls on. The offset and dayOfWeek properties of
 * {@link DateOccurrenceDefinition} are used.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 * @property {OccurrenceTypeDef} DOW_END_OF_YEAR Date specified as the n'th occurrence of
 * a day of the week before December 31. December 31 is the first occurrence of whatever
 * day of the week it falls on. The offset and dayOfWeek properties of
 * {@link DateOccurrenceDefinition} are used.
 * Only the NO_REPEAT and YEARLY repeat types are supported.
 */
export const OccurrenceType = {
    DAY_OF_WEEK: { name: 'DAY_OF_WEEK',
        hasDayOfWeek: true,
        offsetMin: 0,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'WEEKLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-weekType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DAY_OF_WEEK,
    },
    DAY_OF_MONTH: { name: 'DAY_OF_MONTH',
        hasOffset: true,
        offsetMin: 0,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'MONTHLY',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-monthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DAY_OF_MONTH,
    },
    DAY_END_OF_MONTH: { name: 'DAY_END_OF_MONTH',
        hasOffset: true,
        offsetMin: 0,
        isFromEnd: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'MONTHLY',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-monthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DAY_END_OF_MONTH,
    },
    DOW_OF_MONTH: { name: 'DOW_OF_MONTH',
        hasOffset: true,
        offsetMin: 1,
        hasDayOfWeek: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'MONTHLY',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-monthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DOW_OF_MONTH,
    },
    DOW_END_OF_MONTH: { name: 'DOW_END_OF_MONTH',
        hasOffset: true,
        offsetMin: 1,
        hasDayOfWeek: true,
        isFromEnd: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'MONTHLY',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-monthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DOW_END_OF_MONTH,
    },
    DAY_OF_SPECIFIC_MONTH: { name: 'DAY_OF_SPECIFIC_MONTH',
        hasOffset: true,
        offsetMin: 0,
        hasSpecificMonth: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-specificMonthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DAY_OF_SPECIFIC_MONTH,
    },
    DAY_END_OF_SPECIFIC_MONTH: { name: 'DAY_END_OF_SPECIFIC_MONTH',
        hasOffset: true,
        offsetMin: 0,
        isFromEnd: true,
        hasSpecificMonth: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-specificMonthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DAY_END_OF_SPECIFIC_MONTH,
    },
    DOW_OF_SPECIFIC_MONTH: { name: 'DOW_OF_SPECIFIC_MONTH',
        hasOffset: true,
        offsetMin: 1,
        hasDayOfWeek: true,
        hasSpecificMonth: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-specificMonthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DOW_OF_SPECIFIC_MONTH,
    },
    DOW_END_OF_SPECIFIC_MONTH: { name: 'DOW_END_OF_SPECIFIC_MONTH',
        hasOffset: true,
        offsetMin: 1,
        hasDayOfWeek: true,
        isFromEnd: true,
        hasSpecificMonth: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-specificMonthType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DOW_END_OF_SPECIFIC_MONTH,
    },
    DAY_OF_YEAR: { name: 'DAY_OF_YEAR',
        hasOffset: true,
        offsetMin: 0,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        invalidRepeatTypesId: 'DateOccurrences-yearType_invalidRepeatType',
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DAY_OF_YEAR,
    },
    DAY_END_OF_YEAR: { name: 'DAY_END_OF_YEAR',
        hasOffset: true,
        offsetMin: 0,
        isFromEnd: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DAY_END_OF_YEAR,
    },
    DOW_OF_YEAR: { name: 'DOW_OF_YEAR',
        hasOffset: true,
        offsetMin: 1,
        hasDayOfWeek: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DOW_OF_YEAR,
    },
    DOW_END_OF_YEAR: { name: 'DOW_END_OF_YEAR',
        hasOffset: true,
        offsetMin: 1,
        hasDayOfWeek: true,
        isFromEnd: true,
        allowedRepeatTypes: [
            'NO_REPEAT',
            'YEARLY',
        ],
        validate: validateGeneralOccurrenceType,
        getNextYMDDate: getNextYMDDate_DOW_END_OF_YEAR,
    },
};

/**
 * 
 * @param {*} type 
 * @returns {OccurrenceType|*}
 */
export function getOccurrenceType(type) {
    return (typeof type === 'string')
        ? OccurrenceType[type]
        : type;
}

/**
 * 
 * @param {*} type 
 * @returns {string|*}
 */
export function getOccurrenceTypeString(type) {
    return (typeof type === 'object')
        ? type.name
        : type;
}

function validateGeneralOccurrenceType(definition, occurrenceType) {
    if (occurrenceType.hasOffset) {
        const { offset } = definition;
        const offsetMin = occurrenceType.offsetMin || 0;
        if ((typeof offset !== 'number')
         || (offset < offsetMin)) {
            return userError('DateOccurrences-definition_offset_invalid', offsetMin);
        }
    }

    if (occurrenceType.hasDayOfWeek) {
        const { dayOfWeek } = definition;
        if ((typeof dayOfWeek !== 'number')
         || (dayOfWeek < 0) || (dayOfWeek >= 7)) {
            return userError('DateOccurrences-definition_dayOfWeek_invalid');
        }
    }

    if (occurrenceType.hasSpecificMonth) {
        const { month } = definition;
        if ((typeof month !== 'number')
         || (month < 0) || (month >= 12)) {
            return userError('DateOccurrences-definition_month_invalid');
        }
    }

    const { repeatDefinition } = definition;
    const { allowedRepeatTypes } = occurrenceType;
    if (allowedRepeatTypes && repeatDefinition) {
        const { repeatType } = repeatDefinition;
        let isFound;
        for (let i = 0; i < allowedRepeatTypes.length; ++i) {
            if (allowedRepeatTypes[i] === repeatType.name) {
                isFound = true;
            }
        }

        if (!isFound) {
            return userError(definition.invalidRepeatTypesId);
        }
    }
}


/**
 * @typedef {object} OccurrenceRepeatTypeDef
 * @property {string} name
 */

/**
 * The types of specifying repeat frequency.
 * @readonly
 * @enum {OccurrenceRepeatTypeDef}
 * @property {OccurrenceRepeatTypeDef} NO_REPEAT
 * @property {OccurrenceRepeatTypeDef} DAILY
 * @property {OccurrenceRepeatTypeDef} WEEKLY
 * @property {OccurrenceRepeatTypeDef} MONTHLY
 * @property {OccurrenceRepeatTypeDef} YEARLY
 */
export const OccurrenceRepeatType = {
    NO_REPEAT: { name: 'NO_REPEAT',
        validate: validateRepeatType_NO_REPEAT,
        getNextRepeatYMDDate: () => {},
    },
    DAILY: { name: 'DAILY', 
        validate: validateRepeatType_hasPeriod,
        getNextRepeatYMDDate: (repeatDefinition, refYMDDate) => 
            refYMDDate.addDays(repeatDefinition.period),
    },
    WEEKLY: { name: 'WEEKLY', 
        validate: validateRepeatType_hasPeriod,
        getNextRepeatYMDDate: (repeatDefinition, refYMDDate) => 
            refYMDDate.addDays(repeatDefinition.period * 7),
    },
    MONTHLY: { name: 'MONTHLY', 
        validate: validateRepeatType_hasPeriod,
        getNextRepeatYMDDate: (repeatDefinition, refYMDDate) => 
            refYMDDate.addMonths(repeatDefinition.period),
    },
    YEARLY: { name: 'YEARLY', 
        validate: validateRepeatType_hasPeriod,
        getNextRepeatYMDDate: (repeatDefinition, refYMDDate) => 
            refYMDDate.addYears(repeatDefinition.period),
    },
};

function validateRepeatType_NO_REPEAT(repeatDefinition) {
    // Always valid...
}

function validateRepeatType_hasPeriod(repeatDefinition) {
    const { period } = repeatDefinition;
    if ((typeof period !== 'number')
     || (period < 0)) {
        return userError('DateOccurrences-repeatDefinition_period_required');
    }

    const { finalYMDDate } = repeatDefinition;
    if (finalYMDDate) {
        if (!YMDDate.isValidDate(getYMDDate(finalYMDDate))) {
            return userError('DateOccurrences-repeatDefinition_finalYMDDate_invalid');
        }
    }

    const { maxRepeats } = repeatDefinition;
    if (maxRepeats !== undefined) {
        if ((typeof maxRepeats !== 'number')
         || (maxRepeats < 0)) {
            return userError('DateOccurrences-repeatDefinition_maxRepeats_invalid');
        }
    }
}



/**
 * 
 * @param {*} type 
 * @returns {OccurrenceRepeatType|*}
 */
export function getOccurrenceRepeatType(type) {
    return (typeof type === 'string')
        ? OccurrenceRepeatType[type]
        : type;
}

/**
 * 
 * @param {*} type 
 * @returns {string|*}
 */
export function getOccurrenceRepeatTypeString(type) {
    return (typeof type === 'object')
        ? type.name
        : type;
}


/**
 * @typedef {object} OccurrenceRepeatDefinition
 * @property {OccurrenceRepeatType} repeatType
 * @property {number} [period]
 * @property {YMDDate} [finalYMDDate] If specified the occurrence is not to
 * be repeated after this date.
 * @property {number} [maxRepeats] If specified the occurrence is not to be
 * repeated more than this many times. maxRepeats = 0 means the occurrence is
 * to happen only once and not be repeated.
 */

/**
 * @typedef {object} OccurrenceRepeatDefinitionDataItem
 * @property {string} repeatType
 * @property {number} [period]
 * @property {string} [finalYMDDate] If specified the occurrence is not to
 * be repeated after this date.
 * @property {number} [maxRepeats] If specified the occurrence is not to be
 * repeated more than this many times. maxRepeats = 0 means the occurrence is
 * to happen only once and not be repeated.
 */

/**
 * 
 * @param {*} definition 
 * @param {boolean} [alwaysCopy]
 * @returns {OccurrenceRepeatDefinition}
 */
export function getOccurrenceRepeatDefinition(definition, alwaysCopy) {
    if (definition) {
        const repeatType = getOccurrenceRepeatType(definition.repeatType);
        const finalYMDDate = getYMDDate(definition.finalYMDDate);
        if (alwaysCopy
         || (repeatType !== definition.repeatType)
         || (finalYMDDate !== definition.finalYMDDate)) {
            definition = Object.assign({}, definition);
            if (repeatType !== undefined) {
                definition.repeatType = repeatType;
            }
            if (finalYMDDate !== undefined) {
                definition.finalYMDDate = finalYMDDate;
            }
        }
    }
    return definition;
}

/**
 * 
 * @param {*} definition 
 * @param {boolean} [alwaysCopy]
 * @returns {OccurrenceRepeatDefinitionDataItem}
 */
export function getOccurrenceRepeatDefinitionDataItem(definition, alwaysCopy) {
    if (definition) {
        const repeatType = getOccurrenceRepeatTypeString(definition.repeatType);
        const finalYMDDate = getYMDDateString(definition.finalYMDDate);
        if (alwaysCopy
         || (repeatType !== definition.repeatType)
         || (finalYMDDate !== definition.finalYMDDate)) {
            definition = Object.assign({}, definition);
            if (repeatType !== undefined) {
                definition.repeatType = repeatType;
            }
            if (finalYMDDate !== undefined) {
                definition.finalYMDDate = finalYMDDate;
            }
        }
    }
    return definition;
}


/**
 * Validates a repeat definition.
 * @param {OccurrenceRepeatDefinition|OccurrenceRepeatDefinition} 
 *      repeatDefinition 
 * @returns {undefined|Error} <code>undefined</code> is returned if repeatDefinition
 * is valid.
 */
export function validateOccurrenceRepeatDefinition(repeatDefinition) {
    const repeatType = getOccurrenceRepeatType(repeatDefinition.repeatType);
    if (!repeatType || !repeatType.validate) {
        return userError('DateOccurrences-repeatType_invalid');
    }
    return repeatType.validate(repeatDefinition);
}


/**
 * 
 * @param {OccurrenceRepeatDefinition|OccurrenceRepeatDefinition} 
 *      repeatDefinition 
 * @param {YMDDate|string} refYMDDate The reference date, the next repeating date after
 * this date is returned.
 * @param {number} occurrenceCount The number of occurrences so far.
 * @returns {YMDDate|undefined} <code>undefined</code> is returned if the
 * new date is after the final date of the definition, if any, or if 
 * occurrenceCount is greater than the maxRepeats in the definition.
 */
export function getNextRepeatDefinitionYMDDate(repeatDefinition, refYMDDate, 
    occurrenceCount) {

    refYMDDate = getYMDDate(refYMDDate);

    if (!occurrenceCount) {
        return refYMDDate;
    }

    repeatDefinition = getOccurrenceRepeatDefinition(repeatDefinition);
    if (!repeatDefinition
     || (repeatDefinition.repeatType === OccurrenceRepeatType.NO_REPEAT)) {
        return undefined;
    }

    const repeatType = getOccurrenceRepeatType(repeatDefinition.repeatType);
    if (!repeatType || !repeatType.getNextRepeatYMDDate) {
        throw userError('DateOccurrences-repeatType_invalid');
    }

    const { maxRepeats } = repeatDefinition;
    if ((occurrenceCount !== undefined) && (maxRepeats !== undefined)) {
        if (occurrenceCount >= maxRepeats) {
            // All done.
            return undefined;
        }
    }

    let ymdDate = repeatType.getNextRepeatYMDDate(repeatDefinition, refYMDDate);
    if (ymdDate) {
        const { finalYMDDate } = repeatDefinition;
        if (finalYMDDate) {
            if (YMDDate.compare(ymdDate, finalYMDDate) > 0) {
                // All done.
                return undefined;
            }
        }
    }

    return ymdDate;
}



//
//---------------------------------------------------------
//
function isRepeatDefinitionRepeat(repeatDefinition) {
    if (repeatDefinition
     && (repeatDefinition.repeatType !== OccurrenceRepeatType.NO_REPEAT)) {
        return true;
    }
}

//
//---------------------------------------------------------
//
function getNextYMDDate_DAY_OF_WEEK(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the week.
    const { dayOfWeek, repeatDefinition } = definition;

    const refDayOfWeek = refYMDDate.getDayOfWeek();
    if (refDayOfWeek !== dayOfWeek) {
        let deltaDays = dayOfWeek - refDayOfWeek;
        if (deltaDays < 0) {
            if (!isRepeatDefinitionRepeat(repeatDefinition)) {
                // If we have a repeat we want the next valid date after
                // the repeat, so we go backwards.
                deltaDays += 7;
            }
        }
        refYMDDate = refYMDDate.addDays(deltaDays);
    }

    return getNextRepeatDefinitionYMDDate(repeatDefinition, refYMDDate, occurrenceCount);
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DAY_OF_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const refOffset = refYMDDate.getDOM() - 1;
        if (refOffset > offset) {
            refYMDDate = refYMDDate.addDays(offset - refOffset);
            // If we're not a repeat, we need to advance to the following month
            // since we need to be after the original refYMDDate...
            if (!isRepeat) {
                refYMDDate = refYMDDate.addMonths(1);
            }
        }
        else if (refOffset < offset) {
            // We need to make sure we don't go beyond the last date.
            let newDOM = offset + 1;
            const lastDOM = refYMDDate.getLastDateOfMonth();
            if (newDOM > lastDOM) {
                newDOM = lastDOM;
            }
            refYMDDate = refYMDDate.addDays(newDOM - refYMDDate.getDOM());
        }
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DAY_END_OF_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const lastDOM = refYMDDate.getLastDateOfMonth();
        const newDOM = Math.max(lastDOM - offset, 1);
        const currentDOM = refYMDDate.getDOM();

        refYMDDate = new YMDDate(refYMDDate.getFullYear(), refYMDDate.getMonth(),
            newDOM);
        if ((newDOM < currentDOM) && !isRepeat) {
            // The offset is before the original refYMDDate, we need to be on or after
            // the original refYMDDate...
            refYMDDate = refYMDDate.addMonths(1);
        }
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DOW_OF_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, dayOfWeek, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = getMonthNthDayOfWeek(refYMDDate, offset, dayOfWeek);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a month.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addMonths(1);
                refYMDDate = getMonthNthDayOfWeek(refYMDDate, offset, dayOfWeek);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DOW_END_OF_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, dayOfWeek, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = getMonthNthDayOfWeek(refYMDDate, -offset, dayOfWeek);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a month.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addMonths(1);
                refYMDDate = getMonthNthDayOfWeek(refYMDDate, -offset, dayOfWeek);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DAY_OF_SPECIFIC_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, month, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = new YMDDate(refYMDDate.getFullYear(), month, 1);
        refYMDDate = getYMDDateWithDOM(refYMDDate, offset + 1);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addYears(1);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DAY_END_OF_SPECIFIC_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, month, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = new YMDDate(refYMDDate.getFullYear(), month, 1);
        refYMDDate = getYMDDateWithDOM(refYMDDate, 
            refYMDDate.getLastDateOfMonth() - offset);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addYears(1);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DOW_OF_SPECIFIC_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, dayOfWeek, month, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = new YMDDate(refYMDDate.getFullYear(), month, 1);
        refYMDDate = getMonthNthDayOfWeek(refYMDDate, offset, dayOfWeek);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addYears(1);
                refYMDDate = getMonthNthDayOfWeek(refYMDDate, offset, dayOfWeek);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DOW_END_OF_SPECIFIC_MONTH(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, dayOfWeek, month, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = new YMDDate(refYMDDate.getFullYear(), month, 1);
        refYMDDate = getMonthNthDayOfWeek(refYMDDate, -offset, dayOfWeek);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addYears(1);
                refYMDDate = getMonthNthDayOfWeek(refYMDDate, -offset, dayOfWeek);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DAY_OF_YEAR(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = new YMDDate(refYMDDate.getFullYear(), 0, 1);
        refYMDDate = refYMDDate.addDays(offset);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = new YMDDate(refYMDDate.getFullYear() + 1, 0, 1);
                refYMDDate = refYMDDate.addDays(offset);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DAY_END_OF_YEAR(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = new YMDDate(refYMDDate.getFullYear(), 11, 31);
        refYMDDate = refYMDDate.addDays(-offset);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = new YMDDate(refYMDDate.getFullYear() + 1, 11, 31);
                refYMDDate = refYMDDate.addDays(-offset);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DOW_OF_YEAR(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, dayOfWeek, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = getYearNthDayOfWeek(refYMDDate, offset, dayOfWeek);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addYears(1);
                refYMDDate = getYearNthDayOfWeek(refYMDDate, offset, dayOfWeek);
            }
        }        
    }

    return refYMDDate;
}


//
//---------------------------------------------------------
//
function getNextYMDDate_DOW_END_OF_YEAR(definition, occurrenceType, 
    refYMDDate, occurrenceCount) {

    // Adjust refYMDDate to satisfy the day of the month.
    const { offset, dayOfWeek, repeatDefinition } = definition;

    const isRepeat = isRepeatDefinitionRepeat(repeatDefinition);

    // We want to advance to the date as-is so we get the appropriate month.
    refYMDDate = getNextRepeatDefinitionYMDDate(repeatDefinition, 
        refYMDDate, occurrenceCount);

    if (refYMDDate) {
        const originalYMDDate = refYMDDate;
        refYMDDate = getYearNthDayOfWeek(refYMDDate, -offset, dayOfWeek);
        if (!isRepeat) {
            // If the new date is before the original one we need to advance a year.
            if (YMDDate.compare(originalYMDDate, refYMDDate) > 0) {
                refYMDDate = refYMDDate.addYears(1);
                refYMDDate = getYearNthDayOfWeek(refYMDDate, -offset, dayOfWeek);
            }
        }        
    }

    return refYMDDate;
}


/**
 * @typedef {object} DateOccurrenceDefinition
 * @property {OccurrenceType} occurrenceType
 * @property {number} offset
 * @property {number} [dayOfWeek] 0 - Sunday, 1 - Monday...
 * @property {number} [month] 0 based month
 * @property {OccurrenceRepeatDefinition} [repeatDefinition]
 */

/**
 * @typedef {object} DateOccurrenceDefinitionDataItem
 * @property {string} occurrenceType
 * @property {number} offset
 * @property {number} [dayOfWeek] 0 - Sunday, 1 - Monday...
 * @property {number} [month] 0 based month
 * @property {OccurrenceRepeatDefinitionDataItem} [repeatDefinition]
 */

/**
 * 
 * @param {*} definition 
 * @param {boolean} [alwaysCopy]
 * @returns {DateOccurrenceDefinition}
 */
export function getDateOccurrenceDefinition(definition, alwaysCopy) {
    if (definition) {
        const occurrenceType = getOccurrenceType(definition.occurrenceType);
        const repeatDefinition = getOccurrenceRepeatDefinition(
            definition.repeatDefinition);
        if (alwaysCopy
         || (occurrenceType !== definition.occurrenceType)
         || (repeatDefinition !== definition.repeatDefinition)) {
            definition = Object.assign({}, definition);
            if (occurrenceType !== undefined) {
                definition.occurrenceType = occurrenceType;
            }
            if (repeatDefinition !== undefined) {
                definition.repeatDefinition = repeatDefinition;
            }
        }
    }
    return definition;
}

/**
 * 
 * @param {*} definition 
 * @param {boolean} [alwaysCopy]
 * @returns {DateOccurrenceDefinitionDataItem}
 */
export function getDateOccurrenceDefinitionDataItem(definition, alwaysCopy) {
    if (definition) {
        const occurrenceType = getOccurrenceTypeString(definition.occurrenceType);
        const repeatDefinition = getOccurrenceRepeatDefinitionDataItem(
            definition.repeatDefinition);
        if (alwaysCopy
         || (occurrenceType !== definition.occurrenceType)
         || (repeatDefinition !== definition.repeatDefinition)) {
            definition = Object.assign({}, definition);
            if (occurrenceType !== undefined) {
                definition.occurrenceType = occurrenceType;
            }
            if (repeatDefinition !== undefined) {
                definition.repeatDefinition = repeatDefinition;
            }
        }
    }
    return definition;
}


/**
 * Determines if an occurrence definition is valid.
 * @param {DateOccurrenceDefinition|DateOccurrenceDefinitionDataItem} definition 
 * @returns {undefined|Error} <code>undefined</code> is returned if definition
 * is valid.
 */
export function validateDateOccurrenceDefinition(definition) {
    definition = getDateOccurrenceDefinition(definition);
    const occurrenceType = getOccurrenceType(definition.occurrenceType);
    if (!occurrenceType || !occurrenceType.validate) {
        return userError('DateOccurrences-occurrenceType_invalid');
    }

    let result = occurrenceType.validate(definition, occurrenceType);
    if (!result) {
        const repeatDefinition = getOccurrenceRepeatDefinition(
            definition.repeatDefinition);
        if (repeatDefinition) {
            result = validateOccurrenceRepeatDefinition(repeatDefinition);
        }
    }

    return result;
}


/**
 * @typedef {object} DateOccurrenceState
 * This is used to keep track of when and how often an occurrence definition has occurred.
 * @property {YMDDate} [lastOccurrenceYMDDate]
 * @property {number} [occurrenceCount = 0]
 * @property {boolean} [occurrencesAllDone] This is <code>true</code> by
 * {@link getNextDateOccurrenceState} if all the occurrences have been used up.
 */


/**
 * @typedef {object} DateOccurrenceStateDataItem
 * This is used to keep track of when and how often an occurrence definition has occurred.
 * @property {string} [lastOccurrenceYMDDate]
 * @property {number} [occurrenceCount = 0]
 * @property {boolean} [occurrencesAllDone] This is <code>true</code> by
 * {@link getNextDateOccurrenceState} if all the occurrences have been used up.
 */

/**
 * 
 * @param {*} state 
 * @param {boolean} alwaysCopy 
 * @returns {DateOccurrenceState}
 */
export function getDateOccurrenceState(state, alwaysCopy) {
    if (state) {
        const lastOccurrenceYMDDate = getYMDDate(state.lastOccurrenceYMDDate);
        if (alwaysCopy || (lastOccurrenceYMDDate !== state.lastOccurrenceYMDDate)) {
            state = Object.assign({}, state);
            if (lastOccurrenceYMDDate !== undefined) {
                state.lastOccurrenceYMDDate = lastOccurrenceYMDDate;
            }
        }
    }
    return state;
}

/**
 * 
 * @param {*} state 
 * @param {boolean} alwaysCopy 
 * @returns {DateOccurrenceStateDataItem}
 */
export function getDateOccurrenceStateDataItem(state, alwaysCopy) {
    if (state) {
        const lastOccurrenceYMDDate = getYMDDateString(state.lastOccurrenceYMDDate);
        if (alwaysCopy || (lastOccurrenceYMDDate !== state.lastOccurrenceYMDDate)) {
            state = Object.assign({}, state);
            if (lastOccurrenceYMDDate !== undefined) {
                state.lastOccurrenceYMDDate = lastOccurrenceYMDDate;
            }
        }
    }
    return state;
}


/**
 * Determines the next {@link YMDDate} at which a occurrence is to occur, if it is
 * to occur.
 * <p>
 * The general behavior depends upon whether or not the occurrence definition is set
 * to repeat (the repeatDefinition property is defined and the repeatType is not
 * OccurrenceRepeatType.NO_REPEAT).
 * <p>
 * First off, a reference {@link YMDDate} is obtained from 
 * state.lastOccurrenceYMDDate if both state and lastOccurrenceYMDDate are defined,
 * otherwise the reference date is set to 'today'.
 * <p>
 * If the occurrence definition is not set to repeat, or if state is defined and
 * state.occurrenceCount is 0 or not defined, then the reference date is adjusted
 * to match the occurrence definition. If the adjusted date would be before
 * the reference date it is advanced to the next week/month/year as determined
 * by the occurrence type.
 * <p>
 * If the occurrence definition is set to repeat and state.occurrenceCount is greater
 * than 0, then the reference date is first advanced according to the repeat 
 * definition. After being advanced it is then adjusted to match the occurrence 
 * definition.
 * <p>
 * Note that if it is not set to repeat and state.occurrenceCount is > 0 then all
 * occurrences are done and the occurrencesAllDone property is set on the returned state.
 * <p>
 * If lastState is not defined or does not have a lastOccurrenceYMDDate property,
 * today's date is used.
 * @param {DateOccurrenceDefinition|DateOccurrenceDefinitionDataItem} definition 
 * @param {DateOccurrenceState|DateOccurrenceStateDataItem} lastState 
 * @returns {DateOccurrenceState} The occurrencesAllDone property is set to
 * <code>true</code> if all occurrences have been performed.
 */
export function getNextDateOccurrenceState(definition, lastState) {
    definition = getDateOccurrenceDefinition(definition);

    let refYMDDate;
    let refOccurrenceCount = 0;
    if (lastState) {
        // Check lastState to make sure we're not already done...
        lastState = getDateOccurrenceState(lastState, true);
        if (lastState.occurrencesAllDone) {
            return lastState;
        }

        const { lastOccurrenceYMDDate, occurrenceCount } = lastState;
        refYMDDate = lastOccurrenceYMDDate;
        if (occurrenceCount !== undefined) {
            refOccurrenceCount = occurrenceCount;
        }
    }

    refYMDDate = getYMDDate(refYMDDate) || new YMDDate();

    const { occurrenceType } = definition;
    const nextYMDDate = occurrenceType.getNextYMDDate(definition, occurrenceType, 
        refYMDDate, refOccurrenceCount);
    if (!nextYMDDate) {
        // All done...
        lastState.occurrencesAllDone = true;
        return lastState;
    }

    return {
        lastOccurrenceYMDDate: nextYMDDate,
        occurrenceCount: refOccurrenceCount + 1,
        occurrencesAllDone: false,
    };
}