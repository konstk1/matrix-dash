import { FilledRectangle } from './widget';
import { Font } from '../matrix';

export class ClockWidget extends FilledRectangle {
    public fontName: string =  '6x10';

    private time: Date = new Date();
    private showSeparator: boolean = false;

    private readonly updateIntervalMs: number = 1000;
    private timer?: NodeJS.Timer;

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        const hours = String(this.time.getHours() % 12).padStart(2, '0');
        const mins = String(this.time.getMinutes()).padStart(2, '0');
        // const secs = String(this.time.getSeconds()).padStart(2, '0');

        const text = `${hours}${this.showSeparator ? ':' : ' '}${mins}`;
        console.log(`  ${this.constructor.name} Drawing text: ${text}`);

        const font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);

        this.matrix
            .font(font)
            .fgColor(this.fgColor)
            .drawText(text, this.origin.x + 3, this.origin.y + 3, -1);

        if (sync) {
            this.matrix.sync();
        }

        console.log(`  ${this.constructor.name} Drawing done`);
    }

    public override activate(): void {
        console.log(`${this.constructor.name}: Activating`);
        this.timer = setInterval(() => {
            this.time = new Date();
            this.showSeparator = !this.showSeparator;
            this.draw(true);
        }, this.updateIntervalMs);
    }

    public override deactivate(): void {
        console.log(`${this.constructor.name}: Deactivating`);
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}