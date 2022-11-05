import { Widget, Size } from './widget';
// @ts-ignore
import { log } from '../log';

type Rgb = { r: number, g: number, b: number };

export class CanvasWidget extends Widget {

    private canvas: Rgb[][] = [];

    protected override updateIntervalMs: number = 30;

    private startTime: Date = new Date();

    constructor(size: Size, border: number = 0) {
        super(size, border);

        this.canvas = [...Array(size.width)].map(e => Array(size.height));
    }

    public override draw(sync: boolean = true): void {
        // draw background and border
        super.draw(false);

        if (!this.matrix) { return; }

        this.matrix.brightness(50);

        this.canvas.forEach((row, x) => {
            row.forEach((rgb, y) => {
                this.matrix.fgColor(rgb.r << 16 | rgb.g << 8 | rgb.b).setPixel(this.origin.x + x, this.origin.y + y);
            })
        });

        if (sync) {
            this.matrix.sync();
        }

        // log.debug(`  ${this.constructor.name} Drawing done`);
    }

    protected override update(): void {
        this.draw(true);
        const tMs = new Date().getTime() - this.startTime.getTime();
        const phase = -tMs * Math.PI / 1000;

        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                const yy = this.size.height - 3 + Math.round(3 * Math.sin((x / Math.PI) + phase));
                if (y == yy) {
                    this.canvas[x][yy] = { r: 255, g: 0, b: 0 };
                } else if (y > yy) {
                    this.canvas[x][y] = { r: 0, g: 0, b: 0 };
                } else if (Math.random() > ((y+1)/this.size.height/2)) {
                    this.canvas[x][y] = { r: 0, g: 0, b: 0 };
                } else {
                    this.canvas[x][y] = { 
                        r: Math.random() * 255, 
                        g: Math.random() * 255, 
                        b: Math.random() * 255,
                    };
                }
            }
            // const yy = this.size.height - 4 + Math.round(3 * Math.sin((x / Math.PI) + phase));
            // this.canvas[x][yy] = { r: 255, g: 0, b: 0 };
        }

    }

    public override activate(): void {
        this.startTime = new Date();
        super.activate();
    }

    public override deactivate(): void {
        super.deactivate();
    } 

}