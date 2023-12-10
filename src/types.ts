
type LocTime = {
    moment: Date,
    sunrise: Date,
    sunset: Date
}
type SunTime = {
    moment: Date,
    sunrise: Date,
    sunset: Date
}

type CurrectionObject = {
    minutes: number,
    seconds: number
}

type TimeZone = {
    countryCode: string,
    country: string,
    region: string,
    city: string,
    zoneName: string,
    gmtOffset: number,
}

type Coordinates = {
    lat: number,
    lng: number
}

export {
    LocTime,
    SunTime,
    TimeZone,
    Coordinates,
    CurrectionObject
}