import * as TP from './TimePart';



//
//---------------------------------------------------------
//
test('TimePart-clean', () => {
    // No changes same object returned.
    const a = { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, };
    expect(TP.cleanTimePart(a)).toBe(a);

    expect(TP.cleanTimePart()).toBeUndefined();


    // Minor changes result in different object.
    const b = { hours: 1.49, minutes: 2.49, seconds: 3.49, milliseconds: 4.49, };
    expect(TP.cleanTimePart(b)).not.toBe(b);

    expect(TP.cleanTimePart(b)).toEqual(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, }
    );

    expect(TP.cleanTimePart(
        { hours: -1.49, minutes: -2.49, seconds: -3.49, milliseconds: -4.49, }
    )).toEqual(
        { hours: -1, minutes: -2, seconds: -3, milliseconds: -4, }
    );

    
    // More rounding:
    expect(TP.cleanTimePart(
        { hours: 1.51, minutes: 2.51, seconds: 3.51, milliseconds: 4.51, }
    )).toEqual(
        { hours: 2, minutes: 3, seconds: 4, milliseconds: 5, }
    );

    expect(TP.cleanTimePart(
        { hours: -1.51, minutes: -2.51, seconds: -3.51, milliseconds: -4.51, }
    )).toEqual(
        { hours: -2, minutes: -3, seconds: -4, milliseconds: -5, }
    );


    // Missing parts:
    expect(TP.cleanTimePart({})).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, }
    );


    // Carrying:
    expect(TP.cleanTimePart(
        { hours: 1, minutes: 62, seconds: 123, milliseconds: 4567, }
    )).toEqual(
        { hours: 2, minutes: 4, seconds: 7, milliseconds: 567, }
    );

    expect(TP.cleanTimePart(
        { hours: -1, minutes: -62, seconds: -123, milliseconds: -4567, }
    )).toEqual(
        { hours: -2, minutes: -4, seconds: -7, milliseconds: -567, }
    );

    // Carrying causing carrying
    expect(TP.cleanTimePart(
        { hours: 2, minutes: 59, seconds: 59, milliseconds: 2234, }
    )).toEqual(
        { hours: 3, minutes: 0, seconds: 1, milliseconds: 234, }
    );
    expect(TP.cleanTimePart(
        { hours: -2, minutes: -59, seconds: -59, milliseconds: -2234, }
    )).toEqual(
        { hours: -3, minutes: -0, seconds: -1, milliseconds: -234, }
    );
});


//
//---------------------------------------------------------
//
test('TimePart-isTimePart', () => {
    expect(TP.isTimePart()).toBeFalsy();
    expect(TP.isTimePart('Abc')).toBeFalsy();
    expect(TP.isTimePart({})).toBeFalsy();

    expect(TP.isTimePart({ hours: 0, minutes: undefined, })).toBeTruthy();
    expect(TP.isTimePart({ hours: 0, minutes: 'Abc', })).toBeFalsy();
    expect(TP.isTimePart({ minutes: 1, })).toBeTruthy();
    expect(TP.isTimePart({ seconds: -1, })).toBeTruthy();
    expect(TP.isTimePart({ milliseconds: 1, })).toBeTruthy();
});


//
//---------------------------------------------------------
//
test('TimePart-String', () => {
    expect(TP.timePartToString()).toBeUndefined();
    expect(TP.timePartToString({})).toEqual('00:00:00');

    //
    // No milliseconds:
    expect(TP.timePartToString(
        { hours: 12, minutes: 59, seconds: 21, }
    )).toEqual('12:59:21');
    expect(TP.timePartFromString('12:59:21')).toEqual(
        { hours: 12, minutes: 59, seconds: 21, milliseconds: 0, }
    );
    
    expect(TP.timePartToString(
        { hours: -12, minutes: -59, seconds: -21, }
    )).toEqual('-12:-59:-21');
    expect(TP.timePartFromString('-12:-59:-21')).toEqual(
        { hours: -12, minutes: -59, seconds: -21, milliseconds: 0, }
    );


    expect(TP.timePartToString(
        { hours: 2, minutes: 5, seconds: 1, }
    )).toEqual('02:05:01');
    expect(TP.timePartFromString('02:05:01')).toEqual(
        { hours: 2, minutes: 5, seconds: 1, milliseconds: 0, }
    );

    expect(TP.timePartToString(
        { hours: -2, minutes: -5, seconds: -1, }
    )).toEqual('-02:-05:-01');
    expect(TP.timePartFromString('-02:-05:-01')).toEqual(
        { hours: -2, minutes: -5, seconds: -1, milliseconds: 0, }
    );


    //
    // Milliseconds:
    expect(TP.timePartToString(
        { milliseconds: 4, }
    )).toEqual('00:00:00.004');
    expect(TP.timePartFromString('00:00:00.004')).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: 4, }
    );

    expect(TP.timePartToString(
        { milliseconds: -4, }
    )).toEqual('00:00:-00.004');
    expect(TP.timePartFromString('00:00:-00.004')).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: -4, }
    );


    expect(TP.timePartToString(
        { milliseconds: 45, }
    )).toEqual('00:00:00.045');
    expect(TP.timePartFromString('00:00:00.045')).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: 45, }
    );

    expect(TP.timePartToString(
        { milliseconds: -45, }
    )).toEqual('00:00:-00.045');
    expect(TP.timePartFromString('00:00:-00.045')).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: -45, }
    );


    expect(TP.timePartToString(
        { milliseconds: 456, }
    )).toEqual('00:00:00.456');
    expect(TP.timePartFromString('00:00:00.456')).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: 456, }
    );

    expect(TP.timePartToString(
        { milliseconds: -456, }
    )).toEqual('00:00:-00.456');
    expect(TP.timePartFromString('00:00:-00.456')).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: -456, }
    );


    // Millisecond sign not matching seconds sign
    expect(TP.timePartToString(
        { hours: 10, minutes: 0, seconds: 59, milliseconds: -1, }
    )).toEqual('10:00:58.999');
    expect(TP.timePartFromString('10:00:58.999')).toEqual(
        { hours: 10, minutes: 0, seconds: 58, milliseconds: 999, }
    );

    expect(TP.timePartToString(
        { hours: 10, minutes: 0, seconds: -59, milliseconds: 1, }
    )).toEqual('10:00:-58.999');
    expect(TP.timePartFromString('10:00:-58.999')).toEqual(
        { hours: 10, minutes: 0, seconds: -58, milliseconds: -999, }
    );


    // Milliseconds not displayed.
    expect(TP.timePartToString(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 499, },
        'no-ms'
    )).toEqual('01:02:03');

    expect(TP.timePartToString(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 501, },
        'no-ms'
    )).toEqual('01:02:04');

    // Rolling round up
    expect(TP.timePartToString(
        { hours: 1, minutes: 59, seconds: 59, milliseconds: 501, },
        'no-ms'
    )).toEqual('02:00:00');

});


//
//---------------------------------------------------------
//
test('TimePart-Milliseconds', () => {
    expect(TP.timePartTo_ms()).toBeUndefined();
    expect(TP.timePartTo_ms({})).toBe(0);

    expect(TP.timePartFrom_ms()).toBeUndefined();
    expect(TP.timePartFrom_ms(0)).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, }
    );

    expect(TP.timePartTo_ms(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, }
    )).toEqual(1 * 3600000 + 2 * 60000 + 3000 + 4);
    expect(TP.timePartFrom_ms(1 * 3600000 + 2 * 60000 + 3000 + 4)).toEqual(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, }
    );

    expect(TP.timePartTo_ms(
        { hours: -1, minutes: -2, seconds: -3, milliseconds: -4, }
    )).toEqual(-1 * 3600000 + -2 * 60000 + -3000 + -4);
    expect(TP.timePartFrom_ms(-1 * 3600000 + -2 * 60000 + -3000 + -4)).toEqual(
        { hours: -1, minutes: -2, seconds: -3, milliseconds: -4, }
    );


    // Zero seconds...
    expect(TP.timePartTo_ms(
        { milliseconds: 1, }
    )).toEqual(1);
    expect(TP.timePartFrom_ms(1)).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: 1, }
    );
    expect(TP.timePartTo_ms(
        { milliseconds: -1, }
    )).toEqual(-1);
    expect(TP.timePartFrom_ms(-1)).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: -1, }
    );

    expect(TP.timePartTo_ms(
        { milliseconds: 999, }
    )).toEqual(999);
    expect(TP.timePartFrom_ms(999)).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: 999, }
    );
    expect(TP.timePartTo_ms(
        { milliseconds: -999, }
    )).toEqual(-999);
    expect(TP.timePartFrom_ms(-999)).toEqual(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: -999, }
    );

    // Millisecond rounding
    expect(TP.timePartTo_ms(
        { milliseconds: 999.51, }
    )).toEqual(1000);
    expect(TP.timePartFrom_ms(999.51)).toEqual(
        { hours: 0, minutes: 0, seconds: 1, milliseconds: 0, }
    );
    expect(TP.timePartTo_ms(
        { milliseconds: -999.51, }
    )).toEqual(-1000);
    expect(TP.timePartFrom_ms(-999.51)).toEqual(
        { hours: 0, minutes: 0, seconds: -1, milliseconds: 0, }
    );


    // Wrap around.
    let result;
    result = TP.timePartTo_ms({ hours: 0, minutes: -15, });
    expect(TP.timePartFrom_ms(result, TP.MILLISECONDS_PER_DAY)).toEqual({
        hours: 23, minutes: 45, seconds: 0, milliseconds: 0, }
    );
    result = TP.timePartTo_ms({ hours: -24, minutes: -15, });
    expect(TP.timePartFrom_ms(result, TP.MILLISECONDS_PER_DAY)).toEqual({
        hours: 23, minutes: 45, seconds: 0, milliseconds: 0, }
    );

    result = TP.timePartTo_ms({ hours: 24, minutes: 15, });
    expect(TP.timePartFrom_ms(result, TP.MILLISECONDS_PER_DAY)).toEqual({
        hours: 0, minutes: 15, seconds: 0, milliseconds: 0, }
    );
    result = TP.timePartTo_ms({ hours: 25, minutes: 15, });
    expect(TP.timePartFrom_ms(result, TP.MILLISECONDS_PER_DAY)).toEqual({
        hours: 1, minutes: 15, seconds: 0, milliseconds: 0, }
    );
    result = TP.timePartTo_ms({ hours: 49, minutes: 15, });
    expect(TP.timePartFrom_ms(result, TP.MILLISECONDS_PER_DAY)).toEqual({
        hours: 1, minutes: 15, seconds: 0, milliseconds: 0, }
    );

});


//
//---------------------------------------------------------
//
test('TimePart-compare', () => {
    expect(TP.compareTimeParts()).toBe(0);
    expect(TP.compareTimeParts({}, {})).toBe(0);
    expect(TP.compareTimeParts(undefined, {})).toBeLessThan(0);
    expect(TP.compareTimeParts({}, undefined)).toBeGreaterThan(0);

    expect(TP.compareTimeParts({}, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, })).toBe(0);


    expect(TP.compareTimeParts(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, },
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 5, }
    )).toBeLessThan(0);
    expect(TP.compareTimeParts(
        { hours: -1, minutes: -2, seconds: -3, milliseconds: -4, },
        { hours: -1, minutes: -2, seconds: -3, milliseconds: -5, }
    )).toBeGreaterThan(0);

    expect(TP.compareTimeParts(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 5, },
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, }
    )).toBeGreaterThan(0);
    expect(TP.compareTimeParts(
        { hours: -1, minutes: -2, seconds: -3, milliseconds: -5, },
        { hours: -1, minutes: -2, seconds: -3, milliseconds: -4, },
    )).toBeLessThan(0);
});


//
//---------------------------------------------------------
//
test('TimePart-Date', () => {
    const dateA = new Date(2021, 11, 30, 5, 6, 7, 8);
    expect(TP.applyTimePartToDate({}, dateA)).toEqual(dateA);

    let result;
    result = TP.applyTimePartToDate(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 30, 1, 2, 3, 4));
    expect(TP.timePartFromDate(result)).toEqual(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, }
    );

    result = TP.applyTimePartToDate(
        { hours: 25, minutes: 2, seconds: 3, milliseconds: 4, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 31, 1, 2, 3, 4));
    expect(TP.timePartFromDate(result)).toEqual(
        { hours: 1, minutes: 2, seconds: 3, milliseconds: 4, }
    );


    // Negative values...
    result = TP.applyTimePartToDate(
        { hours: 5, minutes: 6, seconds: 7, milliseconds: -999, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 30, 5, 6, 6, 1));

    result = TP.applyTimePartToDate(
        { hours: 5, minutes: 0, seconds: 0, milliseconds: -1, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 30, 4, 59, 59, 999));

    result = TP.applyTimePartToDate(
        { hours: 0, minutes: 0, seconds: 0, milliseconds: -1, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 29, 23, 59, 59, 999));

    result = TP.applyTimePartToDate(
        { hours: 0, minutes: 0, seconds: -1, milliseconds: 123, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 29, 23, 59, 59, 123));

    result = TP.applyTimePartToDate(
        { hours: 0, minutes: -1, seconds: 1, milliseconds: 123, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 29, 23, 59, 1, 123));

    result = TP.applyTimePartToDate(
        { hours: -1, minutes: 2, seconds: 1, milliseconds: 123, }, 
        new Date(dateA));
    expect(result).toEqual(new Date(2021, 11, 29, 23, 2, 1, 123));


});


//
//---------------------------------------------------------
//
test('TimePart-single filter', () => {

    expect(TP.isTimePartOnOrAfterSingleFilter({},
        { hours: 15, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter({},
        { hours: 15, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(undefined,
        { hours: 15, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(undefined,
        { hours: 15, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();


    const hours = {
        hours: 14,
    };

    // No time part...
    expect(TP.isTimePartOnOrAfterSingleFilter(hours)
    ).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(hours)
    ).toBeFalsy();

    expect(TP.isTimePartOnOrAfterSingleFilter(hours,
        { hours: 14, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(hours,
        { hours: 14, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(hours,
        { hours: 13, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(hours,
        { hours: 13, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(hours,
        { hours: 15, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(hours,
        { hours: 15, minutes: 20, seconds: 25, milliseconds: 30, }
    )).toBeFalsy();
    

    const minutes = {
        minutes: 30,
    };

    expect(TP.isTimePartOnOrAfterSingleFilter(minutes,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(minutes,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(minutes,
        { hours: 14, minutes: 29, seconds: 25, milliseconds: 30, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(minutes,
        { hours: 14, minutes: 29, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(minutes,
        { hours: 14, minutes: 31, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(minutes,
        { hours: 14, minutes: 31, seconds: 25, milliseconds: 30, }
    )).toBeFalsy();


    const seconds = {
        seconds: 25,
    };

    expect(TP.isTimePartOnOrAfterSingleFilter(seconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(seconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 30, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(seconds,
        { hours: 14, minutes: 30, seconds: 24, milliseconds: 30, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(seconds,
        { hours: 14, minutes: 30, seconds: 24, milliseconds: 30, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(seconds,
        { hours: 14, minutes: 30, seconds: 26, milliseconds: 30, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(seconds,
        { hours: 14, minutes: 30, seconds: 26, milliseconds: 30, }
    )).toBeFalsy();


    const milliseconds = {
        milliseconds: 17,
    };

    expect(TP.isTimePartOnOrAfterSingleFilter(milliseconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 17, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(milliseconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 17, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(milliseconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 16, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(milliseconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 16, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(milliseconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 18, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(milliseconds,
        { hours: 14, minutes: 30, seconds: 25, milliseconds: 18, }
    )).toBeFalsy();


    const all = {
        hours: 12,
        minutes: 45,
        seconds: 15,
        milliseconds: 22,
    };

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 15, milliseconds: 22, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 15, milliseconds: 22, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 11, minutes: 45, seconds: 15, milliseconds: 22, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 11, minutes: 45, seconds: 15, milliseconds: 22, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 13, minutes: 45, seconds: 15, milliseconds: 22, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 13, minutes: 45, seconds: 15, milliseconds: 22, }
    )).toBeFalsy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 12, minutes: 44, seconds: 15, milliseconds: 22, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 12, minutes: 44, seconds: 15, milliseconds: 22, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 13, minutes: 44, seconds: 15, milliseconds: 22, }
    )).toBeFalsy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 12, minutes: 46, seconds: 15, milliseconds: 22, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 12, minutes: 46, seconds: 15, milliseconds: 22, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 11, minutes: 46, seconds: 15, milliseconds: 22, }
    )).toBeFalsy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 14, milliseconds: 22, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 14, milliseconds: 22, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 16, milliseconds: 22, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 16, milliseconds: 22, }
    )).toBeFalsy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 15, milliseconds: 21, }
    )).toBeFalsy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 15, milliseconds: 21, }
    )).toBeTruthy();

    expect(TP.isTimePartOnOrAfterSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 15, milliseconds: 23, }
    )).toBeTruthy();
    expect(TP.isTimePartOnOrBeforeSingleFilter(all,
        { hours: 12, minutes: 45, seconds: 15, milliseconds: 23, }
    )).toBeFalsy();
});


//
//---------------------------------------------------------
//
test('TimePart-filter', () => {
    const earliest = {
        earliestTimePart: { hours: 8, },
    };

    expect(TP.isTimePartInFilter(earliest,
        { hours: 8, minutes: 30, seconds: 45, milliseconds: 500, }
    )).toBeTruthy();
    expect(TP.isTimePartInFilter(earliest,
        { hours: 7, minutes: 30, seconds: 45, milliseconds: 500, }
    )).toBeFalsy();

    expect(TP.isTimePartRangeFullyInFilter(earliest,
        { hours: 8, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 10, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeFullyInFilter(earliest,
        { hours: 7, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 10, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeFullyInFilter(earliest,
        { hours: 7, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 6, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeFalsy();

    expect(TP.isTimePartRangeOverlappingFilter(earliest,
        { hours: 8, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 10, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(earliest,
        { hours: 10, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 7, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(earliest,
        { hours: 7, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 6, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeFalsy();


    const latest = {
        latestTimePart: { minutes: 30, },
    };

    expect(TP.isTimePartInFilter(latest,
        { hours: 8, minutes: 30, seconds: 45, milliseconds: 500, }
    )).toBeTruthy();
    expect(TP.isTimePartInFilter(latest,
        { hours: 7, minutes: 31, seconds: 45, milliseconds: 500, }
    )).toBeFalsy();

    expect(TP.isTimePartRangeFullyInFilter(latest,
        { hours: 8, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 10, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeFullyInFilter(latest,
        { hours: 10, minutes: 31, seconds: 45, milliseconds: 500, },
        { hours: 7, minutes: 29, seconds: 45, milliseconds: 500, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeFullyInFilter(latest,
        { hours: 7, minutes: 31, seconds: 45, milliseconds: 500, },
        { hours: 6, minutes: 31, seconds: 45, milliseconds: 500, },
    )).toBeFalsy();

    expect(TP.isTimePartRangeOverlappingFilter(latest,
        { hours: 8, minutes: 30, seconds: 45, milliseconds: 500, },
        { hours: 10, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(latest,
        { hours: 10, minutes: 31, seconds: 45, milliseconds: 500, },
        { hours: 7, minutes: 30, seconds: 45, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(latest,
        { hours: 7, minutes: 31, seconds: 45, milliseconds: 500, },
        { hours: 6, minutes: 32, seconds: 45, milliseconds: 500, },
    )).toBeTruthy();


    const both = {
        earliestTimePart: { seconds: 20, },
        latestTimePart: { seconds: 30, },
    };

    expect(TP.isTimePartInFilter(both,
        { hours: 8, minutes: 30, seconds: 19, milliseconds: 500, }
    )).toBeFalsy();
    expect(TP.isTimePartInFilter(both,
        { hours: 8, minutes: 30, seconds: 20, milliseconds: 500, }
    )).toBeTruthy();
    expect(TP.isTimePartInFilter(both,
        { hours: 8, minutes: 30, seconds: 30, milliseconds: 500, }
    )).toBeTruthy();
    expect(TP.isTimePartInFilter(both,
        { hours: 7, minutes: 31, seconds: 31, milliseconds: 500, }
    )).toBeFalsy();

    expect(TP.isTimePartRangeFullyInFilter(both,
        { hours: 8, minutes: 30, seconds: 19, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 18, milliseconds: 500, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeFullyInFilter(both,
        { hours: 8, minutes: 30, seconds: 19, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 30, milliseconds: 500, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeFullyInFilter(both,
        { hours: 8, minutes: 30, seconds: 20, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 30, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeFullyInFilter(both,
        { hours: 8, minutes: 30, seconds: 20, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 31, milliseconds: 500, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeFullyInFilter(both,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 31, milliseconds: 500, },
    )).toBeFalsy();

    expect(TP.isTimePartRangeOverlappingFilter(both,
        { hours: 8, minutes: 30, seconds: 19, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 18, milliseconds: 500, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeOverlappingFilter(both,
        { hours: 8, minutes: 30, seconds: 20, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 18, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(both,
        { hours: 8, minutes: 30, seconds: 20, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 30, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(both,
        { hours: 8, minutes: 30, seconds: 20, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 31, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(both,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 31, milliseconds: 500, },
    )).toBeFalsy();


    const single = {
        timePart: { milliseconds: 500, },
    };
    expect(TP.isTimePartInFilter(single,
        { hours: 8, minutes: 30, seconds: 19, milliseconds: 499, }
    )).toBeFalsy();
    expect(TP.isTimePartInFilter(single,
        { hours: 8, minutes: 30, seconds: 19, milliseconds: 500, }
    )).toBeTruthy();
    expect(TP.isTimePartInFilter(single,
        { hours: 8, minutes: 30, seconds: 19, milliseconds: 501, }
    )).toBeFalsy();

    expect(TP.isTimePartRangeFullyInFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 499, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeFullyInFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeFullyInFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 501, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
    )).toBeFalsy();

    expect(TP.isTimePartRangeOverlappingFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 499, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 498, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeOverlappingFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 498, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 500, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 501, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(single,
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 501, },
        { hours: 8, minutes: 30, seconds: 32, milliseconds: 502, },
    )).toBeFalsy();
});


//
//---------------------------------------------------------
//
test('TimePart-rangeOverlapFilter', () => {
    const hoursOnly = {
        earliestTimePart: { hours: 10, },
        latestTimePart: { hours: 15, },
    };
    expect(TP.isTimePartRangeOverlappingFilter(hoursOnly,
        { hours: 9, minutes: 0, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 0, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(hoursOnly,
        { hours: 16, minutes: 0, seconds: 0, milliseconds: 0, },
        { hours: 15, minutes: 0, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(hoursOnly,
        { hours: 16, minutes: 0, seconds: 0, milliseconds: 0, },
        { hours: 17, minutes: 0, seconds: 0, milliseconds: 0, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeOverlappingFilter(hoursOnly,
        { hours: 8, minutes: 0, seconds: 0, milliseconds: 0, },
        { hours: 9, minutes: 59, seconds: 59, milliseconds: 999, },
    )).toBeFalsy();


    //
    // Minutes only...
    const minutesOnly = {
        earliestTimePart: { minutes: 20, },
        latestTimePart: { minutes: 30, },
    };

    // Same hour
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 10, minutes: 30, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 10, minutes: 0, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 10, minutes: 30, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 40, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 10, minutes: 0, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 19, seconds: 0, milliseconds: 0, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 10, minutes: 31, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 32, seconds: 0, milliseconds: 0, },
    )).toBeFalsy();

    // 1 hour difference
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 9, minutes: 30, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 9, minutes: 30, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 19, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 9, minutes: 31, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 9, minutes: 31, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 19, seconds: 0, milliseconds: 0, },
    )).toBeFalsy();

    // 2 hour difference
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnly,
        { hours: 9, minutes: 31, seconds: 0, milliseconds: 0, },
        { hours: 11, minutes: 19, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();


    const minutesOnlyRollover = {
        earliestTimePart: { minutes: 40, },
        latestTimePart: { minutes: 20, },
    };
    // Valid range is 40 to 60, 0 to 20.

    // Same hour
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnlyRollover,
        { hours: 10, minutes: 0, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 1, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnlyRollover,
        { hours: 10, minutes: 40, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnlyRollover,
        { hours: 10, minutes: 21, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 40, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnlyRollover,
        { hours: 10, minutes: 20, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 39, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnlyRollover,
        { hours: 10, minutes: 21, seconds: 0, milliseconds: 0, },
        { hours: 10, minutes: 39, seconds: 0, milliseconds: 0, },
    )).toBeFalsy();

    // 1 hour difference, always true
    expect(TP.isTimePartRangeOverlappingFilter(minutesOnlyRollover,
        { hours: 10, minutes: 21, seconds: 0, milliseconds: 0, },
        { hours: 11, minutes: 39, seconds: 0, milliseconds: 0, },
    )).toBeTruthy();


    //
    // Seconds only...
    const secondsOnly = {
        earliestTimePart: { seconds: 20, },
        latestTimePart: { seconds: 30, },
    };

    // Same minute
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 20, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 19, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 20, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 1, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 19, milliseconds: 0, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 32, milliseconds: 0, },
    )).toBeFalsy();

    // 1 minute difference
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 0, },
        { hours: 10, minutes: 21, seconds: 20, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 0, },
        { hours: 10, minutes: 21, seconds: 20, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 0, },
        { hours: 10, minutes: 21, seconds: 19, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 0, },
        { hours: 10, minutes: 21, seconds: 19, milliseconds: 0, },
    )).toBeFalsy();

    // 1 minute difference hour rollover
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 59, seconds: 31, milliseconds: 0, },
        { hours: 11, minutes: 0, seconds: 19, milliseconds: 0, },
    )).toBeFalsy();

    // 2 minute difference
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnly,
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 0, },
        { hours: 10, minutes: 22, seconds: 19, milliseconds: 0, },
    )).toBeTruthy();


    const secondsOnlyRollover = {
        earliestTimePart: { seconds: 40, },
        latestTimePart: { seconds: 20, },
    };
    // Valid seconds are from 40 to 60 and 0 to 20

    // Same minute
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 20, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 40, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 21, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 40, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 20, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 39, milliseconds: 0, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 21, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 39, milliseconds: 0, },
    )).toBeFalsy();

    // 1 minute difference, always true
    expect(TP.isTimePartRangeOverlappingFilter(secondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 21, milliseconds: 0, },
        { hours: 10, minutes: 21, seconds: 39, milliseconds: 0, },
    )).toBeTruthy();


    //
    // Milliseconds only
    const millisecondsOnly = {
        earliestTimePart: { milliseconds: 300, },
        latestTimePart: { milliseconds: 600, },
    };

    // Same second
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 300, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 600, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 0, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 300, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 900, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 600, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 299, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 0, },
    )).toBeFalsy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 900, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 601, },
    )).toBeFalsy();

    // 1 second difference
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 600, },
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 300, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 600, },
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 299, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 601, },
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 300, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 601, },
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 299, },
    )).toBeFalsy();

    // 1 second differenc with 1 minute rollover
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 59, milliseconds: 601, },
        { hours: 10, minutes: 21, seconds: 0, milliseconds: 299, },
    )).toBeFalsy();

    // 2 second difference, always true
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnly,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 601, },
        { hours: 10, minutes: 20, seconds: 32, milliseconds: 299, },
    )).toBeTruthy();


    const millisecondsOnlyRollover = {
        earliestTimePart: { milliseconds: 700, },
        latestTimePart: { milliseconds: 200, },
    };
    // Valid times are 700 to 1000, 0 to 200
    // Same second
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 200, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 700, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 201, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 700, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 200, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 699, },
    )).toBeTruthy();
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 201, },
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 699, },
    )).toBeFalsy();

    // 1 second difference, always true.
    expect(TP.isTimePartRangeOverlappingFilter(millisecondsOnlyRollover,
        { hours: 10, minutes: 20, seconds: 30, milliseconds: 201, },
        { hours: 10, minutes: 20, seconds: 31, milliseconds: 699, },
    )).toBeTruthy();
});


//
//---------------------------------------------------------
//
test('TimePart-isFilter', () => {
    expect(TP.isTimePartSingleFilter()
    ).toBeFalsy();
    expect(TP.isTimePartSingleFilter({})
    ).toBeFalsy();

    expect(TP.isTimePartSingleFilter(
        { hours: 12, }
    )).toBeTruthy();
    expect(TP.isTimePartSingleFilter(
        { hours: '12', }
    )).toBeFalsy();

    expect(TP.isTimePartSingleFilter(
        { minutes: 6, }
    )).toBeTruthy();
    expect(TP.isTimePartSingleFilter(
        { minutes: '6', }
    )).toBeFalsy();

    expect(TP.isTimePartSingleFilter(
        { seconds: 2, }
    )).toBeTruthy();
    expect(TP.isTimePartSingleFilter(
        { seconds: '2', }
    )).toBeFalsy();


    expect(TP.isTimePartFilter()
    ).toBeFalsy();
    expect(TP.isTimePartFilter({})
    ).toBeFalsy();

    expect(TP.isTimePartFilter({
        earliestTimePart: { milliseconds: 202, },
    }
    )).toBeTruthy();
    expect(TP.isTimePartFilter({
        earliestTimePart: { milliseconds: '202', },
    }
    )).toBeFalsy();

    expect(TP.isTimePartFilter({
        latestTimePart: { hours: 3, },
    }
    )).toBeTruthy();
    expect(TP.isTimePartFilter({
        latestTimePart: { hours: '3', },
    }
    )).toBeFalsy();

    expect(TP.isTimePartFilter({
        timePart: { minutes: 3, },
    }
    )).toBeTruthy();
    expect(TP.isTimePartFilter({
        timePart: { minutes: '3', },
    }
    )).toBeFalsy();
});