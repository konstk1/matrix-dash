import axios, { AxiosError } from 'axios'
import log from '../log'

// https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=42.462025805079605,42.351574641190844,-71.25805860152042,-71.02958140513239&adsb=1&air=1&array=1

type FlightInfo = {
  icao: string
  originAirport: string
  destinationAirport: string
}

export class FlightRadar {
  private readonly bounds = {
    latMin: Number(process.env.FR_BOUNDS_LAT_MIN),
    latMax: Number(process.env.FR_BOUNDS_LAT_MAX),
    lonMin: Number(process.env.FR_BOUNDS_LON_MIN),
    lonMax: Number(process.env.FR_BOUNDS_LON_MAX),
  }

  private readonly url = 'https://data-cloud.flightradar24.com/zones/fcgi/feed.js'
  private requestTimestamps: Date[] = []

  private flights: Record<string, FlightInfo> = {}

  private logRequest() {
    // keep track of requests in the last 24 hours
    this.requestTimestamps.push(new Date())
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    this.requestTimestamps = this.requestTimestamps.filter((d) => d > yesterday)
  }

  async fetchFlights(): Promise<any> {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
      params: {
        bounds: `${this.bounds.latMax},${this.bounds.latMin},${this.bounds.lonMin},${this.bounds.lonMax}`,
        adsb: '1',
        air: '1',
        array: '1',
      }
    }

    this.logRequest()

    try {
      const response = await axios.get(this.url, options)

      this.flights = {}

      for (const msg of response.data.aircraft) {
        const flightInfo = this.processFlightRadarMessage(msg)
        if (flightInfo) {
          this.flights[flightInfo.icao] = flightInfo
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError
        if (axiosError.response) {
          log.error(`Failed FR24 fetch: ${axiosError.response.status} ${axiosError.response.statusText}`)
        } else {
          log.error(`Failed FR24 fetch: ${axiosError.message}`)
        }
      } else {
        log.error(`Failed FR24 fetch: ${err}`)
      }
    }
  }

  private processFlightRadarMessage(data: (number | string)[]): FlightInfo | undefined {
    const icao = data[1] as string
    const originAirport = data[12] as string
    const destinationAirport = data[13] as string

    if (!icao) {
      return undefined
    }

    const info: FlightInfo = {
      icao,
      originAirport,
      destinationAirport,
    }
    return info
  }

  async getFlightInfo(icao: string): Promise<FlightInfo | undefined> {
    // fetch flights if this icao is not in the cache
    if (!this.flights[icao]) {
      log.info(`Fetching flight info for ${icao}, last 24 hrs: ${this.requestTimestamps.length}`)
      await this.fetchFlights()
    }
    return this.flights[icao]
  }

}