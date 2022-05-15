import * as DTP from './DateTimePart';


//
//---------------------------------------------------------
//
test('DateTimePart-clean', () => {
    expect(DTP.cleanDateTimePart()).toBeUndefined();
    expect(DTP.cleanDateTimePart({})).toBeUndefined();
    expect(DTP.cleanDateTimePart({
        timePart: { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, }
    })).toBeUndefined();


    let result;

    const datePartOnly = {
        datePart: { year: 2021, month: 11, dayOfMonth: 31, },
    };
    expect(DTP.cleanDateTimePart(datePartOnly)).toBe(datePartOnly);


    const dirtyDatePartOnly = {
        datePart: { year: 2021, month: 11, dayOfMonth: 32, },
    };
    result = DTP.cleanDateTimePart(dirtyDatePartOnly);
    expect(result).not.toBe(dirtyDatePartOnly);
    expect(result.datePart).not.toBe(dirtyDatePartOnly.datePart);
    expect(result).toEqual({
        datePart: { year: 2022, month: 0, dayOfMonth: 1, },
    });


    const goodDateTimeParts = {
        datePart: { year: 2021, month: 11, dayOfMonth: 31, },
        timePart: { hours: 12, minutes: 13, seconds: 14, milliseconds: 15, },
    };
    result = DTP.cleanDateTimePart(goodDateTimeParts);
    expect(result).toBe(goodDateTimeParts);


    const simpleTimeClean = {
        datePart: { year: 2021, month: 11, dayOfMonth: 31, },
        timePart: { hours: 23, minutes: 59, seconds: 59, milliseconds: 1000, },
    };
    result = DTP.cleanDateTimePart(simpleTimeClean);
    expect(result).not.toBe(simpleTimeClean);
    expect(result.datePart).not.toBe(simpleTimeClean.datePart);
    expect(result.timePart).not.toBe(simpleTimeClean.timePart);
    expect(result).toEqual({
        datePart: { year: 2022, month: 0, dayOfMonth: 1, },
        timePart: { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, },
    });


    const advanceDays = {
        datePart: { year: 2021, month: 11, dayOfMonth: 31, },
        timePart: { hours: 49, minutes: 30, seconds: 15, milliseconds: 10, },
    };
    result = DTP.cleanDateTimePart(advanceDays);
    expect(result).not.toBe(advanceDays);
    expect(result.datePart).not.toBe(advanceDays.datePart);
    expect(result.timePart).not.toBe(advanceDays.timePart);
    expect(result).toEqual({
        datePart: { year: 2022, month: 0, dayOfMonth: 2, },
        timePart: { hours: 1, minutes: 30, seconds: 15, milliseconds: 10, },
    });


    const backupDays = {
        datePart: { year: 2021, month: 11, dayOfMonth: 1, },
        timePart: { hours: -49, minutes: 30, seconds: 15, milliseconds: 10, },
    };
    result = DTP.cleanDateTimePart(backupDays);
    expect(result).not.toBe(backupDays);
    expect(result.datePart).not.toBe(backupDays.datePart);
    expect(result.timePart).not.toBe(backupDays.timePart);
    expect(result).toEqual({
        datePart: { year: 2021, month: 10, dayOfMonth: 29, },
        timePart: { hours: 23, minutes: 30, seconds: 15, milliseconds: 10, },
    });
});


//
//---------------------------------------------------------
//
test('DateTimePart-relation', () => {
    const dateOnlyA = {
        datePart: { year: 2021, month: 6, dayOfMonth: 15, },
    };
    expect(DTP.determineDateTimePartsRelation(dateOnlyA, dateOnlyA)).toEqual(
        DTP.DateTimePartRelation.SAME
    );

    const dateOnlyA_Copy = Object.assign({}, dateOnlyA);
    expect(DTP.determineDateTimePartsRelation(dateOnlyA, dateOnlyA_Copy)).toEqual(
        DTP.DateTimePartRelation.SAME
    );

    const dateOnlyB = {
        datePart: { year: 2021, month: 6, dayOfMonth: 16, },
    };
    expect(DTP.determineDateTimePartsRelation(dateOnlyA, dateOnlyB)).toEqual(
        DTP.DateTimePartRelation.BEFORE
    );
    expect(DTP.determineDateTimePartsRelation(dateOnlyB, dateOnlyA)).toEqual(
        DTP.DateTimePartRelation.AFTER
    );


    const dateTimeA = {
        datePart: dateOnlyA.datePart,
        timePart: { hours: 12, minutes: 30, seconds: 15, milliseconds: 10, },
    };
    expect(DTP.determineDateTimePartsRelation(dateTimeA, dateTimeA)).toEqual(
        DTP.DateTimePartRelation.SAME
    );


    const dateTimeA_Copy = Object.assign({}, dateTimeA);
    expect(DTP.determineDateTimePartsRelation(dateTimeA, dateTimeA_Copy)).toEqual(
        DTP.DateTimePartRelation.SAME
    );

    expect(DTP.determineDateTimePartsRelation(dateOnlyA, dateTimeA)).toEqual(
        DTP.DateTimePartRelation.SAME_DATE_BEFORE_TIME
    );
    expect(DTP.determineDateTimePartsRelation(dateTimeA, dateOnlyA)).toEqual(
        DTP.DateTimePartRelation.SAME_DATE_AFTER_TIME
    );


    const dateTimeA_1 = {
        datePart: dateOnlyA.datePart,
        timePart: { hours: 12, minutes: 30, seconds: 15, milliseconds: 11, },
    };
    expect(DTP.determineDateTimePartsRelation(dateTimeA, dateTimeA_1)).toEqual(
        DTP.DateTimePartRelation.SAME_DATE_BEFORE_TIME
    );
    expect(DTP.determineDateTimePartsRelation(dateTimeA_1, dateTimeA)).toEqual(
        DTP.DateTimePartRelation.SAME_DATE_AFTER_TIME
    );


    const dateTimeB = {
        datePart: dateOnlyB.datePart,
        timePart: dateTimeA.timePart,
    };
    expect(DTP.determineDateTimePartsRelation(dateTimeA, dateTimeB)).toEqual(
        DTP.DateTimePartRelation.BEFORE
    );
    expect(DTP.determineDateTimePartsRelation(dateTimeA, dateOnlyB)).toEqual(
        DTP.DateTimePartRelation.BEFORE
    );
    expect(DTP.determineDateTimePartsRelation(dateTimeB, dateTimeA)).toEqual(
        DTP.DateTimePartRelation.AFTER
    );
    expect(DTP.determineDateTimePartsRelation(dateOnlyB, dateTimeA)).toEqual(
        DTP.DateTimePartRelation.AFTER
    );
});


//
//---------------------------------------------------------
//
test('DateTimeRange-clean', () => {
    expect(DTP.cleanDateTimeRange()).toBeUndefined();
    expect(DTP.cleanDateTimeRange({})).toBeUndefined();


    const dateA = {
        year: 2021, month: 11, dayOfMonth: 31,
    };
    const timeA = {
        hours: 12, minutes: 30, seconds: 15, milliseconds: 10,
    };

    const dateB = {
        year: 2022, month: 0, dayOfMonth: 1,
    };
    const timeB = {
        hours: 12, minutes: 30, seconds: 15, milliseconds: 11,
    };


    //
    // Simple no changes....
    const rangeA_A = {
        startDatePart: dateA,
        finishDatePart: dateA,
    };
    expect(DTP.cleanDateTimeRange(rangeA_A)).toBe(rangeA_A);

    const rangeAA_BB = {
        startDatePart: dateA,
        startTimePart: timeA,
        finishDatePart: dateB,
        finishTimePart: timeB,
    };
    expect(DTP.cleanDateTimeRange(rangeAA_BB)).toBe(rangeAA_BB);

    const rangeAA_B = {
        startDatePart: dateA,
        startTimePart: timeA,
        finishDatePart: dateB,
    };
    expect(DTP.cleanDateTimeRange(rangeAA_B)).toBe(rangeAA_B);

    const rangeA_BB = {
        startDatePart: dateA,
        finishDatePart: dateB,
        finishTimePart: timeB,
    };
    expect(DTP.cleanDateTimeRange(rangeA_BB)).toBe(rangeA_BB);


    let result;

    //
    // No finish
    const rangeA = {
        startDatePart: dateA,
    };
    result = DTP.cleanDateTimeRange(rangeA);
    expect(result).not.toBe(rangeA);
    expect(result.startDatePart).not.toBe(dateA);
    expect(result).toEqual({
        startDatePart: dateA,
        finishDatePart: dateA,
    });

    const rangeAA = {
        startDatePart: dateA,
        startTimePart: timeA,
    };
    result = DTP.cleanDateTimeRange(rangeAA);
    expect(result).not.toBe(rangeAA);
    expect(result.startDatePart).not.toBe(dateA);
    expect(result).toEqual({
        startDatePart: dateA,
        startTimePart: timeA,
        finishDatePart: dateA,
    });

    const rangeAA_xB = {
        startDatePart: dateA,
        startTimePart: timeA,
        finishTimePart: timeB,
    };
    result = DTP.cleanDateTimeRange(rangeAA_xB);
    expect(result).not.toBe(rangeAA_xB);
    expect(result.startDatePart).not.toBe(dateA);
    expect(result).toEqual({
        startDatePart: dateA,
        startTimePart: timeA,
        finishDatePart: dateA,
        finishTimePart: timeB,
    });


    //
    // No start
    const range_B = {
        finishDatePart: dateB,
    };
    result = DTP.cleanDateTimeRange(range_B);
    expect(result).not.toBe(range_B);
    expect(result.finishDatePart).not.toBe(dateB);
    expect(result).toEqual({
        startDatePart: dateB,
        finishDatePart: dateB,
    });

    const range_BB = {
        finishDatePart: dateB,
        finishTimePart: timeB,
    };
    result = DTP.cleanDateTimeRange(range_BB);
    expect(result).not.toBe(range_BB);
    expect(result.finishDatePart).not.toBe(dateB);
    expect(result).toEqual({
        startDatePart: dateB,
        finishDatePart: dateB,
        finishTimePart: timeB,
    });

    const range_xA_BB = {
        startTimePart: timeA,
        finishDatePart: dateB,
        finishTimePart: timeB,
    };
    result = DTP.cleanDateTimeRange(range_xA_BB);
    expect(result).not.toBe(range_xA_BB);
    expect(result.finishDatePart).not.toBe(dateB);
    expect(result).toEqual({
        startDatePart: dateB,
        startTimePart: timeA,
        finishDatePart: dateB,
        finishTimePart: timeB,
    });


    //
    // Finish before start

    // Same day, times need swapping.
    const range_AB_AA = {
        startDatePart: dateA,
        startTimePart: timeB,
        finishDatePart: dateA,
        finishTimePart: timeA,
    };
    result = DTP.cleanDateTimeRange(range_AB_AA);
    expect(result).not.toBe(range_AB_AA);
    expect(result).toEqual({
        startDatePart: dateA,
        startTimePart: timeA,
        finishDatePart: dateA,
        finishTimePart: timeB,
    });

    // Different days, times must swap with days.
    const range_BA_AB = {
        startDatePart: dateB,
        startTimePart: timeA,
        finishDatePart: dateA,
        finishTimePart: timeB,
    };
    result = DTP.cleanDateTimeRange(range_BA_AB);
    expect(result).not.toBe(range_BA_AB);
    expect(result).toEqual({
        startDatePart: dateA,
        startTimePart: timeB,
        finishDatePart: dateB,
        finishTimePart: timeA,
    });

    const range_BA_Ax = {
        startDatePart: dateB,
        startTimePart: timeA,
        finishDatePart: dateA,
    };
    result = DTP.cleanDateTimeRange(range_BA_Ax);
    expect(result).not.toBe(range_BA_Ax);
    expect(result).toEqual({
        startDatePart: dateA,
        finishDatePart: dateB,
        finishTimePart: timeA,
    });

    const range_Bx_AB = {
        startDatePart: dateB,
        finishDatePart: dateA,
        finishTimePart: timeB,
    };
    result = DTP.cleanDateTimeRange(range_Bx_AB);
    expect(result).not.toBe(range_BA_AB);
    expect(result).toEqual({
        startDatePart: dateA,
        startTimePart: timeB,
        finishDatePart: dateB,
    });
});


//
//---------------------------------------------------------
//
test('determineDateTimePartRelationToRange', () => {

    const dateA = {
        year: 2021, month: 11, dayOfMonth: 31,
    };
    const timeA = {
        hours: 12, minutes: 30, seconds: 15, milliseconds: 10,
    };

    const dateB = {
        year: 2022, month: 0, dayOfMonth: 1,
    };
    const timeB = {
        hours: 12, minutes: 30, seconds: 15, milliseconds: 11,
    };
    const timeBC = {
        hours: 12, minutes: 30, seconds: 15, milliseconds: 12,
    };

    const dateC = {
        year: 2022, month: 0, dayOfMonth: 2,
    };
    const timeC = {
        hours: 12, minutes: 30, seconds: 15, milliseconds: 13,
    };

    const dateD = {
        year: 2022, month: 0, dayOfMonth: 3,
    };
    const timeD = {
        hours: 12, minutes: 30, seconds: 15, milliseconds: 14,
    };


    //
    // Full date/times, all separate.
    
    const range_BB_CC = {
        startDatePart: dateB,
        startTimePart: timeB,
        finishDatePart: dateC,
        finishTimePart: timeC,
    };
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, timePart: timeC, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.START_DATE_BUT_BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeB, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.START);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeC, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.DURING);
    
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, timePart: timeB, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.DURING);
    
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, timePart: timeC, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.FINISH);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.FINISH_DATE_BUT_AFTER);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateD, },
        range_BB_CC)).toEqual(DTP.DateTimeRangeRelation.AFTER);


    //
    // Full day start
    const range_Bx_CC = {
        startDatePart: dateB,
        finishDatePart: dateC,
        finishTimePart: timeC,
    };
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, },
        range_Bx_CC)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, timePart: timeB, },
        range_Bx_CC)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, },
        range_Bx_CC)).toEqual(DTP.DateTimeRangeRelation.START);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeA, },
        range_Bx_CC)).toEqual(DTP.DateTimeRangeRelation.DURING);
        

    //
    // Full day finish
    const range_BB_Cx = {
        startDatePart: dateB,
        startTimePart: timeB,
        finishDatePart: dateC,
    };
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, timePart: timeC, },
        range_BB_Cx)).toEqual(DTP.DateTimeRangeRelation.DURING);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, },
        range_BB_Cx)).toEqual(DTP.DateTimeRangeRelation.FINISH);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateD, timePart: timeC, },
        range_BB_Cx)).toEqual(DTP.DateTimeRangeRelation.AFTER);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateD, },
        range_BB_Cx)).toEqual(DTP.DateTimeRangeRelation.AFTER);


    //
    // Full day start and finish
    const range_Bx_Cx = {
        startDatePart: dateB,
        finishDatePart: dateC,
    };
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, timePart: timeA, },
        range_Bx_Cx)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, },
        range_Bx_Cx)).toEqual(DTP.DateTimeRangeRelation.START);
    
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeA, },
        range_Bx_Cx)).toEqual(DTP.DateTimeRangeRelation.DURING);
    
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, timePart: timeA, },
        range_Bx_Cx)).toEqual(DTP.DateTimeRangeRelation.DURING);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, },
        range_Bx_Cx)).toEqual(DTP.DateTimeRangeRelation.FINISH);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateD, timePart: timeC, },
        range_Bx_Cx)).toEqual(DTP.DateTimeRangeRelation.AFTER);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateD, },
        range_Bx_Cx)).toEqual(DTP.DateTimeRangeRelation.AFTER);

    
    //
    // Single day
    const range_Bx_Bx = {
        startDatePart: dateB,
        finishDatePart: dateB,
    };
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, timePart: timeA, },
        range_Bx_Bx)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, },
        range_Bx_Bx)).toEqual(DTP.DateTimeRangeRelation.START);
    
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeB, },
        range_Bx_Bx)).toEqual(DTP.DateTimeRangeRelation.DURING);

    // Having a timePart of midnight the next day is not the same as not
    // specifying a timePart.
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: { hours: 24, minutes: 0, seconds: 0, }, },
        range_Bx_Bx)).toEqual(DTP.DateTimeRangeRelation.AFTER);
            
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, },
        range_Bx_Bx)).toEqual(DTP.DateTimeRangeRelation.AFTER);


    //
    // Time within single day
    const range_BB_BC = {
        startDatePart: dateB,
        startTimePart: timeB,
        finishDatePart: dateB,
        finishTimePart: timeC,
    };
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, timePart: timeA, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.START_DATE_BUT_BEFORE);
    
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeA, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.START_DATE_BUT_BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeB, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.START);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeBC, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.DURING);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeC, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.FINISH);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeD, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.FINISH_DATE_BUT_AFTER);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, },
        range_BB_BC)).toEqual(DTP.DateTimeRangeRelation.AFTER);
    
        
    //
    // Single date, no times.
    const range_Bx_xx = {
        startDatePart: dateB,
    };
    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateA, timePart: timeA, },
        range_Bx_xx)).toEqual(DTP.DateTimeRangeRelation.BEFORE);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, },
        range_Bx_xx)).toEqual(DTP.DateTimeRangeRelation.START);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateB, timePart: timeB, },
        range_Bx_xx)).toEqual(DTP.DateTimeRangeRelation.DURING);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, },
        range_Bx_xx)).toEqual(DTP.DateTimeRangeRelation.AFTER);

    expect(DTP.determineDateTimePartRelationToRange(
        { datePart: dateC, timePart: { hours: 0, minutes: 0, seconds: 0, }},
        range_Bx_xx)).toEqual(DTP.DateTimeRangeRelation.AFTER);
            
});