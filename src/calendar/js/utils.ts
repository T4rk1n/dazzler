const daysInMonth: {[key: number]: number} = {
    0: 31,
    2: 31,
    3: 30,
    4: 31,
    5: 30,
    6: 31,
    7: 31,
    8: 30,
    9: 31,
    10: 30,
    11: 31,
};

export function isLeapYear(year: number): boolean {
    return year % 4 === 0 || year % 100 === 0 || year % 400 === 0;
}

export function monthLength(month: number, year: number): number {
    if (month === 1) {
        return isLeapYear(year) ? 29 : 28;
    }
    return daysInMonth[month];
}

export function nextMonth(month: number, year: number): [number, number] {
    if (month === 11) {
        return [0, year + 1];
    }
    return [month + 1, year];
}

export function prevMonth(month: number, year: number): [number, number] {
    if (month === 0) {
        return [11, year - 1];
    }
    return [month - 1, year];
}

export function firstDayOfTheMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
}
