import { TextWidget } from './text-widget'
import { AircraftTracker } from '../services/aircrafttracker'
import { emitWidgetEvent } from '../events'
// @ts-ignore
import log from '../log'

const altitudeBreaks = [42650, 41010, 39370, 37730, 36090, 34450, 32810, 31170,
  29530, 27890, 26250, 24610, 22970, 21330, 19690, 18050,
  16400, 14760, 13120, 11480, 9840, 8200, 6560, 4920, 3940,
  3280, 2620, 1970, 1310, 980, 660, 330, 0]

const altitudeColors = [0xFF0000, 0xFF00E4, 0xD800FF, 0xAE00FF, 0x9600FF, 0x7800FF, 0x6000FF, 0x4E00FF,
  0x3600FF, 0x2400FF, 0x1200FF, 0x0000FF, 0x001EFF, 0x0030FF, 0x0054FF, 0x0078FF,
  0x0096FF, 0x00A8FF, 0x00C0FF, 0x00EAFF, 0x00FFE4, 0x00FFD2, 0x00FF9C, 0x00FF72,
  0x00FF36, 0x00FF0C, 0x1EFF00, 0x42FF00, 0xCCFF00, 0xF0FF00, 0xFFEA00, 0xFFE062, 0xFFFFFF]

const headingArrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']

export function getAltitudeColor(altitude: number) {
  for (let i = 0; i < altitudeBreaks.length; i++) {
    if (altitude >= altitudeBreaks[i]) {
      return altitudeColors[i]
    }
  }
  return 0xFFFFFF
}

export function getDistanceColor(distMi: number) {
  // scale altitude palette from 0 to 5 mi
  const numColors = altitudeColors.length
  const progress = distMi / 6
  const idx = Math.floor(progress * numColors)
  return altitudeColors[numColors - idx - 1]
}


export function getHeadingArrow(heading: number) {
  // house offset 45 degrees
  const index = Math.round((heading - 45 + 360) / 45) % 8
  console.log(`Heading: ${heading.toFixed(0)} Index: ${index} Arrow: ${headingArrows[index]}`)
  return headingArrows[index]
}

export class AircraftWidget extends TextWidget {
  private tracker: AircraftTracker = new AircraftTracker();

  protected override textOffset = 3;

  constructor(size: { width: number, height: number }, border = 0) {
    super(size, border)
    this.tracker.start()

    setInterval(this.updateAircraft.bind(this), 1000)
  }

  private updateAircraft() {
    // get closest aircraft
    this.tracker.getOverheadAircraft(9000).then((aircraft) => {
      // find closest by distance
      const closestAircraft = aircraft.reduce((prev, curr) => {
        return (prev.relative?.distanceFromHome ?? 0) < (curr.relative?.distanceFromHome ?? 0) ? prev : curr
      }, aircraft[0])

      if (closestAircraft) {
        log.debug(`Closest aircraft: ${closestAircraft.icao} ${closestAircraft.relative?.distanceFromHome}m ${closestAircraft.relative?.bearingFromHome.toFixed(0)}°`)
        log.debug(`${closestAircraft.flightInfo?.originAirport || 'N/A'} ⇒ ${closestAircraft.flightInfo?.destinationAirport || 'N/A'}`)

        // convert from meters to miles
        // const distMi = (closestAircraft.relative?.distanceFromHome ?? 0) * 0.621371 / 1000
        // set color based on altitude
        const altitude = closestAircraft.pos?.alt ?? 0
        this.fgColor = getAltitudeColor(altitude)
        const headingArrow = closestAircraft.relative?.bearingFromHome ? getHeadingArrow(closestAircraft.relative.bearingFromHome) : '*'
        this.setText(`${closestAircraft.flightInfo?.originAirport || 'N/A'} ⇒ ${closestAircraft.flightInfo?.destinationAirport || 'N/A'} ${headingArrow}`)
        emitWidgetEvent('RequestActive', this)
      } else {
        this.setText('')
        emitWidgetEvent('EndActive', this)
      }
    })
  }
}