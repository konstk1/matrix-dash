
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
// @ts-ignore
import { BabyTracker } from './src/services/babytracker';
// import { BufferWidget } from './src/widgets/buffer-widget';
// @ts-ignore
import { TimerWidget } from './src/widgets/timer-widget';
// @ts-ignore
import { CanvasWidget } from './src/widgets/canvas-widget';
import { ChatGPT } from './src/services/chatgpt';
const BH1750 = require('bh1750-sensor');

const options = {
    readMode: BH1750.ONETIME_H_RESOLUTION_MODE
};

const bh1750 = new BH1750(options);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// @ts-ignore
function babyBrotherAge() {
    const today = new Date();
    const birthDate = new Date('2022-04-26');
    const timeDiff = today.getTime() - birthDate.getTime();
    const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

const bt = new BabyTracker();
const chatgpt = new ChatGPT();

// @ts-ignore
async function getLastMeds() {
    try {
        await bt.sync();
    } catch (error) {
        let errorMessage = "";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log.error('BT sync error:', errorMessage);
        return 'BT error';
    }

    const now = new Date();
    const timeDiffIbuprofen = now.getTime() - bt.lastIbuprofenTime.getTime();
    const timeDiffAcetaminophen = now.getTime() - bt.lastAcetaminophenTime.getTime();

    // split into hours
    const diffHoursIbuprofen = timeDiffIbuprofen / (1000 * 3600);
    // get remaining minutes
    // const diffMinutesIbuprofen = Math.floor((timeDiffIbuprofen % (1000 * 3600)) / (1000 * 60));

    // split into hours
    const diffHoursAcetaminophen = timeDiffAcetaminophen / (1000 * 3600);
    // get remaining minutes
    // const diffMinutesAcetaminophen = Math.floor((timeDiffAcetaminophen % (1000 * 3600)) / (1000 * 60));

    return `I ${diffHoursIbuprofen.toFixed(1)}  T ${diffHoursAcetaminophen.toFixed(1)}`;
}

// @ts-ignore
async function chatGptMessage() {
    const answer = await chatgpt.generateChat('Write a very short snarky compliment for Steph');
    return answer || "ChatGPT Error";
}

// @ts-ignore
async function lightLevelMessage() {
    let data = bh1750.readData();
    return ` Light: ${data.toFixed(1)}`;
}

// bottom scroller settings
const SCROLLER_SCROLL_SPEED = 0;
const SCROLLER_UPDATE_INTERVAL_SEC = 1;

// @ts-ignore
async function getScrollerMessage() {
    return lightLevelMessage();
}

process.on("SIGINT", function() {
    log.warn("SIGINT, exiting...");
    process.exit(0);
});

async function main() {
    await bt.login();
    try {
        log.verbose('Matrix dash starting...');

        matrix && matrix.brightness(20);

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
        scroller.setText(await getScrollerMessage());
        scroller.scrollSpeed = SCROLLER_SCROLL_SPEED;
        scroller.fgColor = 0xeb9b34; // orange
        page1.addWidget(scroller, { x: 0, y: 16 });

        setInterval(async () => {
            scroller.setText(await getScrollerMessage());
        }, 1000 * SCROLLER_UPDATE_INTERVAL_SEC);

        
        setInterval(async () => {
            let data = bh1750.readData();
            console.log('Light level:', data.toFixed(2));
        }, 1000 * 1);
        

    //    const canvas = new CanvasWidget({ width: 64, height: 18 }, 0);
    //    page1.addWidget(canvas, { x: 0, y: 14 });

        // const timer = new TimerWidget({ width: 64, height: 16 }, 0);
        // page1.addWidget(timer, { x: 0, y: 16 });
        // timer.start(60*36);

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
