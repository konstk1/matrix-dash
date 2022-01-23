import { FilledRectangle } from './widget';
import { Font } from '../matrix';

export class WeatherWidget extends FilledRectangle {
    public fontName: string =  '6x10';

    private tempF: number = 32;
    private timer?: NodeJS.Timer;

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        const text = `+${this.tempF}°F`;
        console.log(`  ${this.constructor.name} Drawing text: ${text}`);
        const font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);

        this.matrix
            .font(font)
            .fgColor(this.fgColor)
            .drawText(text, this.origin.x + 2, this.origin.y + 2, -1);

        if (sync) {
            this.matrix.sync();
        }

        console.log(`  ${this.constructor.name} Drawing done`);
    }

    public override activate(): void {
        console.log(`${this.constructor.name}: Activating`);
        this.timer = setInterval(() => {
            this.tempF += 1;
            this.draw(true);
        }, 2000);
    }

    public override deactivate(): void {
        console.log(`${this.constructor.name}: Deactivating`);
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}