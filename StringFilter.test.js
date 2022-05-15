import { stringToFilterablePhrase, stringToFilterablePhraseSet, stringToFilterablePhraseMap, 
    compileFilterSpec } from './StringFilter';


//
//---------------------------------------------------------
//
test('stringToFilterablePhrase', () => {
    expect(stringToFilterablePhrase()).toBeUndefined();
    expect(stringToFilterablePhrase('')).toEqual('');
    expect(stringToFilterablePhrase('  A  ')).toEqual('A');
    expect(stringToFilterablePhrase(' \nA\t\n  BC')).toEqual('A BC');
});


//
//---------------------------------------------------------
//
test('stringToFilterablePhraseSet', () => {
    let result;

    result = stringToFilterablePhraseSet();
    expect(result).toBeUndefined();

    result = stringToFilterablePhraseSet('');
    expect(Array.from(result.values())).toEqual([]);

    result = stringToFilterablePhraseSet(' The ');
    expect(Array.from(result.values())).toEqual([
        'THE',
    ]);

    result = stringToFilterablePhraseSet(' The Quick   \tBrown ');
    expect(Array.from(result.values())).toEqual([
        'THE QUICK BROWN',
        'THE QUICK',
        'THE',
        'QUICK BROWN',
        'QUICK',
        'BROWN',
    ]);

    result = stringToFilterablePhraseSet('The   Very\tQuick Brown Fox   ');
    expect(Array.from(result.values())).toEqual([
        'THE VERY QUICK BROWN FOX',
        'THE VERY QUICK BROWN',
        'THE VERY QUICK',
        'THE VERY',
        'THE',
        'VERY QUICK BROWN FOX',
        'VERY QUICK BROWN',
        'VERY QUICK',
        'VERY',
        'QUICK BROWN FOX',
        'QUICK BROWN',
        'QUICK',
        'BROWN FOX',
        'BROWN',
        'FOX',
    ]);

    //                          01234567890 123456789_12345678
    result = stringToFilterablePhraseSet(' The   Very\tQuick  The Very  ');
    expect(Array.from(result.values())).toEqual([
        'THE VERY QUICK THE VERY', 
        'THE VERY QUICK THE',
        'THE VERY QUICK',
        'THE VERY',
        'THE', 
        'VERY QUICK THE VERY',
        'VERY QUICK THE',
        'VERY QUICK',
        'VERY',
        'QUICK THE VERY',
        'QUICK THE',
        'QUICK',
    ]);
});


//
//---------------------------------------------------------
//
test('stringToFilterablePhraseMap', () => {
    let result;
    result = stringToFilterablePhraseMap();
    expect(result).toBeUndefined();

    result = stringToFilterablePhraseMap('');
    expect(Array.from(result.entries())).toEqual([
    ]);

    result = stringToFilterablePhraseMap(' The ');
    expect(Array.from(result.entries())).toEqual([
        [ 'THE', [1], ],
    ]);

    //                          01234567890 123456789_12345678
    result = stringToFilterablePhraseMap(' The   Very\tQuick  The Very  ');
    expect(Array.from(result.entries())).toEqual([
        [ 'THE VERY QUICK THE VERY', 
            [ 1, ]],
        [ 'THE VERY QUICK THE',
            [ 1, ]],
        [ 'THE VERY QUICK',
            [ 1, ]],
        [ 'THE VERY',
            [ 1, 19, ]],
        [ 'THE', 
            [ 1, 19, ]],
        [ 'VERY QUICK THE VERY',
            [ 7, ]],
        [ 'VERY QUICK THE',
            [ 7, ]],
        [ 'VERY QUICK',
            [ 7, ]],
        [ 'VERY',
            [ 7, 23, ]],
        [ 'QUICK THE VERY',
            [12, ]],
        [ 'QUICK THE',
            [12, ]],
        [ 'QUICK',
            [12, ]],
    ]);
});


//
//---------------------------------------------------------
//
test('compileFilterSpec', () => {
    const refString = ' The  quick    brown   fox "Wise Foxy" jumps  over the\nLazy Dog.';
    const refFilterablePhraseSet = stringToFilterablePhraseSet(refString);

    let filter = compileFilterSpec('Quick');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('Quickly');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    filter = compileFilterSpec('brown yellow');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    filter = compileFilterSpec('brown OR yellow');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('quick brown OR yellow');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('quickly brown OR yellow');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    filter = compileFilterSpec('quick brown OR yellow red');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    // "OR" in quotes is literal
    filter = compileFilterSpec('brown "OR" yellow');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();


    //
    // Not
    filter = compileFilterSpec('-brown');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    filter = compileFilterSpec('-yellow');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('brown -yellow');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('brown -yellow red');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    filter = compileFilterSpec('brown fox');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    //
    // Quoted
    filter = compileFilterSpec('"brown fox"');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('"fox brown"');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    //
    // Missing terminating quote
    filter = compileFilterSpec(' "brown fox');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec(' "fox brown');
    expect(filter(refFilterablePhraseSet)).toBeFalsy();

    //
    // Parenthesis
    //     const refString = ' The  quick    brown   fox "Wise Foxy" jumps  over the\nLazy Dog.';
    // Treated as '(quick AND yellow) OR brown)'
    filter = compileFilterSpec('quick yellow OR brown');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('quick (yellow OR brown) jumps');
    expect(filter(refFilterablePhraseSet)).toBeTruthy();

    filter = compileFilterSpec('A OR B C OR D');
    expect(filter(stringToFilterablePhraseSet(' D'))).toBeTruthy();

    filter = compileFilterSpec('(A OR B) (C OR D)');
    expect(filter(stringToFilterablePhraseSet(' D'))).toBeFalsy();
    expect(filter(stringToFilterablePhraseSet(' D B'))).toBeTruthy();

    filter = compileFilterSpec('-(A OR B) (C OR D)');
    expect(filter(stringToFilterablePhraseSet(' D B'))).toBeFalsy();
    expect(filter(stringToFilterablePhraseSet(' D'))).toBeTruthy();
});