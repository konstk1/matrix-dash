import { matrix } from '../matrix';
import log from '../log';

export type Coordinates = { x: number, y: number };
export type Size = { width: number, height: number };

export abstract class Widget {
    public origin: Coordinates = { x: 0, y: 0 };
    public size: Size;
    public border: number = 0;

    public fgColor = 0xFFFFFF;
    public bgColor = 0x000000;

    // @ts-ignore
    protected matrix = matrix;

    protected updateIntervalMs: number = 0;
    protected timer?: NodeJS.Timeout;

    constructor(size: Size, border: number = 0) {
        this.size = size;
        this.border = border;
    }

    public draw(sync: boolean = true): void {
        // log.debug(`  ${this.constructor.name} drawing from {${this.origin.x}, ${this.origin.y}} to {${this.origin.x + this.size.width}, ${this.origin.y + this.size.height}}`);

        // skip actual drawing if testing (matrix undefined)
        if (!matrix) {
            return;
        }

        matrix
            .fgColor(this.bgColor)
            .fill(this.origin.x, this.origin.y, this.origin.x + this.size.width - 1, this.origin.y + this.size.height - 1);

        if (this.border > 0) {
            matrix
                .fgColor(this.fgColor)
                .drawRect(this.origin.x, this.origin.y, this.size.width - 1, this.size.height - 1);
        }

        if (sync) {
            matrix.sync();
        }
    }

    protected update(): void {
        this.draw(true);
    }

    // default activation is timer based
    public activate(): void {
        log.warn(`${this.constructor.name}: activate widget`);
        this.update();

        if (this.updateIntervalMs > 0) {
            if (this.timer) {
                log.warn(`Timer ${this.timer} already exist`);
            } else {
                this.timer = setInterval(this.update.bind(this), this.updateIntervalMs);
                // log.debug(`Timer ${this.timer} activated`);
            }
        }
    }

    public deactivate(): void {
        log.warn(`${this.constructor.name}: deactivate widget`);
        if (this.timer) {
            // log.debug(`Timer ${this.timer} deactivated`);
            clearInterval(this.timer);
        }
    }
}

