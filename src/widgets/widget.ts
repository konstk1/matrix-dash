import { matrix } from '../matrix';

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

    constructor(size: Size, border: number = 0) {
        this.size = size;
        this.border = border;
    }

    public abstract draw(sync: boolean): void;

    public activate(): void {
        console.log(`${this.constructor.name}: activate not implemented`);
    }

    public deactivate(): void {
        console.log(`${this.constructor.name}: deactivate not implemented`);
    }
}

export class FilledRectangle extends Widget {
    public draw(sync: boolean = true): void {
        console.log(`  ${this.constructor.name} drawing from {${this.origin.x}, ${this.origin.y}} to {${this.origin.x + this.size.width}, ${this.origin.y + this.size.height}}`);

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
}
