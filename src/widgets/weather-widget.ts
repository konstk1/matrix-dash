import { FilledRectangle } from './widget';
import { Font } from '../matrix';
import { Weather } from '../services/weather';
import { Color } from '../utils';
import { log } from '../log';

export class WeatherWidget extends FilledRectangle {
    public fontName: string =  '6x10';
    public fontKerning = -1;
    public updateIntervalSec = 5 * 60;

    private readonly weather = new Weather();
    private tempF = 0;
    private lastUpdated = new Date(0);

    private timer?: NodeJS.Timer;

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        const font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);
        
        const tempStr = `+${this.tempF}`;
        const tempStrLen = font.stringWidth(tempStr, this.fontKerning);
        // log.debug(`  ${this.constructor.name} Drawing text: ${text}`);

        const now = new Date();
        const elapsedMin = (now.getTime() - this.lastUpdated.getTime()) / 1000 / 60;
        // if it's been more than 2 intervals since update, show red deg symbol, otherwise show green
        const degColor = elapsedMin > (this.updateIntervalSec * 2) ? Color.red : Color.green;

        const startX = this.origin.x + 3;
        const startY = this.origin.y + 3;

        this.matrix
            .font(font)
            .fgColor(this.fgColor)
            .drawText(tempStr, startX, startY, this.fontKerning)
            .fgColor(degColor)
            .drawText('°', startX + tempStrLen - 1, startY, this.fontKerning) // -1 to push deg symbol closer to the number
            .fgColor(this.fgColor)
            .drawText('F', startX + tempStrLen + font.stringWidth(' ', this.fontKerning), startY, this.fontKerning);

        if (sync) {
            this.matrix.sync();
        }

        // log.debug(`  ${this.constructor.name} Drawing done`);
    }

    private async updateWeather() {
        try {
            const current = await this.weather.getWeather();
            this.tempF = Math.round(current.tempF);
            this.lastUpdated = new Date();
            log.verbose(`Fetched weather... ${this.tempF}F at ${current.timestamp.toLocaleString()}`);
        } catch (error) {
            log.error('Error getting weather:', error);
        }

        this.draw(true);
    }

    public override activate(): void {
        log.verbose(`${this.constructor.name}: Activating`);
        this.updateWeather();
        this.timer = setInterval(this.updateWeather.bind(this), this.updateIntervalSec * 1000);
    }

    public override deactivate(): void {
        log.verbose(`${this.constructor.name}: Deactivating`);
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}