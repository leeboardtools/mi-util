import * as W from './When';
import * as DP from '../util/DatePart';
import * as TP from '../util/TimePart';

test('cloneWhen', () => {
    expect(W.cloneWhen()).toBeUndefined();

    let ref;
    let test;

    ref = {};
    test = W.cloneWhen(ref);
    expect(test).toEqual(ref);
    expect(test).not.toBe(ref);

    ref = {
        startDatePart: { year: 2022, month: 3, dayOfMonth: 17, }
    };
    test = W.cloneWhen(ref);
    expect(test).toEqual(ref);
    expect(test).not.toBe(ref);
    expect(test.startDatePart).not.toBe(ref.startDatePart);


    ref = {
        startDatePart: { year: 2022, month: 3, dayOfMonth: 17, },
        startTimePart: { hours: 10, minutes: 20, seconds: 15, milliseconds: 45, },
        extra: 'Some extra stuff',
    };
    test = W.cloneWhen(ref);
    expect(test).toEqual({
        startDatePart: ref.startDatePart,
        startTimePart: ref.startTimePart,
    });
    expect(test.startTimePart).not.toBe(ref.startTimePart);


    ref = {        
        startDatePart: { year: 2022, month: 3, dayOfMonth: 17, },
        daysDuration: 17,
        startTimePart: { hours: 10, minutes: 20, seconds: 15, milliseconds: 45, },
        millisecondsDuration: 10235,
        extra: 'Some extra stuff',
    };
    test = W.cloneWhen(ref);
    expect(test).toEqual({
        startDatePart: ref.startDatePart,
        daysDuration: ref.daysDuration,
        startTimePart: ref.startTimePart,
        millisecondsDuration: ref.millisecondsDuration,
    });

});


//
//---------------------------------------------------------
//
test('When-getFinishParts', () => {
    expect(W.getFinishParts()).toBeUndefined();

    const datePartA = { year: 2021, month: 11, dayOfMonth: 31, };
    const timePartA = { hours: 23, minutes: 0, seconds: 0, };

    // No durations
    const datePartOnly = { 
        startDatePart: datePartA, 
    };
    expect(W.getFinishParts(datePartOnly)).toEqual(
        { finishDatePart: datePartA, }
    );
    expect(W.getFinishDatePart(datePartOnly)).toEqual(
        datePartA
    );
    expect(W.getFinishTimePart(datePartOnly)).toBeUndefined();

    const dateTimePartsOnly = { 
        startDatePart: datePartA, startTimePart: timePartA, 
    };
    expect(W.getFinishParts(dateTimePartsOnly)).toEqual({
        finishDatePart: datePartA,
        finishTimePart: timePartA,
    });
    expect(W.getFinishDatePart(dateTimePartsOnly)).toEqual(
        datePartA
    );
    expect(W.getFinishTimePart(dateTimePartsOnly)).toEqual(
        timePartA
    );


    //
    // Days duration, no start time
    const daysDuration = { 
        startDatePart: datePartA, daysDuration: 3, 
    };
    expect(W.getFinishParts(daysDuration)).toEqual({
        finishDatePart: { year: 2022, month: 0, dayOfMonth: 2, }
    });


    //
    // Days duration, start time.
    expect(W.getFinishParts(
        { 
            startDatePart: datePartA, 
            daysDuration: 3,
            startTimePart: timePartA, 
        }
    )).toEqual({
        finishDatePart: DP.addDays(datePartA, 2),
        finishTimePart: timePartA,
    });


    //
    // No days duration, has time duration.
    // Same day
    expect(W.getFinishParts(
        { 
            startDatePart: datePartA, 
            startTimePart: timePartA, 
            millisecondsDuration: 30 * 60 * 1000, 
        }
    )).toEqual({
        finishDatePart: datePartA,
        finishTimePart: { hours: 23, minutes: 30, seconds: 0, milliseconds: 0, }
    });

    // End at midnight.
    expect(W.getFinishParts(
        { 
            startDatePart: datePartA, 
            startTimePart: timePartA, 
            millisecondsDuration: 60 * 60 * 1000, 
        }
    )).toEqual({
        finishDatePart: DP.addDays(datePartA, 1),
        finishTimePart: { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, }
    });
    
    // Past midnight
    expect(W.getFinishParts(
        { 
            startDatePart: datePartA, 
            startTimePart: timePartA, 
            millisecondsDuration: 60 * 60 * 1000 + 1, 
        }
    )).toEqual({
        finishDatePart: DP.addDays(datePartA, 1),
        finishTimePart: { hours: 0, minutes: 0, seconds: 0, milliseconds: 1, }
    });


    // Days duration longer
    expect(W.getFinishParts(
        { 
            startDatePart: datePartA, 
            daysDuration: 2,
            startTimePart: timePartA, 
            millisecondsDuration: 60 * 60 * 1000 + 1, 
        }
    )).toEqual({
        finishDatePart: DP.addDays(datePartA, 1),
        finishTimePart: { hours: 0, minutes: 0, seconds: 0, milliseconds: 1, }
    });

    // Time duration longer
    expect(W.getFinishParts(
        { 
            startDatePart: datePartA, 
            daysDuration: 1,
            startTimePart: timePartA, 
            millisecondsDuration: 26 * 60 * 60 * 1000, 
        }
    )).toEqual({
        finishDatePart: DP.addDays(datePartA, 2),
        finishTimePart: { hours: 1, minutes: 0, seconds: 0, milliseconds: 0, }
    });

});


//
//---------------------------------------------------------
//
test('When-compareStartFinishes', () => {
    const singleDayA = {
        startDatePart: { year: 2021, month: 11, dayOfMonth: 31, },
    };
    const singleDayB = {
        startDatePart: { year: 2022, month: 0, dayOfMonth: 1, },
    };

    expect(W.compareStarts(singleDayA, singleDayA)).toBe(0);
    expect(W.compareStarts(singleDayA, Object.assign({}, singleDayA))).toBe(0);
    expect(W.compareStarts(singleDayA, singleDayB)).toBeLessThan(0);
    expect(W.compareStarts(singleDayB, singleDayA)).toBeGreaterThan(0);

    expect(W.compareFinishes(singleDayA, singleDayA)).toBe(0);
    expect(W.compareFinishes(singleDayA, Object.assign({}, singleDayA))).toBe(0);
    expect(W.compareFinishes(singleDayA, singleDayB)).toBeLessThan(0);
    expect(W.compareFinishes(singleDayB, singleDayA)).toBeGreaterThan(0);


    const singleDayA_StartTimeA = {
        startDatePart: singleDayA.startDatePart,
        startTimePart: { hours: 23, minutes: 0, seconds: 0, },
    };
    const singleDayA_StartTimeB = {
        startDatePart: singleDayA.startDatePart,
        startTimePart: { hours: 23, minutes: 0, seconds: 1, },
    };
    const singleDayA_StartTimeC = {
        startDatePart: singleDayA.startDatePart,
        startTimePart: { hours: 0, minutes: 0, seconds: 0, },
    };
    expect(W.compareStarts(singleDayA_StartTimeA, Object.assign({}, singleDayA_StartTimeA))).toBe(0);
    expect(W.compareStarts(singleDayA_StartTimeA, singleDayA_StartTimeB)).toBeLessThan(0);
    expect(W.compareStarts(singleDayA_StartTimeB, singleDayA_StartTimeA)).toBeGreaterThan(0);

    expect(W.compareFinishes(singleDayA_StartTimeA, Object.assign({}, singleDayA_StartTimeA))).toBe(0);
    expect(W.compareFinishes(singleDayA_StartTimeA, singleDayA_StartTimeB)).toBeLessThan(0);
    expect(W.compareFinishes(singleDayA_StartTimeB, singleDayA_StartTimeA)).toBeGreaterThan(0);

    expect(W.compareStarts(singleDayA, singleDayA_StartTimeA)).toBeLessThan(0);
    expect(W.compareStarts(singleDayA_StartTimeA, singleDayA)).toBeGreaterThan(0);

    // No start time comes before start time of midnight...
    expect(W.compareStarts(singleDayA, singleDayA_StartTimeC)).toBeLessThan(0);
    expect(W.compareStarts(singleDayA_StartTimeC, singleDayA)).toBeGreaterThan(0);


    const threeDaysA = {
        startDatePart: singleDayA.startDatePart,
        daysDuration: 3,
    };
    const threeDaysB = {
        startDatePart: singleDayB.startDatePart,
        daysDuration: 3,
    };
    const twoDaysB = {
        startDatePart: singleDayB.startDatePart,
        daysDuration: 2,
    };

    expect(W.compareFinishes(threeDaysA, threeDaysA)).toBe(0);
    expect(W.compareFinishes(threeDaysA, Object.assign({}, threeDaysA))).toBe(0);
    expect(W.compareFinishes(threeDaysA, threeDaysB)).toBeLessThan(0);
    expect(W.compareFinishes(threeDaysB, threeDaysA)).toBeGreaterThan(0);
    expect(W.compareFinishes(threeDaysA, twoDaysB)).toBe(0);


});


//
//---------------------------------------------------------
//
test('cleanWhen', () => {
    expect(W.cleanWhen()).toBeUndefined();

    let result;

    // Note it's possible this will fail if this is run right before midnight...
    const todayPart = DP.datePartFromDate(new Date());

    // Default values...
    result = W.cleanWhen({});
    expect(result).toEqual({
        startDatePart: todayPart,
    });

    result = W.cleanWhen({}, { addMessages: true, });
    expect(result.when).toEqual({
        startDatePart: todayPart,
    });
    expect(result.changeMessages.length).toEqual(1);

    // Specified defaults
    const defaults = {
        startDatePart: { year: 2021, month: 11, dayOfMonth: 31, },
    };

    result = W.cleanWhen({}, { defaults: defaults });
    expect(result).toEqual({
        startDatePart: defaults.startDatePart,
    });

    result = W.cleanWhen({}, { addMessages: true, defaults: defaults });
    expect(result.when).toEqual({
        startDatePart: defaults.startDatePart,
    });
    expect(result.changeMessages.length).toEqual(1);


    const ref = {
        startDatePart: { year: 2021, month: 11, dayOfMonth: 31, },
        daysDuration: 3,
        startTimePart: { hours: 9, minutes: 30, seconds: 15, milliseconds: 0, },
        millisecondsDuration: 30 * 60 * 1000,
    };
    let test;
    let refB;

    //
    // All valid...
    expect(W.cleanWhen(ref)).toBe(ref);

    result = W.cleanWhen(ref, { addMessages: true, });
    expect(result.when).toBe(ref);
    expect(result.changeMessages.length).toBe(0);

    //
    // startDatePart
    test = Object.assign({}, ref, {
        startDatePart: { year: 2021, month: 11, dayOfMonth: 32, }
    });
    refB = Object.assign({}, ref, {
        startDatePart: { year: 2022, month: 0, dayOfMonth: 1, }
    });
    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);

    // Make sure the original didn't change...
    expect(refB.startDatePart).not.toEqual(ref.startDatePart);


    //
    // [daysDuration]

    // < 0
    test = Object.assign({}, ref, {
        daysDuration: -1,
    });
    refB = Object.assign({}, ref, {
        daysDuration: 0,
    });

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);

    // Not a number.
    test = Object.assign({}, ref, {
        daysDuration: 'Abc',
    });
    refB = Object.assign({}, ref);
    delete refB.daysDuration;

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);
    

    //
    // [startTimePart]

    // Cleaned
    test = Object.assign({}, ref, {
        startTimePart: { hours: 0, minutes: 30, seconds: 61, },
    });
    refB = Object.assign({}, ref, {
        startTimePart: { hours: 0, minutes: 31, seconds: 1, milliseconds: 0, },
    });

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);

    // < 0
    test = Object.assign({}, ref, {
        startTimePart: { hours: 0, minutes: 30, seconds: -10, },
    });
    refB = Object.assign({}, ref);
    delete refB.startTimePart;

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);

    // Invalid
    test = Object.assign({}, ref, {
        startTimePart: '00:30:00',
    });
    refB = Object.assign({}, ref);
    delete refB.startTimePart;

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);


    //
    // [millisecondsDuration]

    // < 0
    test = Object.assign({}, ref, {
        millisecondsDuration: -1,
    });
    refB = Object.assign({}, ref);
    delete refB.millisecondsDuration;

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);

    // Invalid
    test = Object.assign({}, ref, {
        millisecondsDuration: '-1',
    });
    refB = Object.assign({}, ref);
    delete refB.millisecondsDuration;

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);

    // finish part due to time after finish part due to days duration.
    test = Object.assign({}, ref);
    test.millisecondsDuration += (ref.daysDuration + 1) * TP.MILLISECONDS_PER_DAY;

    refB = Object.assign({}, ref);
    refB.millisecondsDuration = test.millisecondsDuration;
    delete refB.daysDuration;

    result = W.cleanWhen(test, { addMessages: true, });
    expect(result.when).toEqual(refB);
    expect(result.changeMessages.length).toEqual(1);

});
