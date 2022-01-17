import { LedMatrixInstance } from './matrix';

export type Coordinates = { x: number, y: number };
export type Size = { width: number, height: number };

export abstract class Widget {
    public origin: Coordinates = { x: 0, y: 0 };
    public size: Size;
    public border: number = 0;

    public fgColor = 0xFFFFFF;
    public bgColor = 0x000000;

    constructor(size: Size, border: number = 0) {
        this.size = size;
        this.border = border;
    }

    abstract draw(matrix: LedMatrixInstance): void;
}

export class FilledRectangle extends Widget {
    public draw(matrix: LedMatrixInstance): void {
        console.log(`  Drawing ${typeof this} from {${this.origin.x}, ${this.origin.y}} to {${this.origin.x + this.size.width}, ${this.origin.y + this.size.height}}`);

        if (matrix !== undefined) {
            matrix
                .fgColor(this.bgColor)
                .fill(this.origin.x, this.origin.y, this.origin.x + this.size.width, this.origin.y + this.size.height);

            if (this.border = 0) {
                matrix
                    .fgColor(this.fgColor)
                    .drawRect(this.origin.x, this.origin.y, this.size.width, this.size.height);
            }

            matrix.sync();
        }
    }
}