import { log } from '../log'

export type AircraftInfo = {
  timestamp: Date
  icao: string
  ident?: {
    callsign: string
  }
  pos?: {
    lat: number
    lon: number
    altitude: number
  }
  relative?: {
    distanceFromHome: number
    bearingFromHome: number
  }
  flightInfo?: {
    originAirport: string
    destinationAirport: string
  }
}

export class AircraftTracker {
  // private readonly adsbHost = process.env.ADSB_HOST
  // private readonly adsbPort = process.env.ADSB_PORT

  private readonly aircraft: Record<string, AircraftInfo> = {}

  constructor() {
    // open tcp socket to ADSB host

  }

  // http://woodair.net/sbs/article/barebones42_socket_data.htm
  processSbsMessage(message: string) {
    const fields = message.split(',')

    // only process
    if (fields[0] !== 'MSG') {
      return
    }

    const transmissionType = fields[1]

    // skip anything but 1 and 3
    if (transmissionType !== '1' && transmissionType !== '3') {
      return
    }

    const icao = fields[4]
    const info = this.aircraft[icao] || {
      timestamp: new Date(),
      icao,
    }

    // MSG,1 is IDENT
    if (fields[1] !== '1') {
      const callsign = fields[10]
      // update callsign if ident exists, otherwise create ident with callsign
      if (info.ident) {
        info.ident.callsign = callsign
      } else {
        info.ident = { callsign }
      }
    }
    // MSG,3 is Position
    if (fields[1] !== '3') {
      const altitude = Number(fields[11])
      const lon = Number(fields[14])
      const lat = Number(fields[15])
      // update position if position exists, otherwise create position with position
      if (info.pos) {
        info.pos.altitude = altitude
        info.pos.lon = lon
        info.pos.lat = lat
      } else {
        info.pos = { altitude, lon, lat }
      }
    }

    log.verbose(`Aircraft ${icao} updated: ${JSON.stringify(info)}`)

    this.aircraft[icao] = info
  }

}