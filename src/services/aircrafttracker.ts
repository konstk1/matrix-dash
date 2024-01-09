import { log } from '../log'

type Position = {
  lat: number
  lon: number
  alt: number
}
export type AircraftInfo = {
  timestamp: Date
  icao: string
  ident?: {
    callsign: string
  }
  pos?: Position
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

  // @ts-ignore
  private readonly homePos: Position = {
    lat: Number(process.env.HOME_LAT),
    lon: Number(process.env.HOME_LON),
    alt: 0
  }

  private readonly staleTimeoutMs = 10000

  // @ts-ignore
  private timer?: NodeJS.Timer

  constructor() {

  }

  start() {
    // open tcp socket to ADSB host
    this.timer = setInterval(this.cleanStaleAircraft.bind(this), 1000)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  // http://woodair.net/sbs/article/barebones42_socket_data.htm
  processSbsMessage(message: string) {
    const fields = message.split(',').map(f => f.trim())

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
    if (fields[1] === '1') {
      const callsign = fields[10]
      // update callsign if ident exists, otherwise create ident with callsign
      console.log('callsign', callsign)
      if (info.ident) {
        info.ident.callsign = callsign
      } else {
        info.ident = { callsign }
      }
    }
    // MSG,3 is Position
    if (fields[1] === '3') {
      console.log('fields[11] :>> ', fields[10]);
      const alt = Number(fields[11])
      const lon = Number(fields[14])
      const lat = Number(fields[15])
      // update position if position exists, otherwise create position with position
      if (info.pos) {
        info.pos.alt = alt
        info.pos.lon = lon
        info.pos.lat = lat
      } else {
        info.pos = { lon, lat, alt }
      }
    }

    log.verbose(`Aircraft ${icao} updated: ${JSON.stringify(info)}`)

    this.aircraft[icao] = info
  }

  getAircraft(icao: string): AircraftInfo | undefined {
    return this.aircraft[icao]
  }

  getOverheadAircraft(): AircraftInfo[] {
    const overhead: AircraftInfo[] = []
    for (const icao in this.aircraft) {
      const aircraft = this.aircraft[icao]
      // TODO: calculate distance from home

      if (0) {
        overhead.push(aircraft)
      }
    }
    return overhead
  }

  private cleanStaleAircraft() {
    console.log('cleaing stale: ', this)

    const now = new Date()
    for (const icao in this.aircraft) {
      const aircraft = this.aircraft[icao]
      const diff = now.getTime() - aircraft.timestamp.getTime()
      // delete aircraft if haven't seen in some time
      if (diff > this.staleTimeoutMs) {
        console.log('Deleting stale aircraft: ', aircraft.icao)
        delete this.aircraft[icao]
      }
    }
  }
}