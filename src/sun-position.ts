
// All calculations were based on the following article
// https://www.omnicalculator.com/physics/sun-angle

import { CurrectionObject, LocTime, SunTime, TimeZone } from "./types";
import { correctionArrayHour, degreesToRadians, hd2hms, radiansToDegrees, timeZone } from "./utils";

var SunPosition = (function () {
    let STANDARD_MERIDIAN: number = 0;
    let latitude: number;
    let longitude: number;
    let TZ: Promise<TimeZone>;
    let x: number;
    let angleDeclination: number;
    let sunrise: Array<number>;
    let sunset: Array<number>;
    let elevation: number;
    let azimuth: number;
    let durationDay: Array<number>;
    let objectCurrection: CurrectionObject;
    let hourDay: number;
    let dateTimeLoc: Date;

    const floor = Math.floor;
    const round = Math.round;
    const sin = Math.sin;
    const cos = Math.cos;
    const tan = Math.tan;
    const asin = Math.asin;
    const acos = Math.acos;

    // Calculate the angle of declination
    const calcDeclination = () => {
        let date = dateTimeLoc;
        let dateInit = new Date(`01/01/${date.getFullYear()}`);
        let dateEnd = date;
        let diff = floor(dateEnd.getTime() - dateInit.getTime());
        let dayYear = diff / (1000 * 60 * 60 * 24);
        x = (360 / 365) * (dayYear - 81);
        angleDeclination = 23.45 * sin(degreesToRadians(x));
    }

    // Hour angle according to local time
    const calcAngleHour = async () => {
        let moment = (await funST()).moment;
        // For elevation calculation, consider non-standard time
        // The user's entry time must be understood as the official time of the location, therefore, the correction must be made
        // for calculating solar time.
        const time = moment.getHours() + (moment.getMinutes() / 60) + (moment.getSeconds() / (60 * 60));
        const Eot = 9.87 * sin(degreesToRadians(2 * x)) - 7.53 * cos(degreesToRadians(x)) - 1.5 * sin(degreesToRadians(x));
        // Outside the standard meridian, disregard the correction;
        const solarTimeReal = time + Eot / 60;
        return (solarTimeReal - 12) * 15;
    }

    // Elevation angle
    const angleElevation = (): Promise<number> => {
        return new Promise(async (resolve) => {
            const angle = sin(degreesToRadians(angleDeclination)) * sin(degreesToRadians(latitude))
                + cos(degreesToRadians(angleDeclination)) * cos(degreesToRadians(latitude)) * cos(degreesToRadians(await calcAngleHour()));
            elevation = radiansToDegrees(asin(angle));
            resolve(elevation);
        })
    }

    // Azimuth angle
    const angleAzimuth = (): Promise<number> => {
        return new Promise(async (resolve) => {
            const angle = (sin(degreesToRadians(angleDeclination)) * cos(degreesToRadians(latitude))
                - cos(degreesToRadians(angleDeclination)) * sin(degreesToRadians(latitude)) * cos(degreesToRadians(await calcAngleHour()))) / cos(degreesToRadians(elevation));
            if (await calcAngleHour() > 0) {
                azimuth = 360 - radiansToDegrees(acos(angle));
            } else {
                azimuth = radiansToDegrees(acos(angle));
            }
            resolve(azimuth);
        })
    }

    // Calculate the length of the day, sunrise and sunset in local time and in the official time of the meridian that
    // governs the spindle
    const sunHour = () => {
        hourDay = (2 / 15) * radiansToDegrees(acos(-tan(degreesToRadians(latitude)) * tan(degreesToRadians(angleDeclination))));
        durationDay = hd2hms(hourDay);

        // Sunrise calculation
        let initDay = 12 - (hourDay / 2);
        sunrise = hd2hms(initDay);

        // Sunset calculation
        let endDay = 12 + (hourDay / 2);
        sunset = hd2hms(endDay);
    }

    const currectionTime = () => {
        return new Promise<CurrectionObject>(async (resolve) => {
            // Standard time zone meridian. If the API request fails, 
            // set the meridian based on a multiple of 15 degrees
            STANDARD_MERIDIAN = (await TZ).gmtOffset ? ((await TZ).gmtOffset / (60 * 60)) * 15 : round(longitude / 15) * 15;
            // Correction of time to the region's official time
            let currection = ((STANDARD_MERIDIAN - longitude) * 60) / 15;
            let minutes = floor(currection);
            let seconds = floor((currection - minutes) * 60);
            resolve({
                minutes,
                seconds
            })
        })
    }

    const funST = () => {
        let date = dateTimeLoc;
        return new Promise<SunTime>(async (resolve) => {
            let currection = await currectionTime();
            // Correct values above 60 or negative values in hourly data
            let STIC = correctionArrayHour(sunrise, { minutes: 0, seconds: 0 });
            let SMT = correctionArrayHour([date.getHours(), date.getMinutes(), date.getSeconds()], { minutes: -currection.minutes, seconds: -currection.seconds });
            let STEC = correctionArrayHour(sunset, { minutes: 0, seconds: 0 });
            resolve({
                moment: new Date(date.getFullYear(), date.getMonth(), date.getDate(), SMT[0], SMT[1], SMT[2]),
                sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STIC[0], STIC[1], STIC[2]),
                sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STEC[0], STEC[1], STEC[2]),
            })
        })
    }

    const funLT = () => {
        let date = dateTimeLoc;
        return new Promise<LocTime>(async (resolve) => {
            objectCurrection = await currectionTime()
            // Correct values above 60 or negative values in hourly data
            let STIC = correctionArrayHour(sunrise, { minutes: 0, seconds: 0 });
            let STEC = correctionArrayHour(sunset, { minutes: 0, seconds: 0 });
            STIC = correctionArrayHour(sunrise, objectCurrection);
            STEC = correctionArrayHour(sunset, objectCurrection);
            resolve({
                moment: date,
                sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STIC[0], STIC[1], STIC[2]),
                sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STEC[0], STEC[1], STEC[2]),
            })
        }
        )
    }

    const timeZoneObt = async (): Promise<TimeZone> => {
        const result = await timeZone({ lat: latitude, lng: longitude });
        // Standard time zone meridian. If the API request fails, 
        // set the meridian based on a multiple of 15 degrees
        STANDARD_MERIDIAN = result.gmtOffset ? (result.gmtOffset / (60 * 60)) * 15 : round(longitude / 15) * 15;
        return {
            city: result.cityName,
            country: result.countryName,
            countryCode: result.countryCode,
            gmtOffset: result.gmtOffset,
            region: result.regionName,
            zoneName: result.zoneName
        }
    }

    return {
        setLatitude: function (lat: number) {
            latitude = lat;
        },
        setLongitude: function (lng: number) {
            longitude = lng;
            TZ = timeZoneObt();
        },
        setDateTime: function (dateTime: Date) {
            dateTimeLoc = dateTime;
            calcDeclination();
            sunHour();
        },
        getDurationDay: () => durationDay,
        getDeclinationAngle: () => angleDeclination,
        getTimeZone: async () => TZ,
        getLocTime: funLT,
        getSunTime: funST,
        getElevation: angleElevation,
        getAzimuth: angleAzimuth,
    }

}());

export default SunPosition;