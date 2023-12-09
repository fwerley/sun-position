
// All calculations were based on the following article
// https://www.omnicalculator.com/physics/sun-angle

import { correctionArrayHour, degreesToRadians, hd2hms, radiansToDegrees } from "./utils";

var SunPosition = (function () {
    let STANDARD_MERIDIAN = 0;
    let latitude = null;
    let longitude = null;
    let x = null;
    let angleDeclination = null;
    let locTime = {};
    let sunTime = null;
    let elevation = null;
    let azimuth = null;
    let durationDay = [];
    let sunrise = [];
    let sunset = [];
    let objectCurrection = {};

    // Calculate the angle of declination
    const calcDeclination = (date) => {
        let dateInit = new Date(`01/01/${date.getFullYear()}`);
        let dateEnd = date;
        let diff = Math.floor(dateEnd.getTime() - dateInit.getTime());
        let dayYear = diff / (1000 * 60 * 60 * 24);
        x = (360 / 365) * (dayYear - 81);
        angleDeclination = 23.45 * Math.sin(degreesToRadians(x));
    }

    // Hour angle according to local time
    const calcAngleHour = () => {
        let localTime = sunTime.moment;
        // For elevation calculation, consider non-standard time
        // The user's entry time must be understood as the official time of the location, therefore, the correction must be made
        // for calculating solar time.
        const time = localTime.getHours() + (localTime.getMinutes() / 60) + (localTime.getSeconds() / (60 * 60));
        const Eot = 9.87 * Math.sin(degreesToRadians(2 * x)) - 7.53 * Math.cos(degreesToRadians(x)) - 1.5 * Math.sin(degreesToRadians(x));
        // Outside the standard meridian, disregard the correction;
        // const solarTime = time + ((STANDARD_MERIDIAN - longitude) * 4 + Eot) / 60;
        const solarTimeReal = time + Eot / 60;
        return (solarTimeReal - 12) * 15;
    }

    // Elevation angle
    const angleElevation = () => {
        const angle = Math.sin(degreesToRadians(angleDeclination)) * Math.sin(degreesToRadians(latitude))
            + Math.cos(degreesToRadians(angleDeclination)) * Math.cos(degreesToRadians(latitude)) * Math.cos(degreesToRadians(calcAngleHour()));
        elevation = radiansToDegrees(Math.asin(angle));
        return elevation;
    }

    // Azimuth angle
    const angleAzimuth = () => {
        const angle = (Math.sin(degreesToRadians(angleDeclination)) * Math.cos(degreesToRadians(latitude))
            - Math.cos(degreesToRadians(angleDeclination)) * Math.sin(degreesToRadians(latitude)) * Math.cos(degreesToRadians(calcAngleHour()))) / Math.cos(degreesToRadians(elevation));
        azimuth = radiansToDegrees(Math.acos(angle));
        if (calcAngleHour() > 0) {
            azimuth = 360 - azimuth;
        }
        return azimuth;
    }

    // Calculate the length of the day, sunrise and sunset in local time and in the official time of the meridian that
    // governs the spindle
    const sunHour = (date) => {
        let hourDay = (2 / 15) * radiansToDegrees(Math.acos(-Math.tan(degreesToRadians(latitude)) * Math.tan(degreesToRadians(angleDeclination))));
        durationDay = hd2hms(hourDay);

        // Sunrise calculation
        let initDay = 12 - (hourDay / 2);
        sunrise = hd2hms(initDay);

        // Sunset calculation
        let endDay = 12 + (hourDay / 2);
        sunset = hd2hms(endDay);

        // Correct values above 60 or negative values in hourly data
        let STIC = correctionArrayHour(sunrise, { minutes: 0, seconds: 0 });
        let STEC = correctionArrayHour(sunset, { minutes: 0, seconds: 0 });

        sunTime = {
            moment: date,
            sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STIC[0], STIC[1], STIC[2]),
            sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STEC[0], STEC[1], STEC[2]),
        }

        // Correction of time to the region's official time
        let currection = ((STANDARD_MERIDIAN - longitude) * 60) / 15;
        let minutes = Math.floor(currection);
        let seconds = Math.floor((currection - minutes) * 60);
        objectCurrection = {
            minutes,
            seconds
        }
        STIC = correctionArrayHour(sunrise, objectCurrection);
        STEC = correctionArrayHour(sunset, objectCurrection);
        locTime = {
            sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STIC[0], STIC[1], STIC[2]),
            sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STEC[0], STEC[1], STEC[2]),
        };
    }

    const run = () => {
        angleElevation();
        angleAzimuth();
    }

    return {
        setLatitude: function (lat) {
            latitude = lat;
        },
        setLongitude: function (lng) {
            longitude = lng;
            STANDARD_MERIDIAN = Math.round(lng / 15) * 15;
        },
        setDateTime: function (dateTime) {
            calcDeclination(dateTime);
            sunHour(dateTime);
            calcAngleHour();
            run();
        },
        getDurationDay: () => durationDay,
        getSunrise: () => sunrise,
        getSunset: () => sunset,
        getDeclinationAngle: () => angleDeclination,
        getLocTime: () => locTime,
        getSunTime: () => sunTime,
        getElevation: () => elevation,
        getAzimuth: () => azimuth,
    }

}());

export default SunPosition;