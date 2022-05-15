import { TimePartNumericFormatter } from './TimePartFormatter';


//
//---------------------------------------------------------
//
test('TimePartNumericFormatter', () => {
    const formatterA = new TimePartNumericFormatter('en-US');
    expect(formatterA.format({ hours: 9, minutes: 2, seconds: 40, milliseconds: 50, }))
        .toEqual('9:02 AM');
    expect(formatterA.format({ hours: 13, minutes: 2, seconds: 40, milliseconds: 50, }))
        .toEqual('1:02 PM');

    expect(formatterA.parse()).toEqual('string-undefined');
    expect(formatterA.parse('Abc')).toEqual('hours-missing');
    expect(formatterA.parse('Abc', { fullInfo: true, })).toEqual({
        errorReason: 'hours-missing',
    });

    expect(formatterA.parse('1:2 PM')).toEqual({ hours: 13, minutes: 2, seconds: 0, milliseconds: 0, });
    expect(formatterA.parse('1:2:3 AM')).toEqual({ hours: 1, minutes: 2, seconds: 3, milliseconds: 0, });
    expect(formatterA.parse('1:2:3.45 AM')).toEqual({ hours: 1, minutes: 2, seconds: 3, milliseconds: 450, });
    expect(formatterA.parse('12:2:3.45 AM')).toEqual({ hours: 0, minutes: 2, seconds: 3, milliseconds: 450, });
    expect(formatterA.parse('12:2:3.45')).toEqual({ hours: 12, minutes: 2, seconds: 3, milliseconds: 450, });
    expect(formatterA.parse('23:2:3.45')).toEqual({ hours: 23, minutes: 2, seconds: 3, milliseconds: 450, });
        

    const formatterB = new TimePartNumericFormatter({ locale: 'en-US', hour12: false, });
    expect(formatterB.format({ hours: 9, minutes: 2, seconds: 40, milliseconds: 50, }))
        .toEqual('09:02');
    expect(formatterB.format({ hours: 13, minutes: 2, seconds: 40, milliseconds: 50, }))
        .toEqual('13:02');

    expect(formatterB.parse('09:02')).toEqual({ hours: 9, minutes: 2, seconds: 0, milliseconds: 0, });
    expect(formatterB.parse('13:02')).toEqual({ hours: 13, minutes: 2, seconds: 0, milliseconds: 0, });
    expect(formatterB.parse('1:2 PM')).toEqual({ hours: 13, minutes: 2, seconds: 0, milliseconds: 0, });
    expect(formatterB.parse('1:2:3.45 AM')).toEqual({ hours: 1, minutes: 2, seconds: 3, milliseconds: 450, });
    

    // long and full are treated as medium
    const formatterC = new TimePartNumericFormatter({ locale: 'en-US', hour12: true, timeStyle: 'long', });
    expect(formatterC.format({ hours: 9, minutes: 2, seconds: 40, milliseconds: 50, }))
        .toEqual('9:02:40 AM');
    expect(formatterC.format({ hours: 0, minutes: 2, seconds: 40, milliseconds: 50, }))
        .toEqual('12:02:40 AM');



    const formatterD = new TimePartNumericFormatter({ locale: 'en-US', 
        minute: 'numeric', 
        second: 'numeric', 
        fractionalSecondDigits: 2, 
    });
    expect(formatterD.format({ hours: 9, minutes: 3, seconds: 45, milliseconds: 543, }))
        .toEqual('03:45.54');

    expect(formatterD.parse('09:02')).toEqual({ hours: 0, minutes: 9, seconds: 2, milliseconds: 0, });
    expect(formatterD.parse('9')).toEqual({ hours: 0, minutes: 9, seconds: 0, milliseconds: 0, });
    expect(formatterD.parse('09:02:01')).toEqual({ hours: 9, minutes: 2, seconds: 1, milliseconds: 0, });
    expect(formatterD.parse('09:02:01.23')).toEqual({ hours: 9, minutes: 2, seconds: 1, milliseconds: 230, });
    // AM/PM is ignored...
    expect(formatterD.parse('09:02:01.23 PM')).toEqual({ hours: 9, minutes: 2, seconds: 1, milliseconds: 230, });
    

    const formatterE = new TimePartNumericFormatter({ locale: 'en-US', 
        second: 'numeric', 
        fractionalSecondDigits: 2, 
    });
    expect(formatterE.format({ hours: 9, minutes: 3, seconds: 45, milliseconds: 567, }))
        .toEqual('45.56');
    expect(formatterE.parse('9')).toEqual({ hours: 0, minutes: 0, seconds: 9, milliseconds: 0, });
    expect(formatterE.parse('09:02')).toEqual({ hours: 0, minutes: 9, seconds: 2, milliseconds: 0, });
    expect(formatterE.parse('09:02:01')).toEqual({ hours: 9, minutes: 2, seconds: 1, milliseconds: 0, });
    expect(formatterE.parse('09:02:01.23')).toEqual({ hours: 9, minutes: 2, seconds: 1, milliseconds: 230, });
    // AM/PM is ignored...
    expect(formatterE.parse('09:02:01.23 PM')).toEqual({ hours: 9, minutes: 2, seconds: 1, milliseconds: 230, });


    // Test partial formatting as document in parse()...
    const formatter_hh = new TimePartNumericFormatter({ locale: 'en-US', hour: 'numeric', });
    expect(formatter_hh.parse('13')).toEqual({ hours: 13, minutes: 0, seconds: 0, milliseconds: 0, });
    expect(formatter_hh.parse('13:14')).toEqual({ hours: 13, minutes: 14, seconds: 0, milliseconds: 0, });
    expect(formatter_hh.parse('13:14:15.16')).toEqual({ hours: 13, minutes: 14, seconds: 15, milliseconds: 160, });

    const formatter_hh_mm = new TimePartNumericFormatter({ locale: 'en-US', hour: 'numeric', minute: 'numeric', });
    expect(formatter_hh_mm.parse('13')).toEqual({ hours: 13, minutes: 0, seconds: 0, milliseconds: 0, });
    expect(formatter_hh_mm.parse('13:14')).toEqual({ hours: 13, minutes: 14, seconds: 0, milliseconds: 0, });
    expect(formatter_hh_mm.parse('13:14:15.16')).toEqual({ hours: 13, minutes: 14, seconds: 15, milliseconds: 160, });

    const formatter_mm = new TimePartNumericFormatter({ locale: 'en-US', minute: 'numeric', });
    expect(formatter_mm.parse('13')).toEqual({ hours: 0, minutes: 13, seconds: 0, milliseconds: 0, });
    expect(formatter_mm.parse('13:14')).toEqual({ hours: 13, minutes: 14, seconds: 0, milliseconds: 0, });
    expect(formatter_mm.parse('13:14:15.16')).toEqual({ hours: 13, minutes: 14, seconds: 15, milliseconds: 160, });

    const formatter_mm_ss = new TimePartNumericFormatter({ locale: 'en-US', minute: 'numeric', second: 'numeric', });
    expect(formatter_mm_ss.parse('13')).toEqual({ hours: 0, minutes: 13, seconds: 0, milliseconds: 0, });
    expect(formatter_mm_ss.parse('13:14')).toEqual({ hours: 0, minutes: 13, seconds: 14, milliseconds: 0, });
    expect(formatter_mm_ss.parse('13:14:15.16')).toEqual({ hours: 13, minutes: 14, seconds: 15, milliseconds: 160, });

    const formatter_ss = new TimePartNumericFormatter({ locale: 'en-US', second: 'numeric', });
    expect(formatter_ss.parse('13')).toEqual({ hours: 0, minutes: 0, seconds: 13, milliseconds: 0, });
    expect(formatter_ss.parse('13:14')).toEqual({ hours: 0, minutes: 13, seconds: 14, milliseconds: 0, });
    expect(formatter_ss.parse('13:14:15.16')).toEqual({ hours: 13, minutes: 14, seconds: 15, milliseconds: 160, });
});


