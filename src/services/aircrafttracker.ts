import * as net from 'net'
import { isPointWithinRadius, getDistance, getGreatCircleBearing } from 'geolib'
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
  private readonly adsbHost = process.env.ADSB_HOST || 'localhost'
  private readonly adsbPort = Number(process.env.ADSB_PORT) || 30003

  private socket = new net.Socket()

  private readonly aircraft: Record<string, AircraftInfo> = {}

  private readonly homePos: Position = {
    lat: Number(process.env.HOME_LAT),
    lon: Number(process.env.HOME_LON),
    alt: 0
  }

  private readonly staleTimeoutMs = 10000

  private timer?: NodeJS.Timeout

  constructor() {
    this.socket.on('data', this.onSocketData.bind(this))
    this.socket.on('error', (err) => {
      log.error('ADSB socket error: ', err)
    })
    this.socket.on('close', () => {
      log.error('ADSB socket closed')
    })
  }

  start() {
    // open tcp socket to ADSB host
    this.socket.connect(this.adsbPort, this.adsbHost, () => {
      console.log('Connected to ADSB host')
    })

    this.timer = setInterval(this.cleanStaleAircraft.bind(this), 1000)
  }

  stop() {
    this.socket.destroy()
    clearInterval(this.timer)
  }

  private onSocketData(data: Buffer) {
    const messages = data.toString().split('\n')
    messages.forEach(message => {
      this.processSbsMessage(message)
    })
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

    // update timestamp on any message
    info.timestamp = new Date()

    // MSG,1 is IDENT
    if (fields[1] === '1') {
      const callsign = fields[10]
      // update callsign if ident exists, otherwise create ident with callsign
      if (info.ident) {
        info.ident.callsign = callsign
      } else {
        info.ident = { callsign }
      }
    }
    // MSG,3 is Position
    if (fields[1] === '3') {
      const alt = Number(fields[11])
      const lat = Number(fields[14])
      const lon = Number(fields[15])
      // update position if position exists, otherwise create position with position
      if (info.pos) {
        info.pos.alt = alt
        info.pos.lon = lon
        info.pos.lat = lat
      } else {
        info.pos = { lon, lat, alt }
      }
    }

    // log.verbose(`Aircraft (${Object.keys(this.aircraft).length}) ${icao} updated: ${info.ident?.callsign} (${info.pos?.lat}, ${info.pos?.lon})`)

    this.aircraft[icao] = info
  }

  getAircraft(icao: string): AircraftInfo | undefined {
    return this.aircraft[icao]
  }

  getOverheadAircraft(radiusM: number): AircraftInfo[] {
    const overhead: AircraftInfo[] = []

    for (const icao in this.aircraft) {
      const plane = this.aircraft[icao]

      if (!plane.pos || !plane.ident) {
        continue
      }

      plane.relative = {
        distanceFromHome: getDistance(this.homePos, plane.pos),
        bearingFromHome: getGreatCircleBearing(this.homePos, plane.pos)
      }

      // console.log(`${plane.ident.callsign} is ${plane.relative?.distanceFromHome}m from home (bearing ${plane.relative?.bearingFromHome})`)
      if (isPointWithinRadius(plane.pos, this.homePos, radiusM)) {
        overhead.push(plane)
      }
    }

    return overhead
  }

  private cleanStaleAircraft() {
    const now = new Date()
    for (const icao in this.aircraft) {
      const aircraft = this.aircraft[icao]
      const diff = now.getTime() - aircraft.timestamp.getTime()
      // delete aircraft if haven't seen in some time
      if (diff > this.staleTimeoutMs) {
        delete this.aircraft[icao]
        // console.log(`--> Deleted stale aircraft (${Object.keys(aircraft).length}): ${aircraft.icao}`)
      }
    }
  }
}