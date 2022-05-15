import * as DP from './DatePart';


//
//---------------------------------------------------------
//
test('DatePart-clean', () => {
    // undefined is undefined.
    expect(DP.cleanDatePart()).toBeUndefined();
    
    // Same object if all valid.
    const datePartA = { year: 2021, month: 11, dayOfMonth: 29, };
    expect(DP.cleanDatePart(datePartA)).toBe(datePartA);

    // Wrap around year.
    expect(DP.cleanDatePart({ year: 2021, month: 11, dayOfMonth: 32, })).toEqual(
        { year: 2022, month: 0, dayOfMonth: 1, }
    );

    // Wrap around leap day
    expect(DP.cleanDatePart({ year: 2020, month: 1, dayOfMonth: 29, })).toEqual(
        { year: 2020, month: 1, dayOfMonth: 29, }
    );
    expect(DP.cleanDatePart({ year: 2021, month: 1, dayOfMonth: 29, })).toEqual(
        { year: 2021, month: 2, dayOfMonth: 1, }
    );


    // Missing parts
    const today = new Date();
    const defYear = today.getFullYear();
    const defMonth = today.getMonth();
    const defDayOfMonth = today.getDate();

    expect(DP.cleanDatePart({})).toEqual(
        { year: defYear, month: defMonth, dayOfMonth: defDayOfMonth, }
    );

    // Need to make sure year is a leap year, otherwise this could fail if the test
    // is run on an actual leap day.
    expect(DP.cleanDatePart({year: 2000, })).toEqual(
        { year: 2000, month: defMonth, dayOfMonth: defDayOfMonth, }
    );
    expect(DP.cleanDatePart({month: 1, dayOfMonth: 28, })).toEqual(
        { year: defYear, month: 1, dayOfMonth: 28, }
    );
});


//
//---------------------------------------------------------
//
test('DatePart-String', () => {
    expect(DP.datePartToString({ year: 2021, month: 11, dayOfMonth: 29, }))
        .toEqual('2021-12-29');
    
    expect(DP.datePartFromString('2021-12-29')).toEqual({
        year: 2021,
        month: 11,
        dayOfMonth: 29
    });

    // Invalid strings return undefined.
    expect(DP.datePartFromString('2021-12')).toBeUndefined();
    expect(DP.datePartFromString('2021a12-29')).toBeUndefined();


    const today = new Date();
    const defYear = today.getFullYear();
    //const defMonth = today.getMonth();
    const defDayOfMonth = today.getDate();

    // Default parts...
    let ref = DP.datePartToString({
        year: defYear,
        month: 0,
        dayOfMonth: defDayOfMonth,
    });
    expect(DP.datePartToString({ month: 0, })).toEqual(ref);

    expect(DP.datePartToString()).toBeUndefined();
});


//
//---------------------------------------------------------
//
test('DatePart-Date', () => {
    let refDatePart = { year: 2021, month: 11, dayOfMonth: 29, };
    let refDate = new Date(refDatePart.year, refDatePart.month, refDatePart.dayOfMonth);

    expect(DP.datePartToDate(refDatePart)).toEqual(refDate);
    expect(DP.datePartFromDate(refDate)).toEqual(refDatePart);


    refDatePart = { year: 2021, month: 2, dayOfMonth: 1, };
    refDate = new Date(refDatePart.year, refDatePart.month, refDatePart.dayOfMonth);
    expect(DP.datePartToDate({ year: 2021, month: 1, dayOfMonth: 29, })).toEqual(refDate);
    expect(DP.datePartFromDate(new Date(2021, 1, 29))).toEqual(refDatePart);
});


//
//---------------------------------------------------------
//
test('DatePart-Compare', () => {
    const datePartA = { year: 2021, month: 11, dayOfMonth: 1, };
    const datePartB = { year: 2021, month: 11, dayOfMonth: 2, };
    const datePartC = { year: 2021, month: 11, dayOfMonth: 1, };
    expect(DP.compareDateParts(datePartA, datePartA)).toBe(0);
    expect(DP.compareDateParts(datePartA, datePartB)).toBeLessThan(0);
    expect(DP.compareDateParts(datePartB, datePartA)).toBeGreaterThan(0);
    expect(DP.compareDateParts(datePartA, datePartC)).toBe(0);
});


//
//---------------------------------------------------------
//
test('DatePart-Add', () => {
    const datePartA = { year: 2020, month: 1, dayOfMonth: 29, };    // Leap day.
    expect(DP.addDays(datePartA, 365)).toEqual({
        year: 2021, month: 1, dayOfMonth: 28
    });
    expect(DP.addDays(datePartA, -365)).toEqual({
        year: 2019, month: 2, dayOfMonth: 1
    });

    // Return arg datePart if deltaDays is 0.
    expect(DP.addDays(datePartA, 0)).toBe(datePartA);
});


//
//---------------------------------------------------------
//
test('DatePart-addMonths', () => {
    expect(DP.addMonths({ year: 2020, month: 1, dayOfMonth: 21, }, 1)).toEqual(
        { year: 2020, month: 2, dayOfMonth: 21, }
    );
    expect(DP.addMonths({ year: 2020, month: 1, dayOfMonth: 21, }, -1)).toEqual(
        { year: 2020, month: 0, dayOfMonth: 21, }
    );

    expect(DP.addMonths({ year: 2020, month: 1, dayOfMonth: 21, }, 12)).toEqual(
        { year: 2021, month: 1, dayOfMonth: 21, }
    );
    expect(DP.addMonths({ year: 2020, month: 1, dayOfMonth: 21, }, -12)).toEqual(
        { year: 2019, month: 1, dayOfMonth: 21, }
    );
    expect(DP.addMonths({ year: 2020, month: 1, dayOfMonth: 21, }, 13)).toEqual(
        { year: 2021, month: 2, dayOfMonth: 21, }
    );
    expect(DP.addMonths({ year: 2020, month: 1, dayOfMonth: 21, }, -13)).toEqual(
        { year: 2019, month: 0, dayOfMonth: 21, }
    );
    expect(DP.addMonths({ year: 2020, month: 11, dayOfMonth: 21, }, 25)).toEqual(
        { year: 2023, month: 0, dayOfMonth: 21, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 21, }, -25)).toEqual(
        { year: 2017, month: 11, dayOfMonth: 21, }
    );

    // Pin to last DOM
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 1)).toEqual(     // leap year
        { year: 2020, month: 1, dayOfMonth: 29, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 2)).toEqual(
        { year: 2020, month: 2, dayOfMonth: 31, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 3)).toEqual(
        { year: 2020, month: 3, dayOfMonth: 30, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 4)).toEqual(
        { year: 2020, month: 4, dayOfMonth: 31, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 5)).toEqual(
        { year: 2020, month: 5, dayOfMonth: 30, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 6)).toEqual(
        { year: 2020, month: 6, dayOfMonth: 31, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 7)).toEqual(
        { year: 2020, month: 7, dayOfMonth: 31, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 8)).toEqual(
        { year: 2020, month: 8, dayOfMonth: 30, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 9)).toEqual(
        { year: 2020, month: 9, dayOfMonth: 31, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 10)).toEqual(
        { year: 2020, month: 10, dayOfMonth: 30, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 11)).toEqual(
        { year: 2020, month: 11, dayOfMonth: 31, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 12)).toEqual(
        { year: 2021, month: 0, dayOfMonth: 31, }
    );
    expect(DP.addMonths({ year: 2020, month: 0, dayOfMonth: 31, }, 13)).toEqual(     // to non-leap year
        { year: 2021, month: 1, dayOfMonth: 28, }
    );
});


//
//---------------------------------------------------------
//
test('DatePart-addYears', () => {
    expect(DP.addYears({ year: 2020, month: 1, dayOfMonth: 29, }, 1)).toEqual(
        { year: 2021, month: 1, dayOfMonth: 28, }
    );
    expect(DP.addYears({ year: 2020, month: 1, dayOfMonth: 29, }, -1)).toEqual(
        { year: 2019, month: 1, dayOfMonth: 28, }
    );

    expect(DP.addYears({ year: 2020, month: 1, dayOfMonth: 1, }, 10)).toEqual(
        { year: 2030, month: 1, dayOfMonth: 1, }
    );
    expect(DP.addYears({ year: 2020, month: 1, dayOfMonth: 1, }, -10)).toEqual(
        { year: 2010, month: 1, dayOfMonth: 1, }
    );

    // Add to another leap year should still be leap day
    expect(DP.addYears({ year: 2020, month: 1, dayOfMonth: 29, }, 4)).toEqual(
        { year: 2024, month: 1, dayOfMonth: 29, }
    );
    expect(DP.addYears({ year: 2020, month: 1, dayOfMonth: 29, }, -4)).toEqual(
        { year: 2016, month: 1, dayOfMonth: 29, }
    );
});


//
//---------------------------------------------------------
//
test('DatePart-same', () => {
    expect(DP.areDatePartsIdentical(
        { year: 2022, month: 3, dayOfMonth: 1, },
        { year: 2022, month: 3, dayOfMonth: 1, },
    )).toBeTruthy();

    expect(DP.areDatePartsIdentical(
        { year: 2022, month: 3, dayOfMonth: 1, },
        { year: 2022, month: 3, dayOfMonth: 2, },
    )).toBeFalsy();

    expect(DP.areDatePartsIdentical(
        { year: 2022, month: 3, dayOfMonth: 1, },
        { year: 2022, month: 4, dayOfMonth: 1, },
    )).toBeFalsy();

    expect(DP.areDatePartsIdentical(
        { year: 2022, month: 3, dayOfMonth: 1, },
        { year: 2021, month: 3, dayOfMonth: 1, },
    )).toBeFalsy();

    expect(DP.areDatePartsIdentical(
        { year: 2022, month: 2, dayOfMonth: 32, },
        { year: 2021, month: 3, dayOfMonth: 1, },
    )).toBeFalsy();


    expect(DP.areDatePartsEquivalent(
        { year: 2022, month: 2, dayOfMonth: 32, },
        { year: 2022, month: 3, dayOfMonth: 1, },
    )).toBeTruthy();

    expect(DP.areDatePartsEquivalent(
        { year: 2022, month: 2, dayOfMonth: 33, },
        { year: 2022, month: 3, dayOfMonth: 1, },
    )).toBeFalsy();

    expect(DP.areDatePartsEquivalent(
        { year: 2022, month: 3, dayOfMonth: 32, },
        { year: 2022, month: 3, dayOfMonth: 1, },
    )).toBeFalsy();
});


//
//---------------------------------------------------------
//
test('DatePart-Delta', () => {
    expect(DP.deltaDays(
        { year: 2020, month: 1, dayOfMonth: 28, },
        { year: 2020, month: 1, dayOfMonth: 29, },
    )).toEqual(1);
    expect(DP.deltaDays(
        { year: 2020, month: 1, dayOfMonth: 29, },
        { year: 2020, month: 1, dayOfMonth: 28, },
    )).toEqual(-1);

    expect(DP.deltaDays(
        { year: 2020, month: 1, dayOfMonth: 1, },
        { year: 2020, month: 2, dayOfMonth: 1, },
    )).toEqual(29);

    expect(DP.deltaDays(
        { year: 2021, month: 1, dayOfMonth: 1, },
        { year: 2021, month: 2, dayOfMonth: 1, },
    )).toEqual(28);

    expect(DP.deltaDays(
        { year: 2020, month: 2, dayOfMonth: 1, },
        { year: 2019, month: 2, dayOfMonth: 1, },
    )).toEqual(-366);
});


//
//---------------------------------------------------------
//
test('DatePart-closestSunday', () => {
    expect(DP.getClosestSundayOnOrBefore()).toBeUndefined();

    expect(DP.getClosestSundayOnOrBefore(
        { year: 2022, month: 3, dayOfMonth: 17, }
    )).toEqual({ year: 2022, month: 3, dayOfMonth: 17, });

    expect(DP.getClosestSundayOnOrBefore(
        { year: 2022, month: 3, dayOfMonth: 18, }
    )).toEqual({ year: 2022, month: 3, dayOfMonth: 17, });

    expect(DP.getClosestSundayOnOrBefore(
        { year: 2022, month: 3, dayOfMonth: 23, }
    )).toEqual({ year: 2022, month: 3, dayOfMonth: 17, });

    expect(DP.getClosestSundayOnOrBefore(
        { year: 2022, month: 3, dayOfMonth: 24, }
    )).toEqual({ year: 2022, month: 3, dayOfMonth: 24, });
});


//
//---------------------------------------------------------
//
test('DatePart-single filter', () => {
    //
    // No filter parts
    expect(DP.isDatePartOnOrAfterSingleFilter({}, { year: 2020, month: 0, dayOfMonth: 13, }
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter({}, { year: 2020, month: 0, dayOfMonth: 13, }
    )).toBeTruthy();
    expect(DP.isDatePartOnOrAfterSingleFilter(undefined, { year: 2020, month: 0, dayOfMonth: 13, }
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(undefined, { year: 2020, month: 0, dayOfMonth: 13, }
    )).toBeTruthy();


    const year = {
        year: 2000,
    };

    // No date part
    expect(DP.isDatePartOnOrAfterSingleFilter(year)
    ).toBeFalsy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(year)
    ).toBeFalsy();

    expect(DP.isDatePartOnOrAfterSingleFilter(year,
        { year: 2000, month: 0, dayOfMonth: 1}
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(year,
        { year: 2000, month: 0, dayOfMonth: 1}
    )).toBeTruthy();

    expect(DP.isDatePartOnOrAfterSingleFilter(year,
        { year: 2001, month: 0, dayOfMonth: 1}
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(year,
        { year: 2001, month: 0, dayOfMonth: 1}
    )).toBeFalsy();
    
    expect(DP.isDatePartOnOrAfterSingleFilter(year,
        { year: 1999, month: 0, dayOfMonth: 1}
    )).toBeFalsy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(year,
        { year: 1999, month: 0, dayOfMonth: 1}
    )).toBeTruthy();
   


    const month = {
        month: 3,
    };

    expect(DP.isDatePartOnOrAfterSingleFilter(month,
        { year: 2000, month: 3, dayOfMonth: 1}
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(month,
        { year: 2000, month: 3, dayOfMonth: 1}
    )).toBeTruthy();

    expect(DP.isDatePartOnOrAfterSingleFilter(month,
        { year: 2000, month: 4, dayOfMonth: 1}
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(month,
        { year: 2000, month: 4, dayOfMonth: 1}
    )).toBeFalsy();

    expect(DP.isDatePartOnOrAfterSingleFilter(month,
        { year: 2000, month: 2, dayOfMonth: 1}
    )).toBeFalsy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(month,
        { year: 2000, month: 2, dayOfMonth: 1}
    )).toBeTruthy();
            

    //
    // Day of month only
    const dayOfMonth = {
        dayOfMonth: 13,
    };

    expect(DP.isDatePartOnOrAfterSingleFilter(dayOfMonth,
        { year: 2000, month: 3, dayOfMonth: 13, }
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(dayOfMonth,
        { year: 2000, month: 3, dayOfMonth: 13, }
    )).toBeTruthy();

    expect(DP.isDatePartOnOrAfterSingleFilter(dayOfMonth,
        { year: 2000, month: 3, dayOfMonth: 14, }
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(dayOfMonth,
        { year: 2000, month: 3, dayOfMonth: 14, }
    )).toBeFalsy();

    expect(DP.isDatePartOnOrAfterSingleFilter(dayOfMonth,
        { year: 2000, month: 3, dayOfMonth: 12, }
    )).toBeFalsy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(dayOfMonth,
        { year: 2000, month: 3, dayOfMonth: 12, }
    )).toBeTruthy();


    //
    // All three
    const all = {
        year: 2020,
        month: 5,
        dayOfMonth: 14,
    };

    expect(DP.isDatePartOnOrAfterSingleFilter(all,
        { year: 2020, month: 5, dayOfMonth: 14, }
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(all,
        { year: 2020, month: 5, dayOfMonth: 14, }
    )).toBeTruthy();

    expect(DP.isDatePartOnOrAfterSingleFilter(all,
        { year: 2020, month: 5, dayOfMonth: 15, }
    )).toBeTruthy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(all,
        { year: 2020, month: 5, dayOfMonth: 15, }
    )).toBeFalsy();

    expect(DP.isDatePartOnOrAfterSingleFilter(all,
        { year: 2020, month: 5, dayOfMonth: 13, }
    )).toBeFalsy();
    expect(DP.isDatePartOnOrBeforeSingleFilter(all,
        { year: 2020, month: 5, dayOfMonth: 13, }
    )).toBeTruthy();

});


//
//---------------------------------------------------------
//
test('DatePart-filter', () => {
    // No filter
    expect(DP.isDatePartInFilter({},
        { year: 2020, month: 3, dayOfMonth: 1, })
    ).toBeTruthy();
    expect(DP.isDatePartInFilter(undefined,
        { year: 2020, month: 3, dayOfMonth: 1, })
    ).toBeTruthy();

    const earliest = {
        earliestDatePart: { year: 2020, month: 3, },
    };

    // No datePart
    expect(DP.isDatePartInFilter(earliest)).toBeFalsy();
    expect(DP.isDatePartRangeFullyInFilter(earliest)).toBeFalsy();
    expect(DP.isDatePartRangeOverlappingFilter(earliest)).toBeFalsy();

    expect(DP.isDatePartInFilter(earliest,
        { year: 2020, month: 3, dayOfMonth: 1, }
    )).toBeTruthy();
    expect(DP.isDatePartInFilter(earliest,
        { year: 2020, month: 2, dayOfMonth: 1, }
    )).toBeFalsy();

    expect(DP.isDatePartRangeFullyInFilter(earliest,
        { year: 2020, month: 3, dayOfMonth: 1, },
        { year: 2020, month: 4, dayOfMonth: 1, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeFullyInFilter(earliest,
        { year: 2020, month: 3, dayOfMonth: 1, },
        { year: 2020, month: 2, dayOfMonth: 1, },
    )).toBeFalsy();

    expect(DP.isDatePartRangeOverlappingFilter(earliest,
        { year: 2020, month: 3, dayOfMonth: 1, },
        { year: 2020, month: 4, dayOfMonth: 1, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(earliest,
        { year: 2020, month: 3, dayOfMonth: 1, },
        { year: 2020, month: 2, dayOfMonth: 1, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(earliest,
        { year: 2020, month: 2, dayOfMonth: 1, },
        { year: 2020, month: 1, dayOfMonth: 1, },
    )).toBeFalsy();


    const latest = {
        latestDatePart: { year: 2020, dayOfMonth: 15, },
    };

    expect(DP.isDatePartInFilter(latest,
        { year: 2020, month: 3, dayOfMonth: 15, }
    )).toBeTruthy();
    expect(DP.isDatePartInFilter(latest,
        { year: 2020, month: 2, dayOfMonth: 16, }
    )).toBeFalsy();

    expect(DP.isDatePartRangeFullyInFilter(latest,
        { year: 2020, month: 3, dayOfMonth: 15, },
        { year: 2020, month: 4, dayOfMonth: 14, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeFullyInFilter(latest,
        { year: 2020, month: 3, dayOfMonth: 15, },
        { year: 2020, month: 2, dayOfMonth: 16, },
    )).toBeFalsy();

    expect(DP.isDatePartRangeOverlappingFilter(latest,
        { year: 2020, month: 3, dayOfMonth: 14, },
        { year: 2020, month: 4, dayOfMonth: 16, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(latest,
        { year: 2020, month: 3, dayOfMonth: 14, },
        { year: 2020, month: 2, dayOfMonth: 15, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(latest,
        { year: 2020, month: 2, dayOfMonth: 16, },
        { year: 2020, month: 1, dayOfMonth: 17, },
    )).toBeTruthy();


    const both = {
        earliestDatePart: { dayOfMonth: 10, },
        latestDatePart: { dayOfMonth: 20, },
    };

    expect(DP.isDatePartInFilter(both,
        { year: 2020, month: 3, dayOfMonth: 9, }
    )).toBeFalsy();
    expect(DP.isDatePartInFilter(both,
        { year: 2020, month: 2, dayOfMonth: 10, }
    )).toBeTruthy();
    expect(DP.isDatePartInFilter(both,
        { year: 2020, month: 2, dayOfMonth: 20, }
    )).toBeTruthy();
    expect(DP.isDatePartInFilter(both,
        { year: 2020, month: 2, dayOfMonth: 21, }
    )).toBeFalsy();

    expect(DP.isDatePartRangeFullyInFilter(both,
        { year: 2020, month: 3, dayOfMonth: 20, },
        { year: 2020, month: 4, dayOfMonth: 10, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeFullyInFilter(both,
        { year: 2020, month: 3, dayOfMonth: 9, },
        { year: 2020, month: 2, dayOfMonth: 20, },
    )).toBeFalsy();
    expect(DP.isDatePartRangeFullyInFilter(both,
        { year: 2020, month: 3, dayOfMonth: 10, },
        { year: 2020, month: 2, dayOfMonth: 21, },
    )).toBeFalsy();

    expect(DP.isDatePartRangeOverlappingFilter(both,
        { year: 2020, month: 3, dayOfMonth: 9, },
        { year: 2020, month: 3, dayOfMonth: 10, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(both,
        { year: 2020, month: 3, dayOfMonth: 9, },
        { year: 2020, month: 3, dayOfMonth: 21, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(both,
        { year: 2020, month: 3, dayOfMonth: 11, },
        { year: 2020, month: 3, dayOfMonth: 19, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(both,
        { year: 2020, month: 3, dayOfMonth: 20, },
        { year: 2020, month: 3, dayOfMonth: 21, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(both,
        { year: 2020, month: 2, dayOfMonth: 8, },
        { year: 2020, month: 2, dayOfMonth: 9, },
    )).toBeFalsy();
    expect(DP.isDatePartRangeOverlappingFilter(both,
        { year: 2020, month: 2, dayOfMonth: 21, },
        { year: 2020, month: 2, dayOfMonth: 22, },
    )).toBeFalsy();


    //
    // Single date.
    const single = {
        datePart: { year: 2020, month: 3, },
    };

    expect(DP.isDatePartInFilter(single,
        { year: 2020, month: 3, dayOfMonth: 9, }
    )).toBeTruthy();
    expect(DP.isDatePartInFilter(single,
        { year: 2020, month: 2, dayOfMonth: 9, }
    )).toBeFalsy();
    expect(DP.isDatePartInFilter(single,
        { year: 2020, month: 4, dayOfMonth: 9, }
    )).toBeFalsy();

});


//
//---------------------------------------------------------
//
test('DatePart-rangeOverlapFilter', () => {
    //
    // Year only...
    const yearOnly = {
        earliestDatePart: { year: 2020, },
        latestDatePart: { year: 2021, },
    };
    expect(DP.isDatePartRangeOverlappingFilter(yearOnly,
        { year: 2020, month: 0, dayOfMonth: 1, },
        { year: 2021, month: 11, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(yearOnly,
        { year: 2020, month: 0, dayOfMonth: 1, },
        { year: 2019, month: 11, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(yearOnly,
        { year: 2019, month: 0, dayOfMonth: 1, },
        { year: 2019, month: 11, dayOfMonth: 31, },
    )).toBeFalsy();
    expect(DP.isDatePartRangeOverlappingFilter(yearOnly,
        { year: 2022, month: 0, dayOfMonth: 1, },
        { year: 2021, month: 11, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(yearOnly,
        { year: 2022, month: 0, dayOfMonth: 1, },
        { year: 2022, month: 11, dayOfMonth: 31, },
    )).toBeFalsy();


    //
    // Month only...
    const monthOnlyA = {
        earliestDatePart: { month: 3, },
        latestDatePart: { month: 6, },
    };
    // Same year
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 3, dayOfMonth: 1, },
        { year: 2020, month: 6, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 2, dayOfMonth: 1, },
        { year: 2020, month: 3, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 2, dayOfMonth: 1, },
        { year: 2020, month: 1, dayOfMonth: 31, },
    )).toBeFalsy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 6, dayOfMonth: 1, },
        { year: 2020, month: 7, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 7, dayOfMonth: 1, },
        { year: 2020, month: 8, dayOfMonth: 31, },
    )).toBeFalsy();

    // One year difference
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 7, dayOfMonth: 31, },
        { year: 2021, month: 3, dayOfMonth: 1, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 6, dayOfMonth: 31, },
        { year: 2021, month: 2, dayOfMonth: 1, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 7, dayOfMonth: 31, },
        { year: 2021, month: 2, dayOfMonth: 1, },
    )).toBeFalsy();

    // Two year difference...
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyA,
        { year: 2020, month: 7, dayOfMonth: 31, },
        { year: 2022, month: 2, dayOfMonth: 1, },
    )).toBeTruthy();

    //
    // Month roll-over.
    const monthOnlyRollover = {
        earliestDatePart: { month: 9, },
        latestDatePart: { month: 3, },
    };
    // Valid months are 9-11, 0-3

    // Same year
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyRollover,
        { year: 2020, month: 4, dayOfMonth: 1, },
        { year: 2020, month: 9, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyRollover,
        { year: 2020, month: 3, dayOfMonth: 1, },
        { year: 2020, month: 8, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyRollover,
        { year: 2020, month: 4, dayOfMonth: 1, },
        { year: 2020, month: 8, dayOfMonth: 31, },
    )).toBeFalsy();

    // One year difference.
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyRollover,
        { year: 2020, month: 4, dayOfMonth: 1, },
        { year: 2021, month: 8, dayOfMonth: 31, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(monthOnlyRollover,
        { year: 2020, month: 10, dayOfMonth: 1, },
        { year: 2021, month: 2, dayOfMonth: 31, },
    )).toBeTruthy();


    //
    // Day only
    const dayOfMonthOnly = {
        earliestDatePart: { dayOfMonth: 15, },
        latestDatePart: { dayOfMonth: 20, },
    };

    // Same month
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 15, },
        { year: 2020, month: 4, dayOfMonth: 20, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 15, },
        { year: 2020, month: 4, dayOfMonth: 12, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 14, },
        { year: 2020, month: 4, dayOfMonth: 12, },
    )).toBeFalsy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 21, },
        { year: 2020, month: 4, dayOfMonth: 20, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 21, },
        { year: 2020, month: 4, dayOfMonth: 21, },
    )).toBeFalsy();

    // 1 Month difference
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 20, },
        { year: 2020, month: 5, dayOfMonth: 14, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 21, },
        { year: 2020, month: 5, dayOfMonth: 15, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 21, },
        { year: 2020, month: 5, dayOfMonth: 14, },
    )).toBeFalsy();

    // 1 Month difference year roll-over...
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2019, month: 11, dayOfMonth: 21, },
        { year: 2020, month: 0, dayOfMonth: 14, },
    )).toBeFalsy();


    // 2 Month difference
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthOnly,
        { year: 2020, month: 4, dayOfMonth: 21, },
        { year: 2020, month: 6, dayOfMonth: 14, },
    )).toBeTruthy();


    const dayOfMonthRollover = {
        earliestDatePart: { dayOfMonth: 20, },
        latestDatePart: { dayOfMonth: 15, },
    };
    // Valid is from 20th through end of month and 1st through 15 of following month.

    // Same month
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthRollover,
        { year: 2020, month: 4, dayOfMonth: 15, },
        { year: 2020, month: 4, dayOfMonth: 20, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthRollover,
        { year: 2020, month: 4, dayOfMonth: 16, },
        { year: 2020, month: 4, dayOfMonth: 20, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthRollover,
        { year: 2020, month: 4, dayOfMonth: 16, },
        { year: 2020, month: 4, dayOfMonth: 19, },
    )).toBeFalsy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthRollover,
        { year: 2020, month: 4, dayOfMonth: 15, },
        { year: 2020, month: 4, dayOfMonth: 19, },
    )).toBeTruthy();

    // One month difference
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthRollover,
        { year: 2020, month: 4, dayOfMonth: 20, },
        { year: 2020, month: 5, dayOfMonth: 15, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthRollover,
        { year: 2020, month: 4, dayOfMonth: 19, },
        { year: 2020, month: 5, dayOfMonth: 16, },
    )).toBeTruthy();
    expect(DP.isDatePartRangeOverlappingFilter(dayOfMonthRollover,
        { year: 2020, month: 4, dayOfMonth: 16, },
        { year: 2020, month: 5, dayOfMonth: 19, },
    )).toBeTruthy();
});


//
//---------------------------------------------------------
//
test('DatePart-isFilter', () => {
    expect(DP.isDatePartSingleFilter()
    ).toBeFalsy();
    expect(DP.isDatePartSingleFilter({})
    ).toBeFalsy();

    expect(DP.isDatePartSingleFilter(
        { year: 2021, }
    )).toBeTruthy();
    expect(DP.isDatePartSingleFilter(
        { year: '2021', }
    )).toBeFalsy();

    expect(DP.isDatePartSingleFilter(
        { month: 6, }
    )).toBeTruthy();
    expect(DP.isDatePartSingleFilter(
        { month: '6', }
    )).toBeFalsy();

    expect(DP.isDatePartSingleFilter(
        { dayOfMonth: 2, }
    )).toBeTruthy();
    expect(DP.isDatePartSingleFilter(
        { dayOfMonth: '2', }
    )).toBeFalsy();


    expect(DP.isDatePartFilter()
    ).toBeFalsy();
    expect(DP.isDatePartFilter({})
    ).toBeFalsy();

    expect(DP.isDatePartFilter({
        earliestDatePart: { year: 2022, },
    }
    )).toBeTruthy();
    expect(DP.isDatePartFilter({
        earliestDatePart: { year: '2022', },
    }
    )).toBeFalsy();

    expect(DP.isDatePartFilter({
        latestDatePart: { month: 3, },
    }
    )).toBeTruthy();
    expect(DP.isDatePartFilter({
        latestDatePart: { month: '3', },
    }
    )).toBeFalsy();

    expect(DP.isDatePartFilter({
        datePart: { dayOfMonth: 3, },
    }
    )).toBeTruthy();
    expect(DP.isDatePartFilter({
        datePart: { dayOfMonth: '3', },
    }
    )).toBeFalsy();
});