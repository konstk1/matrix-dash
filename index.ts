
import 'dotenv/config';
import { matrix } from './src/matrix';
// import { Font } from 'rpi-led-matrix';
import { Page } from './src/page';
import { FilledRectangle } from './src/widgets/widget';
import { WeatherWidget } from './src/widgets/weather-widget';
import { ClockWidget } from './src/widgets/clock-widget';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// enum Colors {
//     black = 0x000000,
//     red = 0xFF0000,
//     green = 0x00FF00,
//     blue = 0x0000FF,
//     magenta = 0xFF00FF,
//     cyan = 0x00FFFF,
//     yellow = 0xFFFF00,
// };

(async () => {
    try {
        console.log('Matrix dash starting...');

        matrix && matrix.brightness(20);

        const page1 = new Page('page1');

        const clock = new ClockWidget({ width: 32, height: 16 }, 0);
        // clock.fgColor = 0xFF00FF;
        page1.addWidget(clock, { x: 0, y: 0 });

        const weather = new WeatherWidget({ width: 32, height: 16 }, 0);
        page1.addWidget(weather, { x: 32, y: 0 });

        const rect2 = new FilledRectangle({ width: 32, height: 16 }, 1);
        page1.addWidget(rect2, { x: 32, y: 16 });

        const rect3 = new FilledRectangle({ width: 32, height: 16 }, 1);
        // rect3.fgColor = 0xFF00FF;
        page1.addWidget(rect3, { x: 0, y: 16 });

        page1.activate();

        // console.log('Done');
        while (true) {
            await sleep(1000);
        }
        
        page1.deactivate();
    } catch (error) {
        console.error(error);
    }
})();
