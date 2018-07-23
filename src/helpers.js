/* eslint-disable */

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        let context = this,
            args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args)
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args)
    }
};

export const copyObject = obj => {
    return JSON.parse(JSON.stringify(obj))
};

export const findAncestor = (element, selector) => {
    if (!element) {
        return null
    }
    if (typeof element.closest === 'function') {
        return element.closest(selector) || null
    }
    while (element) {
        if (element.matches(selector)) {
            return element
        }
        element = element.parentElement
    }
    return null
};

export const randomString = length => {
    let text = '';
    let possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
};

export const isWeekend = date => {

    const d = new Date(date);
    const getTot = daysInMonth(d.getMonth(), d.getFullYear());
    const sat = [];
    const sun = [];

    for (let i = 1; i <= getTot; i++) {
        let newDate = new Date(d.getFullYear(), d.getMonth(), i);
        if (newDate.getDay() === 0) {
            sat.push(i)
        }
        if (newDate.getDay() === 6) {
            sun.push(i)
        }

    }

    return {
        sat,
        sun
    };

    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }
};

export const reverseDate = function (date) {

    if (!date) {
        return;
    }

    let splitDate = date.split(`.`);
    if (splitDate.count === 0) {
        return null;
    }

    let year = splitDate[0];
    let month = splitDate[1];
    let day = splitDate[2];

    return day + `.` + month + `.` + year;
};

export const compareNumbers = (a, b) => {
    return a.item - b.item;
};

export const inRange = (x, min, max) => {
    if (min > max) {
        return false;
    }
    return ((x - min) * (x - max) <= 0);
};
