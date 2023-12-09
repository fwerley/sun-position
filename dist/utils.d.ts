import { CurrectionObject } from "./types";
declare const p2c: (pt: Array<number>) => Array<number>;
declare const c2p: (pt: Array<number>) => Array<number>;
declare const degreesToRadians: (degrees: number) => number;
declare const radiansToDegrees: (radians: number) => number;
declare const correctionArrayHour: (array: Array<number>, values: CurrectionObject) => Array<number>;
declare const hd2hms: (hd: number) => Array<number>;
export { p2c, c2p, hd2hms, degreesToRadians, radiansToDegrees, correctionArrayHour };
