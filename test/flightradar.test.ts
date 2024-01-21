import { FlightRadar } from '../src/services/flightradar'
import { readTestDataFile } from './utils'
import axios from 'axios'
import { mocked } from 'jest-mock'

jest.mock('axios')

describe('FlightRadar', () => {
  const fr = new FlightRadar()

  it('Gets flight info', async () => {
    const data = readTestDataFile('fr24_feed.json')
    mocked(axios).get.mockResolvedValue({ data: JSON.parse(data) })

    const expected: any = {
      'A4347B': {
        icao: 'A4347B',
        originAirport: 'BOS',
        destinationAirport: 'HNL',
      },
      'AB17DD': {
        icao: 'AB17DD',
        originAirport: 'BED',
        destinationAirport: '',
      },
      'A95F5C': {
        icao: 'A95F5C',
        originAirport: 'BVY',
        destinationAirport: '',
      },
    }

    for (const icao in expected) {
      const flight = await fr.getFlightInfo(icao)
      expect(flight).toEqual(expected[icao])
    }

    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it.skip('Fetches FR24 feed', async () => {
    await fr.fetchFlights()
  })
})
