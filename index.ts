
import 'dotenv/config';
import { matrix } from './src/matrix';
import { Page } from './src/page';
import { WeatherWidget } from './src/widgets/weather-widget';
import { ClockWidget } from './src/widgets/clock-widget';
import { TextWidget } from './src/widgets/text-widget';
import { log } from './src/log';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

process.on("SIGINT", function() {
    log.warn("SIGINT, exiting...");
    process.exit(0);
});

async function main() {
    try {
        log.verbose('Matrix dash starting...');

        matrix && matrix.brightness(20);

        const page1 = new Page('page1');

        const clock = new ClockWidget({ width: 32, height: 16 }, 0);
        // clock.fgColor = 0xFF00FF;
        page1.addWidget(clock, { x: 0, y: 0 });

        const weather = new WeatherWidget({ width: 32, height: 16 }, 0);
        page1.addWidget(weather, { x: 32, y: 0 });

        const message = new TextWidget({ width: 64, height: 16 }, 0);
        message.setText(' 10 Amherst');
        page1.addWidget(message, { x: 0, y: 16 });

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
