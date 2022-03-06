import { TextWidget } from './text-widget';
import { EdgeMax } from '../services/edgemax';

export class RouterWidget extends TextWidget {
    // protected override updateIntervalMs = 1000;
    private edgemax = new EdgeMax(process.env.EDGEMAX_HOST || '');

    constructor(size: { width: number, height: number }, border = 0) {
        super(size, border);
        this.edgemax.login().then(() => {
            this.edgemax.connectWebsocket()
        });

        this.edgemax.onStats = (stats: any) => {
            let upUnits = 'k';
            let up = stats.txBps * 8 / 1024;
            if (up > 1000) {
                upUnits = 'm'
                up = up / 1024;
            }

            let downUnits = 'k';
            let down = stats.rxBps * 8 / 1024;
            if (down > 1000) {
                downUnits = 'm'
                down = down / 1024;
            }

            const upStr = String(Math.round(up)).padStart(3, ' ');
            const downStr = String(Math.round(down)).padStart(3, ' ');

            this.setText(`↑${upStr}${upUnits} ↓${downStr}${downUnits}`);
            this.draw(true);
        };
    }
}