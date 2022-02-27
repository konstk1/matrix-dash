import { TextWidget } from './text-widget';

export class ClockWidget extends TextWidget {
    protected override updateIntervalMs = 1000;

    private time: Date = new Date();
    private showSeparator: boolean = false;

    // @ts-ignore
    protected override update(): void {
        this.time = new Date();
        this.showSeparator = !this.showSeparator;

        let hours = this.time.getHours() % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        const hourStr = String(hours).padStart(2, ' ');
        const minStr = String(this.time.getMinutes()).padStart(2, '0');
        // const secs = String(this.time.getSeconds()).padStart(2, '0');

        this.text = ` ${hourStr}${this.showSeparator ? ':' : ' '}${minStr}`;
    
        super.update();
    }
}