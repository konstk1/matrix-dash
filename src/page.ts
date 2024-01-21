import { matrix } from './matrix';
import { Widget, Coordinates } from './widgets/widget';
// @ts-ignore
import log from './log';

export class Page {
    public title: string;
    public widgets: Widget[] = [];

    private matrix = matrix;

    constructor(title: string) {
        this.title = title
    }

    public addWidget(widget: Widget, origin: Coordinates) {
        widget.origin = origin;
        this.widgets.push(widget);
    }

    public draw() {
        // log.verbose(`Drawing page ${this.title}`);
        this.widgets.forEach(widget => {
            widget.draw(false);
        });
        
        if (this.matrix) {
            this.matrix.sync();
        }
    }

    public activate() {
        this.draw();
        this.widgets.forEach(widget => {
            widget.activate();
        });
    }

    public deactivate() {
        this.widgets.forEach(widget => {
            widget.deactivate();
        });
    }
}