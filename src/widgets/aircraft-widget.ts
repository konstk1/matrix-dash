import { TextWidget } from './text-widget'
import { AircraftTracker } from '../services/aircrafttracker'
import { log } from '../log'

export class AircraftWidget extends TextWidget {
    protected override updateIntervalMs = 1000;

    private tracker: AircraftTracker = new AircraftTracker();

    protected override textOffset = 3;

    constructor(size: { width: number, height: number }, border = 0) {
        super(size, border)
        this.tracker.start()
    }

    // @ts-ignore
    protected override update(): void {
        // get closest aircraft
        const aircraft = this.tracker.getOverheadAircraft(9000)
        // find closest by distance
        const closestAircraft = aircraft.reduce((prev, curr) => {
            return (prev.relative?.distanceFromHome ?? 0) < (curr.relative?.distanceFromHome ?? 0) ? prev : curr
        }, aircraft[0])

        log.debug(`Closest aircraft: ${JSON.stringify(closestAircraft)}`)

        if (closestAircraft) {
            // convert from meters to miles
            const distMi = (closestAircraft.relative?.distanceFromHome ?? 0) * 0.621371 / 1000
            // set color based on altitude
            const altitude = closestAircraft.pos?.alt ?? 0)
            if (altitude > 20000) {
                this.fgColor = 0xFF00FF
            } else if (altitude > 10000) {
                this.fgColor = 0x0000FF
            } else if (altitude > 5000) {
                this.fgColor = 0x00FF00
            } else {
                this.fgColor = 0xFFFF00
            }
            this.setText(`${closestAircraft.ident?.callsign ?? 'N/A'} ${distMi.toFixed(1)}mi`)
        } else {
            this.setText('')
        }

        super.update()
    }
}