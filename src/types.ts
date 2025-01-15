
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
    zoneName: string | undefined,
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