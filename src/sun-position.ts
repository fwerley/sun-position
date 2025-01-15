import { CurrectionObject, LocTime, SunTime, TimeZone } from "./types";
import { correctionArrayHour, degreesToRadians, getOffset, hd2hms, radiansToDegrees, timeZoneName } from "./utils";

export class SunPosition {
    private STANDARD_MERIDIAN: number = 0;
    private lat: number;
    private lng: number;
    private TZ: Promise<TimeZone>;
    private x: number;
    private angleDeclination: number;
    private sunrise: Array<number>;
    private sunset: Array<number>;
    private elevation: number;
    private azimuth: number;
    private durationDay: Array<number>;
    private objectCurrection: CurrectionObject;
    private hourDay: number;
    private dateTimeLoc: Date;

    private floor = Math.floor;
    private round = Math.round;
    private sin = Math.sin;
    private cos = Math.cos;
    private tan = Math.tan;
    private asin = Math.asin;
    private acos = Math.acos;

    constructor(lat: number, lng: number, date: Date) {
        this.lat = lat;
        this.lng = lng;
        this.TZ = this.timeZoneObt();
        this.dateTimeLoc = date;
        this.calcDeclination();
        this.sunHour();
    }

    public setLatitude(lat: number): void {
        this.lat = lat;
        if (this.lat !== lat) {
            this.TZ = this.timeZoneObt();
        }
    }

    public setLongitude(lng: number): void {
        this.lng = lng;
        if (this.lng !== lng) {
            this.TZ = this.timeZoneObt();
        }
    }

    public setDateTime(dateTime: Date) {
        this.dateTimeLoc = dateTime;
        this.calcDeclination();
        this.sunHour();
    }

    public getDurationDay() {
        return this.durationDay;
    }

    public getDeclinationAngle() {
        return this.angleDeclination;
    }

    public async getTimeZone() {
        return this.TZ;
    }

    // Calculate the length of the day, sunrise and sunset in local time and in the official time of the meridian that
    // governs the spindle
    private sunHour(): void {
        this.hourDay = (2 / 15) * radiansToDegrees(this.acos(-this.tan(degreesToRadians(this.lat)) * this.tan(degreesToRadians(this.angleDeclination))));
        this.durationDay = hd2hms(this.hourDay);

        // Sunrise calculation
        let initDay = 12 - (this.hourDay / 2);
        this.sunrise = hd2hms(initDay);

        // Sunset calculation
        let endDay = 12 + (this.hourDay / 2);
        this.sunset = hd2hms(endDay);
    }

    // Equation of time currenction (obliquity and ellipticity)
    private Eot(): number {
        // Return in minutes
        let Eot = 9.87 * this.sin(degreesToRadians(2 * this.x)) - 7.53 * this.cos(degreesToRadians(this.x)) - 1.5 * this.sin(degreesToRadians(this.x));
        return Eot;
    }

    // Correction for position on the meridian in relation to local standard time.
    private currectionTime() {
        return new Promise<CurrectionObject>(async (resolve) => {
            // Standard time zone meridian. If the API request fails, 
            // set the meridian based on a multiple of 15 degrees
            this.STANDARD_MERIDIAN = (await this.TZ).gmtOffset ? ((await this.TZ).gmtOffset / (60 * 60)) * 15 : this.round(this.lng / 15) * 15;
            // Correction of time to the region's official time
            let currection = ((this.STANDARD_MERIDIAN - this.lng) * 4) - this.Eot();
            let minutes = this.round(currection);
            let seconds = this.round((currection - minutes) * 60);
            resolve({
                minutes,
                seconds
            })
        })
    }

    // Return function for solar time, with sunrise and sunset. Also returns the current input time corrected for solar time
    public getSunTime() {
        let date = this.dateTimeLoc;
        return new Promise<SunTime>(async (resolve) => {
            // COrrection to Local meridian
            let currection = await this.currectionTime();
            let eot = this.Eot();
            // Correct values above 60 or negative values in hourly data
            let SMT = correctionArrayHour([date.getHours(), date.getMinutes(), date.getSeconds()], { minutes: -currection.minutes, seconds: -currection.seconds });
            // Correction to Eot()
            let minutes = -this.round(eot);
            let seconds = -this.round((eot - minutes) * 60);
            let STIC = correctionArrayHour(this.sunrise, { minutes, seconds });
            let STEC = correctionArrayHour(this.sunset, { minutes, seconds });
            resolve({
                moment: new Date(date.getFullYear(), date.getMonth(), date.getDate(), SMT[0], SMT[1], SMT[2]),
                sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STIC[0], STIC[1], STIC[2]),
                sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STEC[0], STEC[1], STEC[2]),
            })
        })
    }

    // Return function to local time, with sunrise and sunset. Also returns the current entry time
    public getLocTime() {
        let date = this.dateTimeLoc;
        return new Promise<LocTime>(async (resolve) => {
            this.objectCurrection = await this.currectionTime();
            // Correct values above 60 or negative values in hourly data
            let STIC = correctionArrayHour(this.sunrise, this.objectCurrection);
            let STEC = correctionArrayHour(this.sunset, this.objectCurrection);
            resolve({
                moment: date,
                sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STIC[0], STIC[1], STIC[2]),
                sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STEC[0], STEC[1], STEC[2]),
            })
        }
        )
    }

    // Calculate the angle of declination
    private calcDeclination(): void {
        let date = this.dateTimeLoc;
        let dateInit = new Date(`01/01/${date.getFullYear()}`);
        let dateEnd = date;
        let diff = this.floor(dateEnd.getTime() - dateInit.getTime());
        let dayYear = diff / (1000 * 60 * 60 * 24);
        this.x = (360 / 365) * (dayYear - 81);
        this.angleDeclination = 23.45 * this.sin(degreesToRadians(this.x));
    }

    // Hour angle according to local time in hours
    private async calcAngleHour(): Promise<number> {
        let moment = (await this.getSunTime()).moment;
        // For elevation calculation, consider non-standard time
        // The user's entry time must be understood as the official time of the location, therefore, the correction must be made
        // for calculating solar time.
        const time = moment.getHours() + (moment.getMinutes() / 60) + (moment.getSeconds() / (60 * 60));
        return (time - 12) * 15;
    }

    // Elevation angle
    public getElevation(): Promise<number> {
        return new Promise(async (resolve) => {
            const angle = this.sin(degreesToRadians(this.angleDeclination)) * this.sin(degreesToRadians(this.lat))
                + this.cos(degreesToRadians(this.angleDeclination)) * this.cos(degreesToRadians(this.lat)) * this.cos(degreesToRadians(await this.calcAngleHour()));
            this.elevation = radiansToDegrees(this.asin(angle));
            resolve(this.elevation);
        })
    }

    // Azimuth angle
    public getAzimuth(): Promise<number> {
        return new Promise(async (resolve) => {
            const angle = (this.sin(degreesToRadians(this.angleDeclination)) * this.cos(degreesToRadians(this.lat))
                - this.cos(degreesToRadians(this.angleDeclination)) * this.sin(degreesToRadians(this.lat)) * this.cos(degreesToRadians(await this.calcAngleHour()))) / this.cos(degreesToRadians(this.elevation));
            if (await this.calcAngleHour() >= 0) {
                this.azimuth = 360 - radiansToDegrees(this.acos(angle));
            } else {
                this.azimuth = radiansToDegrees(this.acos(angle));
            }
            resolve(this.azimuth);
        })
    }

    // Return function with local time zone data
    private async timeZoneObt(): Promise<TimeZone> {
        const result = await timeZoneName({ lat: this.lat, lng: this.lng });
        // const result = await timeZone({ lat: this.lat, lng: this.lng });
        // Standard time zone meridian. If the API request fails, 
        // set the meridian based on a multiple of 15 degrees
        // this.STANDARD_MERIDIAN = result && result.gmtOffset ? (result.gmtOffset / (60 * 60)) * 15 : this.round(this.lng / 15) * 15;
        // return {           
        //     gmtOffset: result?.currentUtcOffset.seconds,
        //     zoneName: result?.timeZone
        // }
        const offset = getOffset(result && result[0]);
        this.STANDARD_MERIDIAN = offset ? (offset / (60 * 60)) * 15 : this.round(this.lng / 15) * 15;
        return {
            gmtOffset: offset,
            zoneName: result && result[0],
        }
    }
}