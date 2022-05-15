import * as DPF from './DatePartFormatter';



//
//---------------------------------------------------------
//
test('NumericFormatter-defaults', () => {

    const defFormatter = new DPF.DatePartNumericFormatter();

    let result;

    result = defFormatter.format({
        year: 2022,
        month: 1,
        dayOfMonth: 5,
    });
    expect(result).toEqual('02/05/22');

    result = defFormatter.format({
        year: 1951,
        month: 11,
        dayOfMonth: 31,
    },
    2049);
    expect(result).toEqual('12/31/51');

    result = defFormatter.format({
        year: 1950,
        month: 0,
        dayOfMonth: 15,
    },
    2049);
    expect(result).toEqual('01/15/1950');

    result = defFormatter.format({
        year: 2050,
        month: 0,
        dayOfMonth: 15,
    },
    2049);
    expect(result).toEqual('01/15/50');

    result = defFormatter.format({
        year: 2051,
        month: 0,
        dayOfMonth: 15,
    },
    2049);
    expect(result).toEqual('01/15/2051');


    result = defFormatter.format({
        year: 2050,
        month: 0,
        dayOfMonth: 15,
    },
    2050);
    expect(result).toEqual('01/15/50');
    
    result = defFormatter.format({
        year: 2049,
        month: 0,
        dayOfMonth: 15,
    },
    2050);
    expect(result).toEqual('01/15/2049');

    result = defFormatter.format({
        year: 2149,
        month: 0,
        dayOfMonth: 15,
    },
    2050);
    expect(result).toEqual('01/15/49');
    
    result = defFormatter.format({
        year: 2150,
        month: 0,
        dayOfMonth: 15,
    },
    2050);
    expect(result).toEqual('01/15/2150');

});


//
//---------------------------------------------------------
//
test('NumericFormatter-options', () => {
    let result;

    const formatterA = new DPF.DatePartNumericFormatter([
        'yyyy',
        '-',
        'mm'
    ]);
    result = formatterA.format({
        year: 2022,
        month: 1,
        dayOfMonth: 17,
    });
    expect(result).toEqual('2022-02');

    
    const formatterB = new DPF.DatePartNumericFormatter([
        'M',
        ':',
        'MixedUp',
        'd',
        'YEAR:',
        'y',
    ]);
    result = formatterB.format({
        year: 1,
        month: 2,
        dayOfMonth: 5,
    });
    expect(result).toEqual('3:MixedUp5YEAR:1');
});


//
//---------------------------------------------------------
//
test('NumericFormatter-parseShortYears', () => {
    let result;

    const formatterA = new DPF.DatePartNumericFormatter();

    expect(formatterA.parse()).toEqual('string-undefined');

    result = formatterA.parse('2/3/45', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: 2045,
        month: 1,
        dayOfMonth: 3,
    });

    result = formatterA.parse('12/31/49', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: 2049,
        month: 11,
        dayOfMonth: 31,
    });

    result = formatterA.parse('12/31/50', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: 1950,
        month: 11,
        dayOfMonth: 31,
    });

    result = formatterA.parse('12/31/51', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: 1951,
        month: 11,
        dayOfMonth: 31,
    });

    // Full year digits override...
    result = formatterA.parse('12/31/2051', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: 2051,
        month: 11,
        dayOfMonth: 31,
    });

    result = formatterA.parse('12/31/0051', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: 51,
        month: 11,
        dayOfMonth: 31,
    });

    result = formatterA.parse('12/31/-0051', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: -51,
        month: 11,
        dayOfMonth: 31,
    });


    result = formatterA.parse('1/2/49', { defDatePart: { year: 2050, }});
    expect(result).toEqual({
        year: 2149,
        month: 0,
        dayOfMonth: 2,
    });

    result = formatterA.parse('1/2/50', { defDatePart: { year: 2050, }});
    expect(result).toEqual({
        year: 2050,
        month: 0,
        dayOfMonth: 2,
    });

    result = formatterA.parse('1/2/51', { defDatePart: { year: 2050, }});
    expect(result).toEqual({
        year: 2051,
        month: 0,
        dayOfMonth: 2,
    });


    result = formatterA.parse('1/2/49', { defDatePart: { year: 2051, }});
    expect(result).toEqual({
        year: 2149,
        month: 0,
        dayOfMonth: 2,
    });

    result = formatterA.parse('09/09/50', { defDatePart: { year: 2051, }});
    expect(result).toEqual({
        year: 2050,
        month: 8,
        dayOfMonth: 9,
    });

    result = formatterA.parse('1/12/51', { defDatePart: { year: 2051, }});
    expect(result).toEqual({
        year: 2051,
        month: 0,
        dayOfMonth: 12,
    });

   
    // Short year formatting occurs regardless of year length.
    const formatterB = new DPF.DatePartNumericFormatter(['MM', '-', 'DD', '-', 'YYYY']);
    result = formatterB.parse('1/2/49', { defDatePart: { year: 2049, }});
    expect(result).toEqual({
        year: 2049,
        month: 0,
        dayOfMonth: 2,
    });


    result = formatterB.parse('1/23', { defDatePart: { year: 2020, }});
    expect(result).toEqual({
        year: 2020,
        month: 0,
        dayOfMonth: 23,
    });
});


//
//---------------------------------------------------------
//
test('NumericFormatter-parsefullInfo', () => {
    let result;

    const formatterA = new DPF.DatePartNumericFormatter(['mm', '-', 'yyyy']);
    result = formatterA.parse('12-99', { fullInfo: true, });
    expect(result).toEqual({
        errorReason: 'dayOfMonth-missing',
    });

    result = formatterA.parse('12-99', { fullInfo: true, defDatePart: { dayOfMonth: 3, }});
    expect(result).toEqual({
        datePart: {
            year: 1999,
            month: 11,
            dayOfMonth: 3,
        },
        remainingText: '',
    });

    result = formatterA.parse('12-99-Abc', { fullInfo: true, defDatePart: { dayOfMonth: 3, }});
    expect(result).toEqual({
        datePart: {
            year: 1999,
            month: 11,
            dayOfMonth: 3,
        },
        remainingText: '-Abc',
    });
});