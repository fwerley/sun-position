# ![sun-position-logo](https://github.com/fwerley/sun-position/assets/54607927/9d93c232-d473-466c-8309-f39e91573d15)

> Status: Development ⚠️

### Calculate the position of the sun for a specific date, time and location. Calculate sunrise and sunset

Sun Position is a library under the ISC license. It aims to calculate and obtain the position of the sun for a location defined by geographic coordinates and a specific time.

The results of the lib returns can be checked at the following [site](https://www.omnicalculator.com/physics/sun-angle). 

Developed by [@fwerley](https://github.com/fwerley) 👨🏽‍💻

---

### Installation and use
```npm
npm i sun-position
```
```javascript
import SunPosition from 'sun-postion';
```

```javascript
const sunPosition = SunPosition;
const coords = {
    lat: -4.56454,
    lng: -38.9172
}

//Coordinate entry
sunPosition.setLatitude(coords.lat);
sunPosition.setLongitude(coords.lng);

// June 22, 2023, at 5 pm, 52 minutes and 3 seconds
const date = new Date(2023, 5, 22, 17, 52, 3);

// Date-time object input
sunPosition.setDateTime(date);

// Capturing feedback from the Sun's elevation angle and azimuth
let elevation = await sunPosition.getElevation();
let azimuth = await sunPosition.getAzimuth();

```
---
### References

##### Input Functions
<table>
    <tr bgColor="#aaa">
        <th>Property
        <th>Return
        <th>Description
    </tr>
     <tr>
        <td><code>setLatitude(number)</code>
        <td><code>void</code>
        <td>Latitude coordinate in decimal degrees
    </tr>
     <tr>
        <td><code>setLongitude(number)</code>
        <td><code>void</code>
        <td>Longitude coordinate in decimal degrees
    </tr>
     <tr>
        <td><code>setDateTime(Date)</code>
        <td><code>void</code>
        <td>Receives a JavaScript Date object as a parameter
    </tr>
<table>

##### Return functions

<table>
    <tr bgColor="#aaa">
        <th>Property
        <th>Return
        <th>Description
    </tr>
    <tr>
        <td><code>getDurationDay()</code>
        <td><code>Array&lt;number&gt;</code>
        <td>Array containing the total duration of the day, with three indices, in this order: hour, minute and second
    </tr>
    <tr>
        <td><code>getDeclinationAngle()</code>
        <td><code>number</code>
        <td>Sun declination angle for the input date.
            For more details <a href="https://www.pveducation.org/pvcdrom/properties-of-sunlight/declination-angle">Declination Angle</a>
    </tr>
    <tr>
        <td><code>getTimeZone()</code>
        <td><code>Promise&lt;TimeZone&gt;</code>
        <td>Object containing timezone information<br>
        <code>{<br>
    &nbsp;countryCode: string,<br>
    &nbsp;country: string,<br>
    &nbsp;region: string,<br>
    &nbsp;city: string,<br>
    &nbsp;zoneName: string,<br>
    &nbsp;gmtOffset: number, //The time offset in seconds based on UTC time.<br>
        }</code>
    </tr>
    <tr>
        <td><code>getLocTime()</code>
        <td><code>Promise&lt;LocTime&gt;</code>
        <td>Object containing sunrise and sunset times for local standard time.<br>
        <code>{<br>
            &nbsp;moment: Date, //input datetime<br>
            &nbsp;sunrise: Date,<br>
            &nbsp;sunset: Date<br>
        }</code>
    </tr>
    <tr>
        <td><code>getSunTime()</code>
        <td><code>Promise&lt;SunTime&gt;</code>
        <td>Object containing sunrise and sunset.<br>
        <blockquote>⚠️Solar time<br>
        No time correction to official meridian standard
        </blockquote>
        <code>{<br>
            &nbsp;moment: Date, <br>
            &nbsp;sunrise: Date,<br>
            &nbsp;sunset: Date<br>
        }</code>
    </tr>
    <tr>
        <td><code>getElevation()</code>
        <td><code>Promise&lt;number&gt;</code>
        <td>Elevation of the Sun in relation to the horizon, being 0° on the horizon and 90° when the Sun is positioned above the observer.
    </tr>
    <tr>
        <td><code>getAzimuth()</code>
        <td><code>Promise&lt;number&gt;</code>
        <td>Position of the Sun considering an imaginary line that connects the observer to the Sun, projected onto the horizontal, and with reference to geographic north. The azimuth angle is increasing with reference to the geographic north and heading east.
    </tr>
</table>

---

## Change history
+ Addition of the equation of time for hourly correction
##### 0.0.6 - December 24, 2023
#
+ Sunrise and sunset correction
##### 0.0.5 - December 24, 2023
#
+ Public version on npm
##### 0.0.4 - December 10, 2023
