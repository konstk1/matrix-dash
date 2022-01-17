import { LedMatrixInstance, Font } from './matrix';

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

        // skip actual drawing if testing (matrix undefined)
        if (!matrix) {
            return;
        }

        console.log('  Actually drawing...');
        matrix
            .fgColor(this.bgColor)
            .fill(this.origin.x, this.origin.y, this.origin.x + this.size.width - 1, this.origin.y + this.size.height - 1);

        if (this.border > 0) {
            matrix
                .fgColor(this.fgColor)
                .drawRect(this.origin.x, this.origin.y, this.size.width - 1, this.size.height - 1);
        }

        matrix.sync();
    }
}

export class TextWidget extends FilledRectangle {
    public text: string = '+32°F';
    public fontName: string =  '6x10';

    public draw(matrix: LedMatrixInstance): void {
        super.draw(matrix);

        if (!matrix) { return; }

        console.log('  Drawing text: ', this.text);
        const font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);

        matrix
            .font(font)
            .fgColor(this.fgColor)
            .drawText(this.text, this.origin.x + 2, this.origin.y + 2, -1);

        matrix.sync();
        
    }
}