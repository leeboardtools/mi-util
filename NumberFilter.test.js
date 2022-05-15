import { doesNumberSatisfyFilter, isNumberFilter } from './NumberFilter';



//
//---------------------------------------------------------
//
test('doesNumberSatisfyFilter', () => {
    // No filter
    expect(doesNumberSatisfyFilter({}, 123, )
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(undefined, 123, )
    ).toBeTruthy();

    const minimumValue = {
        minimumValue: 123,
    };

    // Non-numbers always fail.
    expect(doesNumberSatisfyFilter(minimumValue)
    ).toBeFalsy();
    expect(doesNumberSatisfyFilter(minimumValue, 'Abc')
    ).toBeFalsy();
    expect(doesNumberSatisfyFilter(minimumValue, Number.NaN)
    ).toBeFalsy();

    expect(doesNumberSatisfyFilter(minimumValue, 122.9999)
    ).toBeFalsy();
    expect(doesNumberSatisfyFilter(minimumValue, 123)
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(minimumValue, 123.0001)
    ).toBeTruthy();


    const maximumValue = {
        maximumValue: 123,
    };
    expect(doesNumberSatisfyFilter(maximumValue, 122.9999)
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(maximumValue, 123)
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(maximumValue, 123.0001)
    ).toBeFalsy();


    const both = {
        minimumValue: 123,
        maximumValue: 125,
    };
    expect(doesNumberSatisfyFilter(both, 122.9999)
    ).toBeFalsy();
    expect(doesNumberSatisfyFilter(both, 123)
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(both, 124)
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(both, 125)
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(both, 125.0001)
    ).toBeFalsy();


    const single = {
        value: 123,
    };
    expect(doesNumberSatisfyFilter(single, 122.9999)
    ).toBeFalsy();
    expect(doesNumberSatisfyFilter(single, 123)
    ).toBeTruthy();
    expect(doesNumberSatisfyFilter(single, 123.0001)
    ).toBeFalsy();
});


//
//---------------------------------------------------------
//
test('NumberFilter-isFilter', () => {
    expect(isNumberFilter()
    ).toBeFalsy();
    expect(isNumberFilter({})
    ).toBeFalsy();

    expect(isNumberFilter({
        minimumValue: 123,
    }
    )).toBeTruthy();
    expect(isNumberFilter({
        minimumValue: '123',
    }
    )).toBeFalsy();

    expect(isNumberFilter({
        maximumValue: 123,
    }
    )).toBeTruthy();
    expect(isNumberFilter({
        maximumValue: '123',
    }
    )).toBeFalsy();

    expect(isNumberFilter({
        minimumValue: 456,
        maximumValue: 123,
    }
    )).toBeTruthy();
    expect(isNumberFilter({
        minimumValue: 456,
        maximumValue: '123',
    }
    )).toBeTruthy();
    expect(isNumberFilter({
        minimumValue: '456',
        maximumValue: 123,
    }
    )).toBeTruthy();
    expect(isNumberFilter({
        minimumValue: '456',
        maximumValue: '123',
    }
    )).toBeFalsy();
});