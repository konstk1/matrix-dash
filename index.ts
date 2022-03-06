
import 'dotenv/config';
import { matrix } from './src/matrix';
import { Page } from './src/page';
// @ts-ignore
import { WeatherWidget } from './src/widgets/weather-widget';
// @ts-ignore
import { ClockWidget } from './src/widgets/clock-widget';
// @ts-ignore
import { RouterWidget } from './src/widgets/router-widget';
// @ts-ignore
import { TextWidget } from './src/widgets/text-widget';
import { log } from './src/log';
// import { BufferWidget } from './src/widgets/buffer-widget';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

process.on("SIGINT", function() {
    log.warn("SIGINT, exiting...");
    process.exit(0);
});

async function main() {
    try {
        log.verbose('Matrix dash starting...');

        matrix && matrix.brightness(10);

        const page1 = new Page('page1');

        const clock = new ClockWidget({ width: 32, height: 16 }, 0);
        // clock.fgColor = 0xFF00FF;
        page1.addWidget(clock, { x: 0, y: 0 });

        const weather = new WeatherWidget({ width: 32, height: 16 }, 0);
        page1.addWidget(weather, { x: 32, y: 0 });

        // const router = new RouterWidget({ width: 64, height: 16 }, 0);
        // page1.addWidget(router, { x: 0, y: 16 });

        // const buffer = new BufferWidget({ width: 64, height: 16 }, 0);
        // page1.addWidget(buffer, { x: 0, y: 16 });

        const scroller = new TextWidget({ width: 64, height: 16 }, 0);
        scroller.setText('Maya needs a bath today');
        scroller.scrollSpeed = 1;
        scroller.fgColor = 0xFF00FF;
        page1.addWidget(scroller, { x: 0, y: 16 });

        page1.activate();

        while (true) {
            await sleep(1000);
        }

        page1.deactivate();
    } catch (error) {
        console.error(error);
    }
};

main();
