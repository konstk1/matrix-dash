import { AircraftInfo, AircraftTracker } from '../src/services/aircrafttracker'
import { getAltitudeColor } from '../src/widgets/aircraft-widget'
import { readTestDataFile, sleepMs } from './utils'

describe('AircraftTracker', () => {
  const tracker = new AircraftTracker()

  beforeAll(() => {
    tracker.start()
  })

  afterAll(() => {
    tracker.stop()
  })

  it.only('Processes SBS messages', () => {
    const data = readTestDataFile('adsb_feed.csv')
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

    // expect(tracker.getOverheadAircraft(5000)).toHaveLength(0)
    expect(tracker.getOverheadAircraft(9000)).toHaveLength(1)
  })

  it('Gets altitude color', () => {
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