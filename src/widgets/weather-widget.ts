import { FilledRectangle } from './widget';
import { Font } from '../matrix';
import { Weather } from '../services/weather';

export class WeatherWidget extends FilledRectangle {
    public fontName: string =  '6x10';
    public updateIntervalSec = 1 * 10;

    private readonly weather = new Weather();
    private tempF: number = 32;
    private timer?: NodeJS.Timer;

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        const text = `+${this.tempF}°F`;
        // console.log(`  ${this.constructor.name} Drawing text: ${text}`);
        const font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);

        this.matrix
            .font(font)
            .fgColor(this.fgColor)
            .drawText(text, this.origin.x + 3, this.origin.y + 3, -1);

        if (sync) {
            this.matrix.sync();
        }

        // console.log(`  ${this.constructor.name} Drawing done`);
    }

    private updateScreen(tempF: number) {
        this.tempF = Math.round(tempF);
        this.draw(true);
    }

    public override activate(): void {
        console.log(`${this.constructor.name}: Activating`);
        this.timer = setInterval(async () => {
            const current = await this.weather.getWeather();
            this.updateScreen(current.tempF);
        }, this.updateIntervalSec * 1000);
    }

    public override deactivate(): void {
        console.log(`${this.constructor.name}: Deactivating`);
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}