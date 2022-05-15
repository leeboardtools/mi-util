import { getCalendarInfo } from './CalendarInfo';


test('getCalendarInfo', () => {
    let calendarInfo = getCalendarInfo('en-US');

    expect(calendarInfo).toEqual({
        longNames: {
            monthNames: [
                'January', 'February', 'March', 'April', 'May', 'June', 'July', 
                'August', 'September', 'October', 'November', 'December'
            ],
            weekdayNames: [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
                'Thursday', 'Friday', 'Saturday',
            ]
        },
        shortNames: {
            monthNames: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 
                'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            weekdayNames: [
                'Sun', 'Mon', 'Tue', 'Wed', 
                'Thu', 'Fri', 'Sat',
            ]
        },
        narrowNames: {
            monthNames: [
                'J', 'F', 'M', 'A', 'M', 'J', 'J', 
                'A', 'S', 'O', 'N', 'D'
            ],
            weekdayNames: [
                'S', 'M', 'T', 'W', 
                'T', 'F', 'S',
            ]
        },
    });


    calendarInfo = getCalendarInfo('es-ES');

    expect(calendarInfo).toEqual({
        longNames: {
            monthNames: [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 
                'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ],
            weekdayNames: [
                'domingo', 'lunes', 'martes', 'miércoles', 
                'jueves', 'viernes', 'sábado',
            ]
        },
        shortNames: {
            monthNames: [
                'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 
                'ago', 'sept', 'oct', 'nov', 'dic'
            ],
            weekdayNames: [
                'dom', 'lun', 'mar', 'mié', 
                'jue', 'vie', 'sáb',
            ]
        },
        narrowNames: {
            monthNames: [
                'E', 'F', 'M', 'A', 'M', 'J', 'J', 
                'A', 'S', 'O', 'N', 'D'
            ],
            weekdayNames: [
                'D', 'L', 'M', 'X', 
                'J', 'V', 'S',
            ]
        },
    });
});