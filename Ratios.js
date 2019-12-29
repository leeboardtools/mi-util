import { reduceToSimplePrimes } from './PrimeUtils';


/**
 * Represents a ratio using a numerator and a denominator, tracking the actual numerator and denominator values
 * as the ratio is multiplied or divided by other ratios.
 */
export class Ratio {
    /**
     * @typedef {object}    Ratio~JSON
     * @property {number[]} nums    The numerator values.
     * @property {number[]} dens    The denominator values.
     */

    /**
     * Constructor. The argument can be one of the following:
     * <li>(number, [number=1]) Where the first number is the numerator and the second number, if given, is the denominator.
     * <li>(number[], number[]) Where the first arg is an array of the numerator values and the second arg is an array of the
     * denominator values. The array sizes must be the same.
     * <li>(Ratio[]) An array of Ratio objects.
     * <li>(...Ratio) One or more Ratio objects.
     * <li>({@link Ratio~JSON}) An object with the same format as generated by {@link Ratio#toJSON}.
     * @param  {...any} args 
     */
    constructor(...args) {
        let nums;
        let dens;
        if (args.length === 1) {
            const arg = args[0];
            if (Array.isArray(arg)) {
                const firstArg = arg[0];
                if (firstArg instanceof Ratio) {
                    // An array of Ratios.
                    nums = [];
                    dens = [];
                    arg.forEach((ratio) => {
                        nums = nums.concat(ratio.getNumerators());
                        dens = dens.concat(ratio.getDenominators());
                    });
                }
                else if (typeof firstArg === 'number') {
                    nums = arg;
                }
            }
            else if (typeof arg === 'number') {
                nums = arg;
                dens = [1];
            }
            else if (arg && arg.nums && arg.dens) {
                // JSON object.
                nums = arg.nums;
                dens = arg.dens;
            }
        }
        else {
            if (args[0] instanceof Ratio) {
                // A bunch of Ratios
                nums = [];
                dens = [];
                args.forEach((ratio) => {
                    nums = nums.concat(ratio.getNumerators());
                    dens = dens.concat(ratio.getDenominators());
                });
            }
            else {
                nums = args[0];
                dens = args[1];
            }
        }


        this._numerators = Array.isArray(nums) ? nums : [ nums ];

        if (dens === undefined) {
            dens = Array(this._numerators.length).fill(1);
        }
        this._denominators = Array.isArray(dens) ? dens : [ dens ];
    }

    /**
     * @returns {Ratio~JSON}
     */
    toJSON() {
        return {
            nums: this._numerators,
            dens: this._denominators,
        };
    }

    /**
     * @returns {number[]}  An array containing the values of the numerator.
     */
    getNumerators() { return this._numerators; }

    /**
     * @returns {number[]}  An array containing the values of the denonminator.
     */
    getDenominators() { return this._denominators; }

    /**
     * Returns a new {@link Ratio} that's the inverse of this.
     * @returns {Ratio}
     */
    inverse() { return new Ratio(this._denominators, this._numerators); }

    /**
     * Returns a new {@link Ratio} whose numerators are a combination of the numerators of this and another Ratio's numerators,
     * and whose denominators are a combination of the denominators of this and another Ratio's denominators.
     * @param {Ratio} other 
     */
    multiply(other) { return new Ratio(this._numerators.concat(other._numerators), this._denominators.concat(other._denominators)); }

    /**
     * Returns a new {@link Ratio} whose numerators are a combination of the numerators of this and another Ratio's denominators,
     * and whose denominators are a combination of the denominators of this and another Ratio's numerators.
     * Essentially the same as this.mulitiply(other.inverse());
     * @param {Ratio} other 
     */
    divide(other) { return new Ratio(this._numerators.concat(other._denominators), this._denominators.concat(other._numerators)); }

    /**
     * Returns an array containing the reduced numerator and denominator of this.
     * @returns {number[]}  An array whose first element is the reduced numerator and whose second element is the reduced denominator.
     */
    getReducedNumeratorDenominator() {
        if (this._numerators.length === 1) {
            return [this._numerators[0], this._denominators[0] ];
        }

        const numPrimes = reduceToSimplePrimes(this._numerators);
        const denPrimes = reduceToSimplePrimes(this._denominators);

        // OK, reduce the primes. If we start with the primes in the numerator,
        // we just have to go through the denominator primes and subtract their powers from the numerator prime powers.
        const primes = numPrimes.primes;
        denPrimes.primes.forEach((count, prime) => {
            const newCount = (primes.get(prime) || 0) - count;
            if (newCount) {
                primes.set(prime, newCount);
            }
            else {
                primes.delete(prime);
            }
        });

        let numerator = numPrimes.sign * numPrimes.remainder;
        let denominator = denPrimes.sign * denPrimes.remainder;

        primes.forEach((count, prime) => {
            if (count > 0) {
                numerator *= Math.pow(prime, count);
            }
            else {
                denominator *= Math.pow(prime, -count);
            }
        });

        return [numerator, denominator];
    }

    
    /**
     * Returns a new {@link Ratio} whose numerators and denominators consist of only one value.
     * @returns {Ratio}
     */
    reduce() {
        const [ numerator, denominator ] = this.getReducedNumeratorDenominator();
        return new Ratio(numerator, denominator);
    }

    /**
     * Returns the ratio as a number.
     * @returns {number}
     */
    toValue() {
        const [ numerator, denominator ] = this.getReducedNumeratorDenominator();

        // We do the equality test so that 0 / 0 and inf / inf are 1.
        return (numerator === denominator) ? 1 : (numerator / denominator);
    }
}