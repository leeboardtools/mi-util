/**
 * @typedef {object} CalendarInfoNames
 * Holds the month and weekday names of a given style.
 * @property {string[]} monthNames Array of the names of the month, monthNames[0] is January
 * @property {string[]} weekdayNames Array of the names of the days of the week,
 * weekdayNames[0] is Sunday, weekdayNames[1] is Monday.
 */

/**
 * @typedef {object} CalendarInfo
 * Holds the different styles of the calendar info names.
 * <p>
 * The styles correspond to the 'long', 'short', and 'narrow' 
 * weekday and month options of Intl.DateTimeFormat()'s constructor.
 * @property {CalendarInfoNames} longNames The long form names, 'January', 'Sunday'
 * @property {CalendarInfoNames} shortNames The short form names, 'Jan', 'Sun'
 * @property {CalendarInfoNames} narrowNames The narrow form names, 'J', 'S'
 */


function generateInfoNames(locale, style) {
    const format = new Intl.DateTimeFormat(locale, {
        weekday: style,
        month: style,
    });

    const result = {
        monthNames: [],
        weekdayNames: [],
    };

    for (let i = 0; i < 12; ++i) {
        const parts = format.formatToParts(new Date(2022, i, 1));
        for (let j = parts.length - 1; j >= 0; --j) {
            if (parts[j].type === 'month') {
                result.monthNames[i] = parts[j].value;
                break;
            }
        }
    }

    for (let i = 0; i < 7; ++i) {
        const parts = format.formatToParts(new Date(2022, 3, 17 + i));
        for (let j = parts.length - 1; j >= 0; --j) {
            if (parts[j].type === 'weekday') {
                result.weekdayNames[i] = parts[j].value;
                break;
            }
        }
    }

    return result;
}

function createCalendarInfo(locale) {
    return {
        longNames: generateInfoNames(locale, 'long'),
        shortNames: generateInfoNames(locale, 'short'),
        narrowNames: generateInfoNames(locale, 'narrow'),
    };
}


/**
 * Creates a clone of a {@link CalendarInfoNames}, only the properties of
 * CalendarInfoNames are copied.
 * @param {CalendarInfoNames} infoNames 
 * @returns {CalendarInfoNames}
 */
export function cloneCalendarInfoNames(infoNames) {
    if (infoNames) {
        const newInfoNames = {};
        if (infoNames.monthNames) {
            newInfoNames.monthNames = Array.from(infoNames.monthNames);
        }
        if (infoNames.weekdayNames) {
            newInfoNames.weekdayNames = Array.from(infoNames.weekdayNames);
        }

        return newInfoNames;
    }
    return infoNames;
}

/**
 * Creates a full clone of a {@link CalendarInfo}, only the properties of CalendarInfo
 * are copied.
 * @param {CalendarInfo} calendarInfo 
 * @returns {CalendarInfo}
 */
export function cloneCalendarInfo(calendarInfo) {
    if (calendarInfo) {
        const newCalendarInfo = {};

        const longNames = cloneCalendarInfoNames(calendarInfo.longNames);
        if (longNames) {
            newCalendarInfo.longNames = longNames;
        }

        const shortNames = cloneCalendarInfoNames(calendarInfo.shortNames);
        if (shortNames) {
            newCalendarInfo.shortNames = shortNames;
        }

        const narrowNames = cloneCalendarInfoNames(calendarInfo.narrowNames);
        if (narrowNames) {
            newCalendarInfo.narrowNames = narrowNames;
        }
        return newCalendarInfo;
    }
    return calendarInfo;
}

const calendarInfos = new Map();

/**
 * Retrieves the {@link CalendarInfo} for a given locale string. The locale
 * string should be compatible with Intl.DateTimeFormat's constructor.
 * @param {string} locale 
 */
export function getCalendarInfo(locale) {
    let calendarInfo = calendarInfos.get(locale);
    if (!calendarInfo) {
        calendarInfo = createCalendarInfo(locale);
        calendarInfos.set(locale, calendarInfo);
    }

    return cloneCalendarInfo(calendarInfo);
}