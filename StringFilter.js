
/**
 * Determines if a Unicode code point is a white space.
 * @param {number} code 
 * @returns {boolean}
 */
export function isCodePointSpace(code) {
    if ((code === 0x0020)
     || ((code >= 0x0009) && (code <= 0x000D))) {
        return true;
    }
    if ((code >= 0x2000) && (code <= 0x200A)) {
        return true;
    }

    switch (code) {
    case 0x0085:
    case 0x00A0:
    case 0x1680:
    case 0x2028:
    case 0x2029:
    case 0x202F:
    case 0x205F:
    case 0x3000:
        return true;
    }
}

/**
 * A filterable phrase is string representing one or more words, with each word separated 
 * by a single space character, and the string uppercase.
 * @typedef {string} FilterablePhrase
 */

/**
 * Converts a string into a {@link FilterablePhrase}.
 * @param {string} string 
 * @returns {FilterablePhrase}
 */
export function stringToFilterablePhrase(string) {
    if (!string) {
        return string;
    }

    return string.trim().toUpperCase().split(/\s+/).join(' ');
}

/**
 * A representation of a {@link FilterablePhrase} that determines if a particular
 * {@link FilterablePhrase} is found in the the phase representation.
 * {@link StringFilterCallback} returned by {@link compileFilterSpec}
 * @interface RootFilterablePhrase
 */

/**
 * Determines if a {@link FilterablePhrase} is in the phrase representation.
 * @function RootFilterablePhrase#has
 * @param {FilterablePhrase} value
 * @returns {boolean}
 */


/**
 * A set whose elements are the {@link FilterablePhrase}s that make up a
 * {@link RootFilterablePhrase}.
 * @typedef {Set} FilterablePhraseSet
 * @implements {RootFilterablePhrase}
 */


/**
 * Generates a {@link FilterablePhraseSet} from a string. Phrases
 * are built up from adjacent words.
 * <p>
 * For example, the string ' The Quick   \tBrown ' is converted into a Set whose elements are:
 * <pre><code>
 *  'The Quick Brown',
 *  'The Quick',
 *  'The', 
 *  'Quick Brown',
 *  'Brown',
 *  'Quick',
 * </code></pre>
 * <p>
 * The original string with the whitespace processed can be found from the longest
 * string in the set, which will be the first entry in the set.
 * @param {string} string 
 * @returns {FilterablePhraseSet}
 */
export function stringToFilterablePhraseSet(string) {
    if (typeof string !== 'string') {
        return string;
    }

    const result = new Set();
    const words = string.trim().toUpperCase().split(/\s+/);
    if (string) {
        for (let i = 0; i < words.length; ++i) {
            const subWords = words.slice(i);
            while (subWords.length > 1) {
                result.add(subWords.join(' '));
                --subWords.length;
            }
            result.add(words[i]);
        }
    }

    return result;
}


/**
 * @typedef {Map} FilterablePhraseMap
 * A map whose keys are {@link FilterablePhrase}s.
 * @implements {RootFilterablePhrase}
 */

function _addFilterablePhraseMapEntry(map, word, index) {
    let entry = map.get(word);
    if (!entry) {
        map.set(word, [index]);
    }
    else {
        entry.push(index);
    }
}


/**
 * Generates a {@link FilterablePhraseMap} from a string. The values of the map's
 * entries are arrays containing the indices in the original string of the start of
 * each occurrance of the entry's key. The keys are similar to those generated
 * by {@link stringToFilterablePhraseSet}.
 * @param {string} string 
 * @returns {FilterablePhraseMap}
 */
export function stringToFilterablePhraseMap(string) {
    if (typeof string !== 'string') {
        return string;
    }

    string = string.toUpperCase();

    const words = [];
    const wordIndices = [];
    const currentCodes = [];
    let startIndex = 0;

    let nextIndex;
    for (let index = 0; index < string.length; index = nextIndex) {
        const code = string.codePointAt(index);
        nextIndex = index + ((code > 65536) ? 2 : 1);
        if (isCodePointSpace(code)) {
            if (currentCodes.length) {
                words.push(String.fromCodePoint(...currentCodes));
                wordIndices.push(startIndex);
                currentCodes.length = 0;
            }
            continue;
        }

        if (!currentCodes.length) {
            startIndex = index;
        }
        currentCodes.push(code);
    }

    if (currentCodes.length) {
        words.push(String.fromCodePoint(...currentCodes));
        wordIndices.push(startIndex);
    }

    const result = new Map();
    for (let i = 0; i < words.length; ++i) {
        const startIndex = wordIndices[i];
        const subWords = words.slice(i);
        while (subWords.length > 1) {
            const phrase = subWords.join(' ');
            _addFilterablePhraseMapEntry(result, phrase, startIndex);

            --subWords.length;
        }
        
        _addFilterablePhraseMapEntry(result, words[i], startIndex);
    }
    return result;
}


function any(phrase, tests) {
    for (let i = tests.length - 1; i >= 0; --i) {
        if (tests[i](phrase)) {
            return true;
        }
    }
}

function all(phrase, tests) {
    for (let i = tests.length - 1; i >= 0; --i) {
        if (!(tests[i](phrase))) {
            return false;
        }
    }
    return true;
}


const OPEN_PAREN = 0x28;
const CLOSE_PAREN = 0x29;
const DOUBLE_QUOTE = 0x22;
const BACKSLASH = 0x5C;
const MINUS = 0x2D;


function _addTest(state, test) {
    const { tests } = state;
    const originalTest = test;
    if (state.isNot) {
        test = (phrase) => !originalTest(phrase);
        state.isNot = false;
    }

    if (state.isOR) {
        if (tests.length) {
            // All previous tests are AND'd together.
            let previousTest;
            if (tests.length > 1) {
                const previousAndTests = Array.from(tests);
                previousTest = (phrase) => all(phrase, previousAndTests);
            }
            else {
                previousTest = tests[0];
            }

            tests.length = 0;
            test = (phrase) => any(phrase, [previousTest, originalTest]);
        }
        state.isOR = false;
    }

    tests.push(test);
}

function _handleEndOfWord(state, wordChars, isQuotedWord) {
    if (!wordChars.length) {
        return;
    }

    const word = String.fromCodePoint(...wordChars).toUpperCase();
    if (!isQuotedWord && (word === 'OR')) {
        if (state.tests.length) {
            state.isOR = true;
        }
    }
    else {
        const test = (phrase) => (phrase !== undefined) && phrase.has(word);
        _addTest(state, test);
    }

    wordChars.length = 0;
}

function _parseFilterSpec(state) {
    let { filterSpec, endCode, } = state;

    const currentChars = [];

    let isEscapeNext;
    let isInQuotes;

    let nextIndex;
    for (; state.index < filterSpec.length; state.index = nextIndex) {
        let code = filterSpec.codePointAt(state.index);
        nextIndex = state.index + ((code > 65536) ? 2 : 1);
        if (isEscapeNext) {
            currentChars.push(code);
            isEscapeNext = false;
            continue;
        }

        if (isInQuotes) {
            if (code === DOUBLE_QUOTE) {
                isInQuotes = false;
                _handleEndOfWord(state, currentChars, true);
                continue;
            }
            currentChars.push(code);
            continue;
        }

        if (code === endCode) {
            state.index = nextIndex;
            break;
        }

        if (isCodePointSpace(code)) {
            _handleEndOfWord(state, currentChars);
            continue;
        }

        switch (code) {
        case BACKSLASH:
            isEscapeNext = true;
            continue;

        case DOUBLE_QUOTE:
            isInQuotes = true;
            continue;
        
        case OPEN_PAREN:
            // Only if the first character of the word.
            if (!currentChars.length) {
                const innerState = {
                    filterSpec: state.filterSpec,
                    index: nextIndex,
                    tests: [],
                    endCode: CLOSE_PAREN,
                };
                const result = _parseFilterSpec(innerState);
                nextIndex = innerState.index;
                if (result) {
                    _addTest(state, result);
                }
                continue;
            }
            break;
        
        case MINUS:
            state.isNot = true;
            continue;
        }

        currentChars.push(code);
    }

    _handleEndOfWord(state, currentChars);

    const { tests } = state;
    if (tests.length === 1) {
        return tests[0];
    }
    else if (tests.length > 1) {
        return (phrase) => all(phrase, tests);
    }
    return () => true;
}


/**
 * The function returned by {@link compileFilterSpec}, when called it determines
 * if the {@link RootFilterablePhrase} passed to it satisfies the original filter spec.
 * @callback StringFilterCallback
 * @param {RootFilterablePhrase} rootFilterablePhrase
 * @returns {boolean} Truthy if rootFilterablePhrase satisfies the original filter spec.
 */

/**
 * A string defining a string filter specification that is compiled by
 * {@link compileFilterSpec} into a {@link StringFilterCallback}.
 * <p>
 * Filter specs are simple search strings with the following features:
 * <li>All whitespace is treated as a space character, contiguous whitespace is
 * condensed into a single space. This applies to both the filter spec and the
 * string to be filtered.
 * <li>Everything is case insensitive.
 * <li>Backslash escapes the next character.
 * <li>Double-quotes treat the contents between the double-quote pair as a single word.
 * <li>Individual words have an implicit AND operation between the words, that is a list
 * of words must generally all appear in the filtered string.
 * <li>The word OR between words is an OR between all the previous tests and the
 * next word. The word OR enclosed in double-quotes, "OR", treats the word literally and not
 * as an operator.
 * <li>The minus sign '-' is the NOT operator.
 * <li>Parenthesis can be used for grouping, the contents of a parenthesis group
 * is treated as a single test.
 * @typedef {string} StringFilterSpec
 */

/**
 * Parses a filter spec string into a {@link StringFilterCallback} function.
 * @param {StringFilterSpec} filterSpec 
 * @returns {StringFilterCallback}
 */
export function compileFilterSpec(filterSpec) {
    filterSpec = filterSpec.trim().toUpperCase();
    return _parseFilterSpec({
        filterSpec: filterSpec, 
        index: 0,
        tests: [],
    });
}
