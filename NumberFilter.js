/**
 * Defines a filter to test a number against. All properties are optional.
 * If a property is not specified then no test is performed against it.
 * @typedef {object} NumberFilter
 * @property {number} [mininumValue]
 * @property {number} [maximumValue]
 * @property {number} [value] Only used if both minimumValue and maximumValue
 * are <code>undefined</code>
 */



/**
 * Determines if something is a {@link NumberFilter} that has
 * something to apply.
 * @param {NumberFilter} filter 
 * @returns {boolean} <code>true</code> if filter has something to apply.
 */
export function isNumberFilter(filter) {
    if (filter) {
        return (typeof filter.minimumValue === 'number')
         || (typeof filter.maximumValue === 'number')
         || (typeof filter.value === 'number');
    }
}


/**
 * Determines if a value satisfies a number filter.
 * <p>
 * A value that is not a number always fails the filter.
 * <p>
 * An <code>undefined</code> filter passes values.
 * @param {NumberFilter} filter 
 * @param {number} number 
 * @returns {boolean}
 */
export function doesNumberSatisfyFilter(filter, number) {
    if ((typeof number !== 'number') || isNaN(number)) {
        return false;
    }

    if (filter) {
        const { minimumValue, maximumValue, value } = filter;
        if (typeof minimumValue === 'number') {
            if (number < minimumValue) {
                return false;
            }

            return (typeof maximumValue !== 'number') || (number <= maximumValue);
        }
        else if (typeof maximumValue === 'number') {
            return number <= maximumValue;
        }

        if (typeof value === 'number') {
            return number === value;
        }
    }

    return true;
}