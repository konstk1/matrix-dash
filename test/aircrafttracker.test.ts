import { AircraftInfo, AircraftTracker } from '../src/services/aircrafttracker'
import { getAltitudeColor } from '../src/widgets/aircraft-widget'

const data = `
MSG, 7, 1, 1, A20433, 1, 2024 /01 /09,00: 26: 36.989, 2024 /01 /09,00: 26: 37.031,, 37000,,,,,,,,,,
MSG, 1, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.024, 2024 /01 /09,00: 26: 37.031, DAL2352,,,,,,,,,,, 0
MSG, 4, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 37.078, 2024 /01 /09,00: 26: 37.085,,, 251, 330,,, 1984,,,,, 0
MSG, 7, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 37.174, 2024 /01 /09,00: 26: 37.195,, 8850,,,,,,,,,,
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.350, 2024 /01 /09,00: 26: 37.358,, 2000,,,,,,,,,,
MSG, 4, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.354, 2024 /01 /09,00: 26: 37.413,,, 166, 301,,, 1728,,,,, 0
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.368, 2024 /01 /09,00: 26: 37.413,, 2000,,,,,,,,,,
MSG, 3, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.404, 2024 /01 /09,00: 26: 37.413,, 2000,,, 42.391663, -71.045837,,, 0,, 0, 0
MSG, 3, 1, 1, A20433, 1, 2024 /01 /09,00: 26: 37.498, 2024 /01 /09,00: 26: 37.522,, 37000,,, 42.238495, -71.608575,,, 0,, 0, 0
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.613, 2024 /01 /09,00: 26: 37.631,, 2025,,,,,,,,,,
MSG, 7, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 37.629, 2024 /01 /09,00: 26: 37.686,, 8850,,,,,,,,,,
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.653, 2024 /01 /09,00: 26: 37.686,, 2025,,,,,,,,,,
MSG, 5, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.673, 2024 /01 /09,00: 26: 37.686,, 2025,,,,,,, 0,, 0,
MSG, 3, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 37.718, 2024 /01 /09,00: 26: 37.741,, 8850,,, 42.633133, -71.131231,,, 0,, 0, 0
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.824, 2024 /01 /09,00: 26: 37.850,, 2025,,,,,,,,,,
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 37.940, 2024 /01 /09,00: 26: 37.959,, 2025,,,,,,,,,,
MSG, 4, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 38.028, 2024 /01 /09,00: 26: 38.068,,, 250, 329,,, 2048,,,,, 0
MSG, 4, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 38.185, 2024 /01 /09,00: 26: 38.232,,, 168, 301,,, 1728,,,,, 0
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 38.300, 2024 /01 /09,00: 26: 38.341,, 2025,,,,,,,,,,
MSG, 1, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 38.308, 2024 /01 /09,00: 26: 38.341, ASA357,,,,,,,,,,, 0
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 38.312, 2024 /01 /09,00: 26: 38.341,, 2025,,,,,,,,,,
MSG, 7, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 38.322, 2024 /01 /09,00: 26: 38.341,, 8875,,,,,,,,,,
MSG, 7, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 38.368, 2024 /01 /09,00: 26: 38.396,, 2025,,,,,,,,,,
MSG, 7, 1, 1, A28A2C, 1, 2024 /01 /09,00: 26: 38.392, 2024 /01 /09,00: 26: 38.451,, 8875,,,,,,,,,,
MSG, 3, 1, 1, A3ED7C, 1, 2024 /01 /09,00: 26: 38.455, 2024 /01 /09,00: 26: 38.505,, 2025,,, 42.392051, -71.046796,,, 0,, 0, 0
`

async function sleepMs(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('AircraftTracker', () => {
  const tracker = new AircraftTracker()

  beforeAll(() => {
    tracker.start()
  })

  afterAll(() => {
    tracker.stop()
  })

  it.skip('Processes SBS messages', () => {
    const messages = data.split('\n')
    messages.forEach(message => {
      tracker.processSbsMessage(message)
    })

    const expected: AircraftInfo[] = [{
      timestamp: expect.any(Date),
      icao: 'A3ED7C',
      ident: { callsign: 'DAL2352' },
      pos: { lat: 42.392051, lon: -71.046796, alt: 2025, }
    }, {
      timestamp: expect.any(Date),
      icao: 'A28A2C',
      pos: { lat: 42.633133, lon: -71.131231, alt: 8850, },
      ident: { callsign: 'ASA357' }
    }, {
      timestamp: expect.any(Date),
      icao: 'A20433',
      pos: { lat: 42.238495, lon: -71.608575, alt: 37000, },
      ident: undefined
    }]

    for (const a of expected) {
      const aircraft = tracker.getAircraft(a.icao)
      expect(aircraft).toEqual(a)
      // verify timestamp is within 10ms of now
      expect(aircraft!.timestamp.getTime()).toBeCloseTo(new Date().getTime(), -1)
    }

    expect(tracker.getAircraft('A12345')).toBeUndefined()

    expect(tracker.getOverheadAircraft(5000)).toHaveLength(0)
    expect(tracker.getOverheadAircraft(9000)).toHaveLength(1)
  })

  it.only('Gets altitude color', () => {
    // test a few altitudes between 0 and 45000 feet
    const altitudes = [0, 1000, 3500, 10_000, 36_090, 43_000]
    const expectedColors = [0xFFFFFF, 0xF0FF00, 0x00FF0C, 0x00FFE4, 0x9600FF, 0xFF0000]
    for (let i = 0; i < altitudes.length; i++) {
      console.log(`Testing altitude ${altitudes[i]}: ${expectedColors[i]}`)
      expect(getAltitudeColor(altitudes[i])).toEqual(expectedColors[i])
    }
  })

  it.skip('Opens and reads socket', async () => {
    // wait 20 seconds
    await sleepMs(20000)
  }, 21000)

  it.skip('Gets overhead aircraft', async () => {
    for (let i = 0; i < 20; i++) {
      await sleepMs(3000)
      console.log(tracker.getOverheadAircraft(9000))
    }

  }, 60000)
})