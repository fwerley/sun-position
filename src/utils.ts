import { Coordinates, CurrectionObject } from "./types";

// Polar to Cartesian [r, theta] => [x, y]
const p2c = (pt: Array<number>): Array<number> => [pt[0] * Math.cos(pt[1]), pt[0] * Math.sin(pt[1])];
// Cartesian to Polar [x, y] => [r, theta]
const c2p = (pt: Array<number>): Array<number> => [Math.sqrt(pt[0] ** 2 + pt[1] ** 2), Math.atan2(pt[1], pt[0])];

// Dregrees to Radians
const degreesToRadians = (degrees: number): number => {
    return (degrees % 360) * (Math.PI / 180);
}

// Radians to Degress
const radiansToDegrees = (radians: number): number => {
    return radians * (180 / Math.PI);
}

// Correction of time values in the format 0 to 60
const correctionArrayHour = (array: Array<number>, values: CurrectionObject): Array<number> => {
    let hour = array[0];
    let minute = array[1] + values.minutes;
    let second = array[2] + values.seconds;

    if (second >= 60) {
        minute = minute + 1;
        second = second - 60;
    } else if (second < 0) {
        minute = minute - 1;
        second = 60 - Math.abs(second);
    }

    if (minute >= 60) {
        hour = hour + 1;
        minute = minute - 60;
    } else if (minute < 0) {
        hour = hour - 1;
        minute = 60 - Math.abs(minute);
    }

    return [hour, minute, second];
}

// Decimal time to hour, minute and seconds
const hd2hms = (hd: number): Array<number> => {
    let hend = Math.floor(hd);
    let med = (hd - hend) * 60;
    let mend = Math.floor((hd - hend) * 60);
    let sed = (med - mend) * 60;
    let send = Math.floor(sed);
    return [hend, mend, send];
}

// Request to the timezonedb api to fetch the timezone of the coordinates
const timeZone = async (coords: Coordinates) => {
    const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=DEDPTQRBKPR7&format=json&by=position&lat=${coords.lat}&lng=${coords.lng}`
    );
    return await response.json();
}

export {
    p2c,
    c2p,
    hd2hms,
    timeZone,
    degreesToRadians,
    radiansToDegrees,
    correctionArrayHour
}