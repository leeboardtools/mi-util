/**
 * Interface for objects that convert between a {@link DatePart} and a string.
 * @interface DatePartFormatter
 */

/**
 * Formats a {@link DatePart} into a string.
 * @function DatePartFormatter#format
 * @param {DatePart} datePart
 * @returns {string}
 */

/**
 * @typedef {object} DatePartFormatter#parse-Options
 * @property {boolean} [fullInfo=false]
 * @property {DatePart} [defDatePart]
 */

/**
 * @typedef {object} DatePartFormatter#parse-Result
 * @property {DatePart} datePart
 * @property {string} errorReason
 * @property {string} remainingText
 */

/**
 * Parses a string into a {@link DatePart}.
 * <p>The result depends on options. If options.fullInfo is truthy then a
 * {@link DatePartFormatter#parse-Result} is returned. If it is not then
 * either a {@link DatePart} is returned if the string was successfully parsed
 * or a string containing the error reason is returned (not a user message).
 * @function DatePartFormatter#parse
 * @param {string} string
 * @param {DatePartFormatter#parse-Options} options
 * @returns {DatePart|string|DatePartFormatter#parse-Result}
 */

/**
 * Returns the locale represented by the formatter.
 * @function DatePartFormatter#getLocale
 * @returns {string}
 */


function getShortYearParts(refYear) {
    if (typeof refYear !== 'number') {
        refYear = new Date().getFullYear();
    }
    const refCentury = Math.floor(refYear / 100);

    const result = {};
    if ((refYear % 100) >= 50) {
        result.minYear = refCentury * 100 + 50;
        result.maxYear = result.minYear + 99;

        result.lt50Base = (refCentury + 1) * 100;
        result.ge50Base = refCentury * 100;
    }
    else {
        result.maxYear = refCentury * 100 + 50;
        result.minYear = result.maxYear - 99;

        result.lt50Base = refCentury * 100;
        result.ge50Base = (refCentury - 1) * 100;
    }
    return result;
}


const ZERO = 0x30;
const NINE = 0x39;
const MINUS = 0x2D;

/**
 * A date part formatter that formats along the lines of 'mm/dd/yyyy'.
 * @implements DatePartFormatter
 */
export class DatePartNumericFormatter {

    /**
     * @typedef {object} DatePartNumericFormatter~Options
     * Constructor options.
     * <p>
     * The options property is an optional array of strings describing the format. Each element of
     * the array corresponds to either one of the date parts or a separator string.
     * The ordering of the elements determines the ordering of the formatting and
     * parsing.
     * <p>
     * The element representing the year is a string of one or more 'y' or 'Y'.
     * <p>
     * The element representing the month is a string of one or more 'm' or 'M'.
     * <p>
     * The element representing the day of month is a string of one or more 'd' or 'D'.
     * <p>
     * For the date parts, the number of characters in the string indicates the minimum
     * number of digits to generate on format, padded with  '0'.
     * <p>
     * The default format is equivalent to the array:
     * <code><pre>
     * options = [ 'MM', '/', 'DD', '/', 'YY'];
     * </code></pre>
     * <p>
     * Note that if any of the separators includes the minus character '-' parsing will not
     * support negative values.
     * @property {string} [locale='en-US']
     * @property {string[]} [options]
     */

    /**
     * Constructor.
     * @param {string|string[]|DatePartNumericFormatter~Options} [options] If a single string
     * it is the locale returned by {@link DatePartFormatter#getLocale}.
     * <p>
     * If an array of strings it is the same as the options property of
     * {@link DatePartNumericFormatter~Options}}.
     */
    constructor(options) {
        let locale;
        if (typeof options === 'string') {
            locale = options;
        }
        else if (!Array.isArray(options)
         && (typeof options === 'object')) {
            locale = options.locale;
            options = options.options;
        }

        this.locale = locale || 'en-US';

        this.separators = [];
        this.monthIndex = 0;
        this.monthDigits = 2;

        this.separators.push({
            index: 1,
            separator: '/',
        });

        this.dayIndex = 2;
        this.dayDigits = 2;

        this.separators.push({
            index: 3,
            separator: '/',
        });

        this.yearIndex = 4;
        this.yearDigits = 2;

        if (Array.isArray(options)) {
            if (options.length >= 1) {
                // Clear out everything...
                this.monthIndex = -1;
                this.dayIndex = -1;
                this.yearIndex = -1;
                this.separators = [];

                let nextIndex = 0;

                for (let i = 0; i < options.length; ++i) {
                    const option = options[i].toUpperCase();
                    if (option === 'M'.padEnd(option.length, 'M')) {
                        this.monthIndex = nextIndex++;
                        this.monthDigits = option.length;
                    }
                    else if (option === 'D'.padEnd(option.length, 'D')) {
                        this.dayIndex = nextIndex++;
                        this.dayDigits = option.length;
                    }
                    else if (option === 'Y'.padEnd(option.length, 'Y')) {
                        this.yearIndex = nextIndex++;
                        this.yearDigits = option.length;
                    }
                    else {
                        if (this.separators.length
                         && ((this.separators[this.separators.length - 1].index + 1) === nextIndex)) {
                            // Concat adjacent separators...
                            this.separators[this.separators.length - 1].separator += options[i];
                        }
                        else {
                            this.separators.push({
                                index: nextIndex++,
                                separator: options[i],  // De-ref options, don't want the uppercase version...
                            });
                        }
                    }
                }
            }
        }

        this.isMinusSeparator = false;
        for (let i = 0; i < this.separators.length; ++i) {
            if (this.separators[i].separator.includes('-')) {
                this.isMinusSeparator = true;
                break;
            }
        }
    }


    format(datePart, refYear) {
        if (!datePart) {
            return datePart;
        }
        
        const parts = [];
        if (this.monthIndex >= 0) {
            parts[this.monthIndex] = (datePart.month + 1).toString().padStart(this.monthDigits, '0');
        }
        if (this.dayIndex >= 0) {
            parts[this.dayIndex] = datePart.dayOfMonth.toString().padStart(this.dayDigits, '0');
        }
        if (this.yearIndex >= 0) {
            let { year } = datePart;
            if (this.yearDigits < 4) {
                // Need to detect too far in the past or future...
                const shortYearParts = getShortYearParts(refYear);
                if ((year >= shortYearParts.minYear) && (year <= shortYearParts.maxYear)) {
                    year = Math.round(year % 100);
                }
            }

            parts[this.yearIndex] = year.toString().padStart(this.yearDigits, '0');
        }

        if (this.separators) {
            this.separators.forEach((entry) => {
                parts[entry.index] = entry.separator;
            });
        }

        return parts.join('');
    }


    /**
     * Parses a string formatted along the lines of this formatter into a {@link DatePart}.
     * The ordering of the date parts in the string is defined by the ordering in the
     * formatter. Sequences of digits are gathered, the separators don't have to match
     * the separators of the formatter.
     * <p>
     * If the year part has 2 or fewer digits, it is treated as a short year, using either
     * the year of the defDatePart option if present or the current date's year.
     * <p>
     * If any of the date parts are missing and the defDatePart option is present and specifies
     * the matching date part, that date part will be returned, otherwise an error is reported.
     * <p>
     * The following errors reasons may be returned:
     * <li>string-undefined
     * <li>month-missing
     * <li>dayOfMonth-missing
     * <li>year-missing
     * <p>
     * Note that the date part returned is not validated/cleaned.
     * @param {string} string
     * @param {DatePartFormatter#parse-Options} options
     * @returns {DatePart|string|DatePartFormatter#parse-Result}
     */
    parse(string, options) {
        options = options || {};
        if (!options.fullInfo) {
            const result = this.parse(string, Object.assign({}, options, { fullInfo: true, }));
            return (result.errorReason)
                ? result.errorReason
                : result.datePart;
        }

        if (!string) {
            return {
                errorReason: 'string-undefined',
            };
        }

        const numbersDigits = [];
        let currentDigits = [];
        let currentIsNeg;
        let lastNumberIndex = 0;

        let index = 0;
        for (; index < string.length; ) {
            const code = string.codePointAt(index);
            if ((code >= ZERO) && (code <= NINE)) {
                currentDigits.push(code);
            }
            else {
                if (currentDigits.length) {
                    if (currentIsNeg) {
                        currentDigits.splice(0, 0, '-');
                        currentIsNeg = false;
                    }
                    numbersDigits.push(currentDigits);
                    currentDigits = [];

                    lastNumberIndex = index;
                    if (numbersDigits.length >= 3) {
                        break;
                    }
                }
                else if (!this.isMinusSeparator && (code === MINUS)) {
                    currentIsNeg = true;
                }
                else {
                    currentIsNeg = false;
                }
            }

            index += ((code > 65536) ? 2 : 1);
        }

        if (currentDigits.length) {
            if (currentIsNeg) {
                currentDigits.splice(0, 0, MINUS);
            }
            numbersDigits.push(currentDigits);
            lastNumberIndex = index;
        }

        const defDatePart = options.defDatePart || {};
        const datePart = {};

        if (this.monthIndex >= 0) {
            const index = Math.floor(this.monthIndex / 2);
            if (index < numbersDigits.length) {
                datePart.month = parseInt(String.fromCharCode(...numbersDigits[index])) - 1;
            }
        }

        if (this.dayIndex >= 0) {
            const index = Math.floor(this.dayIndex / 2);
            if (index < numbersDigits.length) {
                datePart.dayOfMonth = parseInt(String.fromCharCode(...numbersDigits[index]));
            }
        }

        if (this.yearIndex >= 0) {
            const index = Math.floor(this.yearIndex / 2);
            if (index < numbersDigits.length) {
                let year = parseInt(String.fromCharCode(...numbersDigits[index]));
                if (numbersDigits[index].length <= 2) {
                    // Need to resolve the year...
                    const refYear = (defDatePart) ? defDatePart.year : undefined;
                    const shortYearParts = getShortYearParts(refYear);
                    if (Math.round(year % 100) >= 50) {
                        year += shortYearParts.ge50Base;
                    }
                    else {
                        year += shortYearParts.lt50Base;
                    }
                }

                datePart.year = year;
            }
        }

        if (typeof datePart.month !== 'number') {
            if (defDatePart && (typeof defDatePart.month === 'number')) {
                datePart.month = defDatePart.month;
            }
            else {
                return {
                    errorReason: 'month-missing',
                };
            }
        }
        if (typeof datePart.dayOfMonth !== 'number') {
            if (defDatePart && (typeof defDatePart.dayOfMonth === 'number')) {
                datePart.dayOfMonth = defDatePart.dayOfMonth;
            }
            else {
                return {
                    errorReason: 'dayOfMonth-missing',
                };
            }
        }
        if (typeof datePart.year !== 'number') {
            if (defDatePart && (typeof defDatePart.year === 'number')) {
                datePart.year = defDatePart.year;
            }
            else {
                return {
                    errorReason: 'year-missing',
                };
            }
        }

        return {
            datePart: datePart,
            remainingText: string.slice(lastNumberIndex),
        };
    }


    getLocale() { return this.locale; }
}


/**
 * Retrieves a {@link DatePartFormatter} for a locale.
 * <p>The default formatter formats as mm/dd/yy.
 * @param {string} locale 
 * @returns {DatePartFormatter}
 */
export function getDatePartFormatter(locale) {
    return new DatePartNumericFormatter(locale);
}
