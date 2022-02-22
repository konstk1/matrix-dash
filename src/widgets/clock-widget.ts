import { FilledRectangle } from './widget';
import { Font } from '../matrix';
import { log } from '../log';

export class ClockWidget extends FilledRectangle {
    public fontName: string =  '6x10';

    private time: Date = new Date();
    private showSeparator: boolean = false;

    private readonly updateIntervalMs: number = 1000;
    private timer?: NodeJS.Timer;

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        let hours = this.time.getHours() % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        const hourStr = String(hours).padStart(2, ' ');
        const minStr = String(this.time.getMinutes()).padStart(2, '0');
        // const secs = String(this.time.getSeconds()).padStart(2, '0');

        const text = `${hourStr}${this.showSeparator ? ':' : ' '}${minStr}`;
        // log.debug(`  ${this.constructor.name} Drawing text: ${text}`);

        const font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);

        this.matrix
            .font(font)
            .fgColor(this.fgColor)
            .drawText(text, this.origin.x + 3, this.origin.y + 3, -1);

        if (sync) {
            this.matrix.sync();
        }

        // log.debug(`  ${this.constructor.name} Drawing done`);
    }

    public override activate(): void {
        log.verbose(`${this.constructor.name}: Activating`);
        this.timer = setInterval(() => {
            this.time = new Date();
            this.showSeparator = !this.showSeparator;
            this.draw(true);
        }, this.updateIntervalMs);
    }

    public override deactivate(): void {
        log.verbose(`${this.constructor.name}: Deactivating`);
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}