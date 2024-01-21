import { Widget } from './widget';
import log from '../log';
// import { FontInstance } from 'rpi-led-matrix';

export class TimerWidget extends Widget {

    public override fgColor = 0xA52A2A;
    public override bgColor = 0x000000;

    private durationMs = 0;
    private startTime: Date = new Date();

    private pixelsToFill = 0;

    protected override updateIntervalMs: number = 1000;

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        this.matrix
            .fgColor(this.bgColor)
            .fill(this.origin.x, this.origin.y, this.origin.x + this.size.width - 1, this.origin.y + this.size.height - 1)
            .fgColor(this.fgColor);

        const start = new Date();

        // fill pixels
        loop1:
        for (let col = 0; col < this.size.width; col++) {
            for (let row = 0; row < this.size.height; row++) {
                this.matrix.setPixel(this.origin.x + col, this.origin.y + row);
                // log.debug(`Filling pixel ${this.origin.x + col}, ${this.origin.y + row}`);
                this.pixelsToFill -= 1;
                if (this.pixelsToFill <= 0) {
                    break loop1;
                }
            }
        }

        const end = new Date();

        log.debug(`${this.constructor.name}: draw took ${end.getTime() - start.getTime()} ms`);

        if (sync) {
            this.matrix.sync();
        }

        // log.debug(`  ${this.constructor.name} Drawing done`);
    }

    protected override update(): void {
        const now = new Date();
        const elapsedMs = now.getTime() - this.startTime.getTime();

        if (elapsedMs > this.durationMs) {
            this.deactivate();
        }
            
        const totalPixels = this.size.width * this.size.height;
        const pixelsPerMs = totalPixels / this.durationMs;
        this.pixelsToFill = Math.round(pixelsPerMs * elapsedMs);
        // clamp to max pixels
        this.pixelsToFill = Math.min(this.pixelsToFill, totalPixels);


        log.debug(`Timer: elapsed ${elapsedMs} / ${this.durationMs} ms, ${this.pixelsToFill} / ${totalPixels} pixels to fill`);

        this.draw(true);
    }

    public start(durationSec: number): void {
        this.durationMs = durationSec * 1000;
        this.startTime = new Date();
        this.activate();
    }

    public stop(): void {
        this.durationMs = 0;
        this.deactivate();
    }

}