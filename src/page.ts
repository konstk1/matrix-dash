import { LedMatrixInstance } from './matrix';
import { Widget, Coordinates } from './widget';

export class Page {
    private matrix: LedMatrixInstance;
    public title: string;
    public widgets: Widget[] = [];

    constructor(matrix: LedMatrixInstance, title: string) {
        this.matrix = matrix;
        this.title = title
    }

    public addWidget(widget: Widget, origin: Coordinates) {
        widget.origin = origin;
        this.widgets.push(widget);
    }

    public draw() {
        console.log(`Drawing page ${this.title}`);
        this.widgets.forEach(widget => {
            widget.draw(this.matrix);
        });
    }
}