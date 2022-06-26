
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
import { BabyTracker } from './src/services/babytracker';
// import { BufferWidget } from './src/widgets/buffer-widget';
// @ts-ignore
import { TimerWidget } from './src/widgets/timer-widget';

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

// @ts-ignore
async function getLastFeed() {
    await bt.sync();
    const now = new Date();
    const timeDiff = now.getTime() - bt.lastFeedingTime.getTime();

    // split into hours
    const diffHours = Math.floor(timeDiff / (1000 * 3600));
    // get remaining minutes
    const diffMinutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m  ${bt.lastStartSide}`;
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
        // scroller.setText(`Kai is ${babyBrotherAge()} days old!`);
        scroller.setText(` ${await getLastFeed()}`);
        // scroller.scrollSpeed = 1;
        // scroller.fgColor = 0x5555FF;
        scroller.fgColor = 0xeb9b34; // orange
        // scroller.fgColor = 0x00FF00; // green
        page1.addWidget(scroller, { x: 0, y: 16 });

        setInterval(async () => {
            scroller.setText(` ${await getLastFeed()}`);
        }, 1000 * 60 * 5);

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
