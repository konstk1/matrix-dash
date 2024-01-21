import { Widget } from './widget';
import { Font } from '../matrix';
import log from '../log'
import { FontInstance } from 'rpi-led-matrix';

export class TextWidget extends Widget {
    public fontName: string =  '6x10';
    public fontKerning = -1;

    public scrollSpeed = 0;
    
    // @ts-ignore
    private text = '';
    protected font: FontInstance

    private textSegments: string[] = [];
    private segmentSize = 4;

    protected textOffset = 0;

    constructor(size: { width: number, height: number }, border: number = 0) {
        super(size, border);
        this.font = new Font(this.fontName, `${process.cwd()}/node_modules/rpi-led-matrix/fonts/${this.fontName}.bdf`);
    }

    public setText(text: string) {
        this.text = text;
        this.textSegments = [];
        // log.debug('Splitting text: ', text);
        while (text) {
            this.textSegments.push(text.substring(0, this.segmentSize));
            text = text.substring(this.segmentSize);
            // log.debug(`Segment '${this.textSegments[this.textSegments.length - 1]}', left: ${text}`);
        }

        this.textOffset = this.scrollSpeed == 0 ? this.origin.x + this.textOffset : this.matrix.width();
        this.draw(true);
    }

    public override draw(sync: boolean = true): void {
        super.draw(false);

        if (!this.matrix) { return; }

        // log.debug(`  ${this.constructor.name} Drawing text: "${this.text}" at offset ${this.textOffset}`);
        this.matrix
            .font(this.font)
            .fgColor(this.fgColor);

        let offset = this.textOffset;


        for (const segment of this.textSegments) {
            this.matrix.drawText(segment, offset, this.origin.y + 2, this.fontKerning);
            offset = offset + this.font.stringWidth(segment, this.fontKerning);
        }

        if (sync) {
            this.matrix.sync();
        }

        // log.debug(`  ${this.constructor.name} Drawing done`);
    }

    // @ts-ignore
    protected override update(): void {
        if (this.scrollSpeed != 0) {
            this.textOffset = this.textOffset - 1;
            const textWidth = this.font.stringWidth(this.text, this.fontKerning)

            if (this.textOffset < -textWidth) {
                this.textOffset = this.matrix.width();
            }
        }

        this.draw(true);
    }

    public override activate(): void {
        log.verbose(`${this.constructor.name}: Activating`);
        if (this.scrollSpeed != 0) {
           this.updateIntervalMs = 80;
        }
        super.activate();
    }
}