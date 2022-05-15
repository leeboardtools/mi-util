/**
 * Interface for objects that convert between a {@link TimePart} and a string.
 * @interface TimePartFormatter
 */

/**
 * Formats a {@link TimePart} into a string.
 * @function TimePartFormatter#format
 * @param {TimePart} timePart
 * @returns {string}
 */

/**
 * @typedef {object} TimePartFormatter#parse-Options
 * @property {boolean} [fullInfo=false]
 * @property {TimePart} [defTimePart]
 */

/**
 * @typedef {object} TimePartFormatter#parse-Result
 * @property {TimePart} timePart
 * @property {string} errorReason
 * @property {string} remainingText
 */

/**
 * Parses a string into a {@link TimePart}.
 * <p>The result depends on options. If options.fullInfo is truthy then a
 * {@link TimePartFormatter#parse-Result} is returned. If it is not then
 * either a {@link TimePart} is returned if the string was successfully parsed
 * or a string containing the error reason is returned (not a user message).
 * @function TimePartFormatter#parse
 * @param {string} string
 * @param {TimePartFormatter#parse-Options} options
 * @returns {TimePart|string|TimePartFormatter#parse-Result}
 */

/**
 * Returns the locale represented by the formatter.
 * @function TimePartFormatter#getLocale
 * @returns {string}
 */

const ZERO = 0x30;
const NINE = 0x39;
const MINUS = 0x2D;
const PERIOD = 0x2E;
const COMMA = 0x2C;

 
/**
 * A time part formatter that formats along the lines of 'hh:mm AM/PM'.
 * @implements TimePartFormatter
 */
export class TimePartNumericFormatter {
    /**
     * @typedef {object} TimePartNumericFormatter~Options
     * @property {string} [locale]
     * @property {string} [timeStyle] Supported values are 'medium', 'short'. 'full' and
     * 'long' may also be specified but they are treated as 'medium'.
     * @property {boolean} [hour12]
     * @property {string} [hour] Possible values are 'numeric' and '2-digit', ignored
     * if timeStyle is specified.
     * @property {string} [minute] Possible values are 'numeric' and '2-digit', ignored
     * if timeStyle is specified. If both hour and second are specified then minute must
     * also be specified.
     * @property {string} [second] Possible values are 'numeric' and '2-digit', ignored
     * if timeStyle is specified.
     * @property {number} [fractionalSecondDigits] Possible values are 0, 1, 2, and 3,
     * ignored if timeStyle is specified.
     */

    /**
     * Constructor
     * @param {string|TimePartNumericFormatter~Options} [options] If a string then then string
     * is the locale.
     */
    constructor(options) {
        let locale;
        let timeStyle;
        let hour12;
        let hour;
        let minute;
        let second;
        let fractionalSecondDigits;
        if (typeof options === 'string') {
            locale = options;
        }
        else if (typeof options === 'object') {
            locale = options.locale;
            timeStyle = options.timeStyle;
            hour12 = options.hour12;
            
            if (!timeStyle) {
                hour = options.hour;
                minute = options.minute;
                second = options.second;
                fractionalSecondDigits = options.fractionalSecondDigits;
            }
        }
        if (!timeStyle) {
            if (!hour && !minute && !second) {
                timeStyle = 'short';    // 10:30 AM
            }
        }
        else if ((timeStyle === 'full') || (timeStyle === 'long')) {
            timeStyle = 'medium';
        }

        options = {
            timeStyle: timeStyle,
            hour12: hour12,
            hour: hour,
            minute: minute,
            second: second,
            fractionalSecondDigits: fractionalSecondDigits,
        };

        this.locale = locale;

        this.dateTimeFormat = new Intl.DateTimeFormat(locale, options);

        this.hoursIndex = -1;
        this.hoursDigits = 2;
        this.minutesIndex = -1;
        this.minutesDigits = 2;
        this.secondsIndex = -1;
        this.secondsDigit = 2;
        this.fractionalSecondsIndex = -1;
        this.fractionalSecondsDigits = 3;
        this.ampmIndex = -1;

        this.separators = [];

        const pmTime = new Date(2022, 3, 4, 21, 30, 40, 50);

        let parts = this.dateTimeFormat.formatToParts(pmTime);

        let nextIndex = 0;

        for (let i = 0; i < parts.length; ++i) {
            const part = parts[i];
            switch (part.type) {
            case 'hour':
                this.hoursIndex = nextIndex++;
                break;
            
            case 'minute':
                this.minutesIndex = nextIndex++;
                break;
            
            case 'second':
                this.secondsIndex = nextIndex++;
                break;
            
            case 'fractionalSecond':
                this.fractionalSecondsIndex = nextIndex++;
                this.fractionalSecondsDigits = part.value.length;
                break;
            
            case 'dayPeriod':
                this.ampmIndex = nextIndex++;
                this.pmString = part.value;
                break;
            
            case 'literal':
                if (this.separators.length
                 && ((this.separators[this.separators.length - 1].index + 1) === nextIndex)) {
                    // Concat adjacent separators...
                    this.separators[this.separators.length - 1].separator += part.value;
                }
                else {
                    this.separators.push({
                        index: nextIndex++,
                        separator: part.value,
                    });
                }
                break;
            }
        }

        const amTime = new Date(2022, 3, 4, 1, 2, 3, 432);
        parts = this.dateTimeFormat.formatToParts(amTime);
        for (let i = 0; i < parts.length; ++i) {
            const part = parts[i];
            switch (part.type) {
            case 'dayPeriod':
                this.amString = part.value;
                break;
            
            case 'hour':
                this.hoursDigits = part.value.length;
                break;
            
            case 'minute':
                if (this.hoursIndex < 0) {
                    this.minutesDigits = part.value.length;
                }
                break;
            
            case 'second' :
                if (this.minutesIndex < 0) {
                    this.secondsDigits = part.value.length;
                }
                break;
            }
        }

        if (this.ampmIndex < 0) {
            // We always need the AM/PM string for parsing.
            options.hour12 = true;
            const hour12Format = new Intl.DateTimeFormat(locale, options);
            parts = hour12Format.formatToParts(amTime);
            for (let i = 0; i < parts.length; ++i) {
                if (parts[i].type === 'dayPeriod') {
                    this.amString = parts[i].value;
                }
            }

            parts = hour12Format.formatToParts(pmTime);
            for (let i = 0; i < parts.length; ++i) {
                if (parts[i].type === 'dayPeriod') {
                    this.pmString = parts[i].value;
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


    format(timePart) {
        if (!timePart) {
            return timePart;
        }
        
        const parts = [];

        let hours = timePart.hours || 0;
        if (this.ampmIndex >= 0) {
            parts[this.ampmIndex] = (hours >= 12) ? this.pmString : this.amString;
            if (!hours) {
                hours = 12;
            }
            else if (hours > 12) {
                hours -= 12;
            }
        }

        if (this.hoursIndex >= 0) {
            parts[this.hoursIndex] = hours.toString().padStart(this.hoursDigits, '0');
        }
        if (this.minutesIndex >= 0) {
            parts[this.minutesIndex] = (timePart.minutes || 0).toString().padStart(this.minutesDigits, '0');
        }
        if (this.secondsIndex >= 0) {
            parts[this.secondsIndex] = (timePart.seconds || 0).toString().padStart(this.secondsDigits, '0');
        }
        if (this.fractionalSecondsIndex >= 0) {
            let fractionalSeconds = timePart.milliseconds || 0;
            if (this.fractionalSecondsDigits !== 3) {
                fractionalSeconds = Math.floor(fractionalSeconds * Math.pow(10, this.fractionalSecondsDigits - 3));
            }
            parts[this.fractionalSecondsIndex] = fractionalSeconds.toString().padStart(this.fractionalSecondsDigits, '0');
        }

        if (this.separators) {
            this.separators.forEach((entry) => {
                parts[entry.index] = entry.separator;
            });
        }

        return parts.join('');
    }



    /**
     * Parses a string into a {@link TimePart}.
     * <p>The result depends on options. If options.fullInfo is truthy then a
     * {@link TimePartFormatter#parse-Result} is returned. If it is not then
     * either a {@link TimePart} is returned if the string was successfully parsed
     * or a string containing the error reason is returned (not a user message).
     * <p>
     * Fractional seconds are always parsed as part of the seconds.
     * <p>
     * If the formatter's options did not specify timeStyle and all three of
     * hour, minute, and second were not specified, then time value is treated as
     * elapsed hours, minutes, and/or seconds and not as time of day. This means that
     * AM/PM is not parsed.
     * <p>
     * For the elapsed time case, if the number of time parts doesn't match the specified
     * parts of the format, the following cases are supported:
     * <li>If three parts are specified, they are always treated as hh:mm:ss
     * <li>For format hh        xx:xx is hh:mm
     * <li>For format hh:mm     xx is hours
     * <li>For format mm        xx:xx is hh:mm
     * <li>For format mm:ss     xx is minutes
     * <li>For format ss        xx:xx is mm:ss
     * @param {string} string
     * @param {TimePartFormatter#parse-Options} options
     * @returns {TimePart|string|TimePartFormatter#parse-Result}
     */
    parse(string, options) {
        options = options || {};
        if (!options.fullInfo) {
            const result = this.parse(string, Object.assign({}, options, { fullInfo: true, }));
            return (result.errorReason)
                ? result.errorReason
                : result.timePart;
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

        let upperString;
        let upperAMString;
        let upperPMString;
        let ampmType;

        if (this.amString) {
            upperString = string.toUpperCase();
            upperAMString = this.amString.toUpperCase();
            upperPMString = this.pmString.toUpperCase();
        }

        let index = 0;
        for (; index < string.length; ) {
            const code = string.codePointAt(index);
            
            let isDecimalSeparator;
            if ((code === PERIOD) || (code === COMMA)) {
                const nextCode = string.codePointAt(index + 1);
                isDecimalSeparator = (nextCode >= ZERO) && (nextCode <= NINE);
            }

            if (((code >= ZERO) && (code <= NINE)) || isDecimalSeparator) {
                currentDigits.push(code);
            }
            else {
                if (upperString && !ampmType) {
                    // Note we always check for AM/PM regardless of the original format.
                    // Check for AM/PM before we process the digits since this may end the digits.
                    const testString = upperString.slice(index).trimStart();
                    if (testString.startsWith(upperAMString)) {
                        ampmType = 'AM';
                    }
                    else if (testString.startsWith(upperPMString)) {
                        ampmType = 'PM';
                    }
                }

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

        const defTimePart = options.defTimePart || {};
        const timePart = {};

        // This is a little tricky - if the format is say only hh:mm but hh:mm:ss is specified,
        // we want to use hh:mm:ss.
        // But at the same time we need to distinguish the formats between hh:mm and mm:ss
        let numbersInFormat = 0;
        if (this.hoursIndex >= 0) {
            ++numbersInFormat;
        }
        if (this.minutesIndex >= 0) {
            ++numbersInFormat;
        }
        if (this.secondsIndex >= 0) {
            ++numbersInFormat;
        }
        // The fractionalSeconds are always part of seconds...

        let hoursIndex = Math.floor(this.hoursIndex / 2);
        let minutesIndex = Math.floor(this.minutesIndex / 2);
        let secondsIndex = Math.floor(this.secondsIndex / 2);
        if (numbersInFormat < numbersDigits.length) {
            // Possibilities are:
            // ss specified, hh:mm:ss or mm:ss input.
            // mm specified, hh:mm:ss or hh:mm input.
            // hh specified, hh:mm:ss or hh:mm input.
            // mm:ss specified, hh:mm:ss input.
            // hh:mm specified, hh:mm:ss input.
            if ((numbersInFormat === 2) || (numbersDigits.length === 3)) {
                hoursIndex = 0;
                minutesIndex = 1;
                secondsIndex = 2;
            }
            else if (hoursIndex >= 0) {
                minutesIndex = 1;
            }
            else if (minutesIndex >= 0) {
                hoursIndex = 0;
                minutesIndex = 1;
            }
            else if (secondsIndex >= 0) {
                minutesIndex = 0;
                secondsIndex = 1;
            }
        }
        else if (numbersInFormat > numbersDigits.length) {
            // Possibilities are:
            // mm:ss specified, mm input.
            // hh:mm specified, hh input.
            // hh:mm:ss specified, hh input, hh:mm input
            if (numbersDigits.length === 2) {
                secondsIndex = -1;
            }
            else if (hoursIndex >= 0) {
                hoursIndex = 0;
                minutesIndex = -1;
                secondsIndex = -1;
            }
            else if (minutesIndex >= 0) {
                minutesIndex = 0;
                secondsIndex = -1;
            }
        }

        if ((hoursIndex >= 0) && (hoursIndex < numbersDigits.length)) {
            timePart.hours = parseInt(String.fromCharCode(...numbersDigits[hoursIndex]));
            if (!isNaN(timePart.hours)) {
                if (ampmType === 'PM') {
                    if (timePart.hours !== 12) {
                        timePart.hours += 12;
                    }
                }
                else if (ampmType === 'AM') {
                    if (timePart.hours === 12) {
                        timePart.hours = 0;
                    }
                }

                // Lesser parts default to 0.
                timePart.minutes = 0;
                timePart.seconds = 0;
                timePart.milliseconds = 0;
            }
        }

        if ((minutesIndex >= 0) && (minutesIndex < numbersDigits.length)) {
            timePart.minutes = parseInt(String.fromCharCode(...numbersDigits[minutesIndex]));
            if (!isNaN(timePart.minutes)) {
                // Lesser parts default to 0.
                timePart.seconds = 0;
                timePart.milliseconds = 0;
            }
        }

        if ((secondsIndex >= 0) && (secondsIndex < numbersDigits.length)) {
            let seconds = parseFloat(String.fromCharCode(...numbersDigits[secondsIndex]));
            timePart.seconds = Math.floor(seconds);
            let floatMS = (seconds - timePart.seconds) * 1000;
            timePart.milliseconds = Math.floor(floatMS);
            if (Math.abs(floatMS - timePart.milliseconds) > 0.9999999) {
                timePart.milliseconds = Math.ceil(floatMS);
            }
        }

        if (typeof timePart.hours !== 'number') {
            if (defTimePart && (typeof defTimePart.hours === 'number')) {
                timePart.hours = defTimePart.hours;
            }
            else if (this.hoursIndex < 0) {
                timePart.hours = 0;
            }
            else {

                return {
                    errorReason: 'hours-missing',
                };
            }
        }

        if (typeof timePart.minutes !== 'number') {
            if (defTimePart && (typeof defTimePart.minutes === 'number')) {
                timePart.minutes = defTimePart.minutes;
            }
            else if (this.minutesIndex < 0) {
                timePart.minutes = 0;
            }
            else {
                return {
                    errorReason: 'minutes-missing',
                };
            }
        }
        if (typeof timePart.seconds !== 'number') {
            if (defTimePart && (typeof defTimePart.seconds === 'number')) {
                timePart.seconds = defTimePart.seconds;
            }
            else if (this.secondsIndex < 0) {
                timePart.seconds = 0;
            }
            else {
                return {
                    errorReason: 'seconds-missing',
                };
            }
        }
        if (typeof timePart.milliseconds !== 'number') {
            if (defTimePart && (typeof defTimePart.milliseconds === 'number')) {
                timePart.milliseconds = defTimePart.milliseconds;
            }
            else if (this.fractionalSecondsIndex < 0) {
                timePart.milliseconds = 0;
            }
            else {
                return {
                    errorReason: 'seconds-missing',
                };
            }
        }


        return {
            timePart: timePart,
            remainingText: string.slice(lastNumberIndex),
        };
    }


    getLocale() { return this.locale; }
}


/**
 * Retrieves a {@link TimePartFormatter} for a locale.
 * @param {string} locale 
 * @returns {TimePartFormatter}
 */
export function getTimePartFormatter(locale) {
    return new TimePartNumericFormatter(locale);
}
