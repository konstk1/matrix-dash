import { TextWidget } from './text-widget';
import { Weather } from '../services/weather';
import { Color } from '../utils';
import log from '../log';

export class WeatherWidget extends TextWidget {
    protected override updateIntervalMs = 5 * 60 * 1000; // 5 mins

    private readonly weather = new Weather();
    private tempF = 0;
    private lastUpdated = new Date(0);

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }
        
        const tempStr = `+${this.tempF}`;
        const tempStrLen = this.font.stringWidth(tempStr, this.fontKerning);
        // log.debug(`  ${this.constructor.name} Drawing text: ${text}`);

        const startX = this.origin.x + 2;
        const startY = this.origin.y + 2;

        this.matrix
            .font(this.font)
            .fgColor(this.fgColor)
            .drawText(tempStr, startX, startY, this.fontKerning)
            .drawText('°', startX + tempStrLen - 1, startY, this.fontKerning) // -1 to push deg symbol closer to the number
            .drawText('F', startX + tempStrLen + this.font.stringWidth(' ', this.fontKerning), startY, this.fontKerning);

        const topRight = {
            x: this.origin.x + this.size.width - 1,
            y: this.origin.y,
        };

        // draw triangle in top right to indicate update time

        const now = new Date();
        const elapsedMs = (now.getTime() - this.lastUpdated.getTime());
        // if it's been more than 2 intervals since update, show red status, otherwise show green
        const statusColor = elapsedMs > (2 * this.updateIntervalMs) ? Color.red : Color.green;

        this.matrix
            .fgColor(statusColor)
            .drawLine(topRight.x - 2, topRight.y, topRight.x, topRight.y)
            .drawLine(topRight.x - 1, topRight.y + 1, topRight.x, topRight.y + 1)
            .drawLine(topRight.x, topRight.y + 2, topRight.x, topRight.y + 2)

        if (sync) {
            this.matrix.sync();
        }

        // log.debug(`  ${this.constructor.name} Drawing done`);
    }

    protected override async update() {
        try {
            const current = await this.weather.getWeather();
            this.tempF = Math.round(current.tempF);
            this.lastUpdated = new Date();
            // log.verbose(`Fetched weather... ${this.tempF}F at ${current.timestamp.toLocaleString()}`);
        } catch (error) {
            log.error('Error getting weather:', error);
        }

        this.draw(true);
    }
}