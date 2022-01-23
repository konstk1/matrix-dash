import { FilledRectangle } from './widget';
import { Font } from '../matrix';

export class TextWidget extends FilledRectangle {
    public fontName: string =  '6x10';

    private text = '';

    public setText(text: string) {
        this.text = text;
        this.draw(true);
    }

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        console.log(`  ${this.constructor.name} Drawing text: ${this.text}`);
        const font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);

        this.matrix
            .font(font)
            .fgColor(this.fgColor)
            .drawText(this.text, this.origin.x + 2, this.origin.y + 2, -1);

        if (sync) {
            this.matrix.sync();
        }

        console.log(`  ${this.constructor.name} Drawing done`);
    }
}