import axios from 'axios'

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

  private flights: Record<string, FlightInfo> = {}

  async fetchFlights(): Promise<any> {
    const params = new URLSearchParams({
      bounds: `${this.bounds.latMax},${this.bounds.latMin},${this.bounds.lonMin},${this.bounds.lonMax}`,
      adsb: '1',
      air: '1',
      array: '1',
    })

    const response = await axios.get(this.url, {
      params,
    })

    this.flights = {}

    for (const msg of response.data.aircraft) {
      const flightInfo = this.processFlightRadarMessage(msg)
      if (flightInfo) {
        this.flights[flightInfo.icao] = flightInfo
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

  getFlightInfo(icao: string): FlightInfo | undefined {
    return this.flights[icao]
  }

}