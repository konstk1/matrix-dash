
import { matrix } from './src/matrix';
// import { Font } from 'rpi-led-matrix';
import { Page } from './src/page';
import { FilledRectangle } from './src/widgets/widget';
import { TextWidget } from './src/widgets/text-widget';

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

        matrix && matrix.brightness(30);

        const page1 = new Page('page1');

        const rect1 = new FilledRectangle({ width: 32, height: 16 }, 1);
        rect1.fgColor = 0xFF00FF;
        page1.addWidget(rect1, { x: 0, y: 0 });

        const rect2 = new FilledRectangle({ width: 32, height: 16 }, 0);
        rect2.bgColor = 0xFF0000;
        page1.addWidget(rect2, { x: 32, y: 0 });

        const rect3 = new FilledRectangle({ width: 32, height: 16 }, 1);
        rect3.fgColor = 0xFF00FF;
        page1.addWidget(rect3, { x: 0, y: 16 });

        const rect4 = new TextWidget({ width: 32, height: 16 }, 1);
        page1.addWidget(rect4, { x: 32, y: 16 });

        page1.draw();

        for (let i = 0; i < 10; i++) {
          rect4.text = `+${i+30}°F`;
          rect4.draw(true);
          await sleep(2000);
        }
        // console.log('Done');
        await sleep(20000);
    } catch (error) {
        console.error(error);
    }
})();
