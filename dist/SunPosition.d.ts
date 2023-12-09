import { LocTime, SunTime } from "./types";
declare var SunPosition: {
    setLatitude: (lat: number) => void;
    setLongitude: (lng: number) => void;
    setDateTime: (dateTime: Date) => void;
    getDurationDay: () => number[];
    getDeclinationAngle: () => number;
    getLocTime: () => LocTime;
    getSunTime: () => SunTime;
    getElevation: () => number;
    getAzimuth: () => number;
};
export default SunPosition;
