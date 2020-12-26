import * as DO from './DateOccurrences';
import { getYMDDate, YMDDate } from './YMDDate';



function expectRepeatDefinitionConversion(repeatDefinition, repeatDefinitionDataItem) {
    expect(DO.getOccurrenceRepeatDefinitionDataItem(repeatDefinition))
        .toEqual(repeatDefinitionDataItem);
    expect(DO.getOccurrenceRepeatDefinitionDataItem(repeatDefinitionDataItem))
        .toBe(repeatDefinitionDataItem);
    expect(DO.getOccurrenceRepeatDefinitionDataItem(repeatDefinitionDataItem, true))
        .not.toBe(repeatDefinitionDataItem);
    expect(DO.getOccurrenceRepeatDefinitionDataItem(repeatDefinitionDataItem, true))
        .toEqual(repeatDefinitionDataItem);

    expect(DO.getOccurrenceRepeatDefinition(repeatDefinitionDataItem))
        .toEqual(repeatDefinition);
    expect(DO.getOccurrenceRepeatDefinition(repeatDefinition))
        .toBe(repeatDefinition);
    expect(DO.getOccurrenceRepeatDefinition(repeatDefinition, true))
        .not.toBe(repeatDefinition);
    expect(DO.getOccurrenceRepeatDefinition(repeatDefinition, true))
        .toEqual(repeatDefinition);
}


//
//---------------------------------------------------------
//
test('DateOccurrences-RepeatType', () => {
    expectRepeatDefinitionConversion({
        repeatType: DO.OccurrenceRepeatType.NO_REPEAT,
    },
    {
        repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
    });

    expectRepeatDefinitionConversion({
        repeatType: DO.OccurrenceRepeatType.DAILY,
        period: 1,
    },
    {
        repeatType: DO.OccurrenceRepeatType.DAILY.name,
        period: 1,
    });

    expectRepeatDefinitionConversion({
        repeatType: DO.OccurrenceRepeatType.WEEKLY,
        period: 1,
    },
    {
        repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
        period: 1,
    });

    expectRepeatDefinitionConversion({
        repeatType: DO.OccurrenceRepeatType.MONTHLY,
        period: 1,
    },
    {
        repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
        period: 1,
    });

    expectRepeatDefinitionConversion({
        repeatType: DO.OccurrenceRepeatType.YEARLY,
        period: 123,
    },
    {
        repeatType: DO.OccurrenceRepeatType.YEARLY.name,
        period: 123,
    });


    //
    // Validation
    expect(DO.validateOccurrenceRepeatDefinition({
        repeatType:DO.OccurrenceRepeatType.MONTHLY.name,
        period: 123,
    })).toBeUndefined();

    expect(DO.validateOccurrenceRepeatDefinition({
        repeatType: '1234',
        period: 123,
    })).toBeInstanceOf(Error);
    
    expect(DO.validateOccurrenceRepeatDefinition({
        repeatType:DO.OccurrenceRepeatType.MONTHLY,
        period: 123,
        finalYMDDate: '2020-12-24',
        maxRepeats: 5,
    })).toBeUndefined();

    expect(DO.validateOccurrenceRepeatDefinition({
        repeatType:DO.OccurrenceRepeatType.MONTHLY.name,
        period: 123,
        finalYMDDate: 'a2020-12-24',
    })).toBeInstanceOf(Error);

    expect(DO.validateOccurrenceRepeatDefinition({
        repeatType:DO.OccurrenceRepeatType.MONTHLY.name,
        period: 123,
        maxRepeats: -5,
    })).toBeInstanceOf(Error);


    //
    // getNextRepeatDefinitionYMDDate

    // No repeat definition is same as NO_REPEAT
    expect(DO.getNextRepeatDefinitionYMDDate(undefined, '2020-02-29', 0))
        .toEqual(getYMDDate('2020-02-29'));

    expect(DO.getNextRepeatDefinitionYMDDate(undefined, '2020-02-29', 1))
        .toBeUndefined();

    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
    }, 
    '2020-02-29', 0))
        .toEqual(getYMDDate('2020-02-29'));

    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
    }, 
    '2020-02-29', 1))
        .toBeUndefined();

    //
    // 2020-02-29 was Saturday    

    //
    // WEEKLY
    //
    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
        period: 3,
    }, 
    '2020-02-29', 1))
        .toEqual(getYMDDate('2020-03-21'));
    
    // 0 occurrenceCount does not advance.
    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
        period: 3,
    }, 
    '2020-02-29', 0))
        .toEqual(getYMDDate('2020-02-29'));

    //
    // Checking finalYMDDate
    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
        period: 3,
        finalYMDDate: '2020-03-21',
    }, 
    '2020-02-29', 1))
        .toEqual(getYMDDate('2020-03-21'));

    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
        period: 4,
        finalYMDDate: '2020-03-21',
    }, 
    '2020-02-29', 1))
        .toBeUndefined();

    //
    // Checking maxRepeats
    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
        period: 3,
        finalYMDDate: '2020-03-21',
        maxRepeats: 3,
    }, 
    '2020-02-29', 2))
        .toEqual(getYMDDate('2020-03-21'));

    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
        period: 3,
        finalYMDDate: '2020-03-21',
        maxRepeats: 3,
    }, 
    '2020-02-29', 3))
        .toBeUndefined();


    //
    // MONTHLY
    //
    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
        period: 3,
    }, 
    '2020-02-29', 1))
        .toEqual(getYMDDate('2020-05-29'));

    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
        period: 1,
    }, 
    '2020-05-31', 1))
        .toEqual(getYMDDate('2020-06-30'));
    
    //
    // YEARLY
    //
    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.YEARLY.name,
        period: 3,
    }, 
    '2020-02-29', 1))
        .toEqual(getYMDDate('2023-02-28'));

    expect(DO.getNextRepeatDefinitionYMDDate({
        repeatType: DO.OccurrenceRepeatType.YEARLY.name,
        period: 4,
    }, 
    '2020-02-29', 1))
        .toEqual(getYMDDate('2024-02-29'));

});


//
//---------------------------------------------------------
//
function expectStateConversion(repeatDefinition, repeatDefinitionDataItem) {
    expect(DO.getDateOccurrenceStateDataItem(repeatDefinition))
        .toEqual(repeatDefinitionDataItem);
    expect(DO.getDateOccurrenceStateDataItem(repeatDefinitionDataItem))
        .toBe(repeatDefinitionDataItem);
    expect(DO.getDateOccurrenceStateDataItem(repeatDefinitionDataItem, true))
        .not.toBe(repeatDefinitionDataItem);
    expect(DO.getDateOccurrenceStateDataItem(repeatDefinitionDataItem, true))
        .toEqual(repeatDefinitionDataItem);

    expect(DO.getDateOccurrenceState(repeatDefinitionDataItem))
        .toEqual(repeatDefinition);
    expect(DO.getDateOccurrenceState(repeatDefinition))
        .toBe(repeatDefinition);
    expect(DO.getDateOccurrenceState(repeatDefinition, true))
        .not.toBe(repeatDefinition);
    expect(DO.getDateOccurrenceState(repeatDefinition, true))
        .toEqual(repeatDefinition);
}


//
//---------------------------------------------------------
//
test('DateOccurrence-DateOccurrenceState', () => {
    expectStateConversion({
        lastOccurrenceYMDDate: new YMDDate('2020-12-23'),
        occurrenceCount: 123,
    },
    {
        lastOccurrenceYMDDate: '2020-12-23',
        occurrenceCount: 123,
    }
    );
});


//
//---------------------------------------------------------
//

function expectOccurrenceConversion(occurrence, occurrenceDataItem) {
    expect(DO.getDateOccurrenceDefinitionDataItem(occurrence))
        .toEqual(occurrenceDataItem);
    expect(DO.getDateOccurrenceDefinitionDataItem(occurrenceDataItem))
        .toBe(occurrenceDataItem);
    expect(DO.getDateOccurrenceDefinitionDataItem(occurrenceDataItem, true))
        .not.toBe(occurrenceDataItem);
    expect(DO.getDateOccurrenceDefinitionDataItem(occurrenceDataItem, true))
        .toEqual(occurrenceDataItem);

    expect(DO.getDateOccurrenceDefinition(occurrenceDataItem))
        .toEqual(occurrence);
    expect(DO.getDateOccurrenceDefinition(occurrence))
        .toBe(occurrence);
    expect(DO.getDateOccurrenceDefinition(occurrence, true))
        .not.toBe(occurrence);
    expect(DO.getDateOccurrenceDefinition(occurrence, true))
        .toEqual(occurrence);
}


//
//---------------------------------------------------------
//
test('DateOccurrences-DAY_OF_WEEK', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        offset: 123,
        dayOfWeek: 3,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 123,
        },
    },
    {
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK.name,
        offset: 123,
        dayOfWeek: 3,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: 0,
    })).toBeUndefined();
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: 6,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: -1,
    })).toBeInstanceOf(Error);
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: 7,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT,
        }
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY,
            period: 1,
        }
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY,
            period: 1,
        }
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 1,
        }
    })).toBeInstanceOf(Error);


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK.name,
        dayOfWeek: 1,   // Monday
    };
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-12-20',    // Sunday
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-21'),    // the next Monday...
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-12-21',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-21'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-12-22',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-28'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A, result);
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-28'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });


    // Check repeating, maxRepeats
    const B = {
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK.name,
        dayOfWeek: 1,   // Monday
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY,
            period: 1,
            maxRepeats: 3,
        }
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-12-08',    // Tuesday
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-14'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, result);
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-21'),
        occurrenceCount: 3,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, result);
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-21'),
        occurrenceCount: 3,
        occurrencesAllDone: true,
    });

    // Check repeating until finalYMDDate
    const C = {
        occurrenceType: DO.OccurrenceType.DAY_OF_WEEK.name,
        dayOfWeek: 1,   // Monday
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY,
            period: 1,
            finalYMDDate: '2020-12-21',
        }
    };
    result = DO.getNextDateOccurrenceState(C, {
        lastOccurrenceYMDDate: '2020-12-08',    // Tuesday
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-14'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(C, result);
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-21'),
        occurrenceCount: 3,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(C, result);
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-21'),
        occurrenceCount: 3,
        occurrencesAllDone: true,
    });

});

//
//---------------------------------------------------------
//
test('DateOccurrences-DAY_OF_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH,
        offset: 123,
    },
    {
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH.name,
        offset: 123,
    });



    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH,
        offset: 1,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH,
    })).toBeInstanceOf(Error);

    // Valid repeatDefinition
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeUndefined();

    // Generic repeat definition validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: '123',
        },
    })).toBeInstanceOf(Error);

    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();



    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH,
        offset: 5,
    };
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-05',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-06'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-06',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-06'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-07',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-07'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });

    // With repeat definition
    const B = {
        occurrenceType: DO.OccurrenceType.DAY_OF_MONTH,
        offset: 28,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY,
            period: 3,
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-04-05',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-04-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-04-05',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-07-29'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, result);
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-10-29'),
        occurrenceCount: 3,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2019-11-30',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // Don't go beyond last day of month...
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-11-30',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-28'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });
});


//
//---------------------------------------------------------
//
test('DateOccurrences-DAY_END_OF_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH,
        offset: 123,
    },
    {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH.name,
        offset: 123,
    });



    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH,
        offset: 1,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();



    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH.name,
        offset: 30,
    };
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-10-20',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-01'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-01'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-12-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-01'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    const A1 = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH.name,
        offset: 0,
    };
    result = DO.getNextDateOccurrenceState(A1, {
        lastOccurrenceYMDDate: '2020-12-31',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-31'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });
    
    result = DO.getNextDateOccurrenceState(A1, result);
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-31'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });

    result = DO.getNextDateOccurrenceState(A1, {
        lastOccurrenceYMDDate: '2020-12-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-31'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });


    // With repeat definition.
    const B = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_MONTH,
        offset: 30,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY,
            period: 3,
            maxRepeats: 2,
        },
    };

    // Make sure 28 day month (Feb 2021) ends up on the 1st.
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-11-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-01'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-11-01',
        occurrenceCount: 2,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-01'),
        occurrenceCount: 2,
        occurrencesAllDone: true,
    });

    // Make sure 30 day month (April) ends up on the 1st.
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2021-01-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-04-01'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // Make sure 30 day month (April) ends up on the 1st.
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2021-01-15',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-04-01'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

});


//
//---------------------------------------------------------
//
test('DateOccurrences-DOW_OF_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH,
        offset: 123,
        dayOfWeek: 2,
    },
    {
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH.name,
        offset: 123,
        dayOfWeek: 2,
    });



    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH,
        offset: 1,
        dayOfWeek: 0,
    })).toBeUndefined();

    // Invalid offset
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH,
        offset: 0,
        dayOfWeek: 0,
    })).toBeInstanceOf(Error);

    // Missing dayOfWeek
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH,
        offset: 1,
    })).toBeInstanceOf(Error);

    // Missing offset & dayOfWeek
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH,
        offset: 1,
        dayOfWeek: 7,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();



    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
    };
    // Before first dow
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-02'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // On first dow
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-02',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-02'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // After first dow
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-03',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-07'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });


    // With repeat
    const B = {
        occurrenceType: DO.OccurrenceType.DOW_OF_MONTH,
        offset: 2,
        dayOfWeek: 3,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY,
            period: 2,
            maxRepeats: 3,
        },
    };
    // First time...
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-10-07',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-10-14'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-10-07',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-09'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // All done
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-10-07',
        occurrenceCount: 3,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-10-07'),
        occurrenceCount: 3,
        occurrencesAllDone: true,
    });
});

//
//---------------------------------------------------------
//
test('DateOccurrences-DOW_END_OF_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
        offset: 123,
        dayOfWeek: 2,
    },
    {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH.name,
        offset: 123,
        dayOfWeek: 2,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
        offset: 1,
        dayOfWeek: 0,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
        offset: 1,
        dayOfWeek: 6,
    })).toBeUndefined();

    // Invalid offset
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
        offset: 0,
        dayOfWeek: 1,
    })).toBeInstanceOf(Error);

    // Missing dayOfWeek
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
        offset: 1,
    })).toBeInstanceOf(Error);

    // Missing dayOfWeek, offset
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
        offset: 1,
        dayOfWeek: 7,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH.name,
        offset: 1,
        dayOfWeek: 2,
    };
    // After last dow
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-30',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // On last dow
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-24',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-24'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Before last dow
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-11-23',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-24'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });


    // With repeat definition...
    const B = {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_MONTH,
        offset: 2,
        dayOfWeek: 3,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY,
            period: 1,
            maxRepeats: 2,
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-11-18',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-18'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-11-18',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-12-23'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-11-18',
        occurrenceCount: 2,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-11-18'),
        occurrenceCount: 2,
        occurrencesAllDone: true,
    });


});

//
//---------------------------------------------------------
//
test('DateOccurrences-DAY_OF_SPECIFIC_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH,
        offset: 123,
        month: 1,
    },
    {
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 123,
        month: 1,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH,
        offset: 0,
        month: 0,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH,
        offset: -1,
        month: 0,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH,
        offset: 1,
        month: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH,
        offset: 1,
        month: 12,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 14, // 15th of the month
        month: 3,   // April
    };
    // One day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-04-14',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-04-15'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of...
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-04-15',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-04-15'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // occurrenceCount 1
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-04-15',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-04-15'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });

    // Day after...
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-04-16',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-04-15'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Leap year

    // Day of...
    const A1 = {
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 28, // 29th of the month
        month: 1,   // February
    };
    result = DO.getNextDateOccurrenceState(A1, {
        lastOccurrenceYMDDate: '2020-02-28',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A1, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A1, {
        lastOccurrenceYMDDate: '2020-03-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-28'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });


    // With repeat definition...
    const B = {
        occurrenceType: DO.OccurrenceType.DAY_OF_SPECIFIC_MONTH.name,
        offset: 28, // 29th of the month
        month: 1,   // February
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 2,
            maxRepeats: 3,
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Occurrence count 1, advances to next year.
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2018-02-28',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-02-28'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-02-28',
        occurrenceCount: 2,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2024-02-29'),
        occurrenceCount: 3,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-02-28',
        occurrenceCount: 3,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-02-28'),
        occurrenceCount: 3,
        occurrencesAllDone: true,
    });

});

//
//---------------------------------------------------------
//
test('DateOccurrences-DAY_END_OF_SPECIFIC_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH,
        offset: 123,
        month: 1,
    },
    {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 123,
        month: 1,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH,
        offset: 0,
        month: 0,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH,
        offset: -1,
        month: 0,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH,
        offset: 1,
        month: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH,
        offset: 1,
        month: 12,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH,
    })).toBeInstanceOf(Error);


    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 0,  // Last day
        month: 1,   // February
    };
    // One day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-28',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day after
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-03-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-28'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // All done
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-03-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-03-01'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });

    const A1 = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 29,  // First day
        month: 1,   // February
    };
    result = DO.getNextDateOccurrenceState(A1, {
        lastOccurrenceYMDDate: '2020-01-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-01'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(A1, {
        lastOccurrenceYMDDate: '2021-01-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-01'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });


    //
    // With repeat definition
    const B = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_SPECIFIC_MONTH.name,
        offset: 0,  // Last day
        month: 1,   // February
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 2,
            maxRepeats: 3,
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-02-28'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-02-28',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2024-02-29'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // All done
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-02-28',
        occurrenceCount: 3,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-02-28'),
        occurrenceCount: 3,
        occurrencesAllDone: true,
    });
});

//
//---------------------------------------------------------
//
test('DateOccurrences-DOW_OF_SPECIFIC_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH,
        offset: 123,
        dayOfWeek: 2,
        month: 1,
    },
    {
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH.name,
        offset: 123,
        dayOfWeek: 2,
        month: 1,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 0,
        month: 0,
    })).toBeUndefined();
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 6,
        month: 11,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 7,
        month: 11,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 6,
        month: 12,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH.name,
        offset: 2,  // 2nd 
        dayOfWeek: 3, // 
        month: 1,   // February
    };

    // Day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-11',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-12'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-12',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-12'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day after
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-13',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-10'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // All done with no repeats
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-11',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-11'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });


    //
    // With repeat definition...
    const B = {
        occurrenceType: DO.OccurrenceType.DOW_OF_SPECIFIC_MONTH.name,
        offset: 5,
        dayOfWeek: 6,
        month: 1,   // February
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 2,
            maxRepeats: 3,
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-03-05'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 3,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 3,
        occurrencesAllDone: true,
    });

});

//
//---------------------------------------------------------
//
test('DateOccurrences-DOW_END_OF_SPECIFIC_MONTH', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH,
        offset: 123,
        dayOfWeek: 2,
        month: 1,
    },
    {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH.name,
        offset: 123,
        dayOfWeek: 2,
        month: 1,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 0,
        month: 0,
    })).toBeUndefined();
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 6,
        month: 11,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 7,
        month: 11,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH,
        offset: 1,
        dayOfWeek: 6,
        month: 12,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH.name,
        offset: 1,
        dayOfWeek: 1,
        month: 11,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH.name,
        offset: 2, 
        dayOfWeek: 3, // 
        month: 1,   // February
    };

    // Day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-18',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-19'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-19',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-19'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day after
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-20',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-17'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Done no repeats
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-20',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-20'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });


    //
    // with repeat definition
    const B = {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_SPECIFIC_MONTH.name,
        offset: 3, 
        dayOfWeek: 0,   // Sunday
        month: 1,   // February
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 2,
            maxRepeats: 2,
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-09',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-09'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-08',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-02-13'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // All done
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-08',
        occurrenceCount: 2,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-08'),
        occurrenceCount: 2,
        occurrencesAllDone: true,
    });
    
});

//
//---------------------------------------------------------
//
test('DateOccurrences-DAY_OF_YEAR', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR,
        offset: 123,
    },
    {
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR.name,
        offset: 123,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR,
        offset: 1,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR.name,
        offset: 59, // Feb 29/March 1 
    };

    // Day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-01-15',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-01-16',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day after
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-03-01',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-03-01'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // All done no repeat
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-01-17',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-01-17'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });


    //
    // With repeat definition
    const B = {
        occurrenceType: DO.OccurrenceType.DAY_OF_YEAR.name,
        offset: 15, 
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 3,
            finalYMDDate: '2024-01-16',
        },
    };

    // First time...
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2021-01-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-01-16'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Repeating...
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2021-01-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2024-01-16'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // Not past finalYMDDate
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-01-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-01-01'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });
});

//
//---------------------------------------------------------
//
test('DateOccurrences-DAY_END_OF_YEAR', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR,
        offset: 123,
    },
    {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 123,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 1,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 1,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 306,    // Feb 28/29
    };

    // Day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-28',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-02-29',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day after
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-03-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-02-28'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // All done no repeat
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2020-03-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-03-01'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });


    //
    // With repeat definition
    const B = {
        occurrenceType: DO.OccurrenceType.DAY_END_OF_YEAR.name,
        offset: 306,    // Feb 28/29
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 2,
            maxRepeats: 3,
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Second occurrence
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-02-28'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // All done, last occurrence
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-02-29',
        occurrenceCount: 3,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2020-02-29'),
        occurrenceCount: 3,
        occurrencesAllDone: true,
    });

});

//
//---------------------------------------------------------
//
test('DateOccurrences-DOW_OF_YEAR', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR,
        offset: 123,
        dayOfWeek: 2,
    },
    {
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR.name,
        offset: 123,
        dayOfWeek: 2,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR,
        offset: 1,
        dayOfWeek: 0,
    })).toBeUndefined();
    
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR,
        offset: 1,
        dayOfWeek: 6,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR,
        offset: 1,
        dayOfWeek: 7,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR.name,
        offset: 3,
        dayOfWeek: 4,
    };

    // Day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-01-20',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-01-21'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-01-21',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-01-21'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day after
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-01-22',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-01-20'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // All done no repeat
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-01-22',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-01-22'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });

    //
    // With repeat definition...
    const B = {
        occurrenceType: DO.OccurrenceType.DOW_OF_YEAR.name,
        offset: 2,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 2,
            finalYMDDate: '2022-01-09',
        },
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-01-01',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-01-09'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2020-01-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-01-09'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // All done after finalYMDDate
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2021-01-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-01-01'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });

});

//
//---------------------------------------------------------
//
test('DateOccurrences-DOW_END_OF_YEAR', () => {
    expectOccurrenceConversion({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: 123,
        dayOfWeek: 2,
    },
    {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR.name,
        offset: 123,
        dayOfWeek: 2,
    });


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: 1,
        dayOfWeek: 0,
    })).toBeUndefined();
    
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: 1,
        dayOfWeek: 6,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: 1,
        dayOfWeek: 7,
    })).toBeInstanceOf(Error);


    //
    // Validation
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: 1,
        dayOfWeek: 0,
    })).toBeUndefined();
    
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: 1,
        dayOfWeek: 6,
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: -1,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR,
        offset: 1,
        dayOfWeek: 7,
    })).toBeInstanceOf(Error);

    //
    // Validate repeat type
    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.NO_REPEAT.name,
            period: 123,
        },
    })).toBeUndefined();

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.WEEKLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.MONTHLY.name,
            period: 123,
        },
    })).toBeInstanceOf(Error);

    expect(DO.validateDateOccurrenceDefinition({
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR.name,
        offset: 1,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY.name,
            period: 123,
        },
    })).toBeUndefined();


    //
    // Next Date
    let result;
    const A = {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR.name,
        offset: 3,
        dayOfWeek: 6,
    };

    // Day before
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-12-10',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-12-11'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day of
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-12-11',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-12-11'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // Day after
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-12-12',
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-12-17'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    // All done no repeat
    result = DO.getNextDateOccurrenceState(A, {
        lastOccurrenceYMDDate: '2021-12-12',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2021-12-12'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });


    //
    // With repeat definition
    const B = {
        occurrenceType: DO.OccurrenceType.DOW_END_OF_YEAR.name,
        offset: 3,
        dayOfWeek: 0,
        repeatDefinition: {
            repeatType: DO.OccurrenceRepeatType.YEARLY,
            period: 1,
            finalYMDDate: '2023-12-17',
        }
    };
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-12-10',
        occurrenceCount: 0,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-12-11'),
        occurrenceCount: 1,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2021-12-01',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2022-12-11'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2022-12-11',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2023-12-17'),
        occurrenceCount: 2,
        occurrencesAllDone: false,
    });

    // All done after finalYMDDate
    result = DO.getNextDateOccurrenceState(B, {
        lastOccurrenceYMDDate: '2023-12-11',
        occurrenceCount: 1,
    });
    expect(result).toEqual({
        lastOccurrenceYMDDate: getYMDDate('2023-12-11'),
        occurrenceCount: 1,
        occurrencesAllDone: true,
    });
});