
import 'dotenv/config'
import { matrix } from './matrix'
import { Page } from './page'
// @ts-ignore
import { WeatherWidget } from './widgets/weather-widget'
// @ts-ignore
import { ClockWidget } from './widgets/clock-widget'
// @ts-ignore
import { RouterWidget } from './widgets/router-widget'
// @ts-ignore
import { TextWidget } from './widgets/text-widget'
import log from './log'
// @ts-ignore
import { BabyTracker } from './services/babytracker'
// import { BufferWidget } from './src/widgets/buffer-widget';
// @ts-ignore
import { TimerWidget } from './widgets/timer-widget'
// @ts-ignore
import { CanvasWidget } from './widgets/canvas-widget'
import { ChatGPT } from './services/chatgpt'
// @ts-ignore
import { AircraftWidget } from './widgets/aircraft-widget'
// @ts-ignore
import { CarouselWidget } from './widgets/carousel-widget'

const BH1750 = require('bh1750-sensor')

const options = {
  readMode: BH1750.ONETIME_H_RESOLUTION_MODE
}

const bh1750 = new BH1750(options)

const bt = new BabyTracker()
const chatgpt = new ChatGPT()

// @ts-ignore
async function getLastMeds(name: string) {
  try {
    await bt.sync()
  } catch (error) {
    let errorMessage = ""
    if (error instanceof Error) {
      errorMessage = error.message
    }
    log.error('BT sync error:', errorMessage)
    return 'BT error'
  }

  const meds = bt.getLastMeds(name)
  if (!meds) {
    return 'No meds'
  }

  const now = new Date()
  const timeDiffIbuprofen = now.getTime() - meds.ibuprofen.getTime()
  const timeDiffAcetaminophen = now.getTime() - meds.acetaminophen.getTime()

  // split into hours
  const diffHoursIbuprofen = timeDiffIbuprofen / (1000 * 3600)
  const diffHoursAcetaminophen = timeDiffAcetaminophen / (1000 * 3600)

  // convert to days if larger than 48 hours
  const ibuprofenStr = diffHoursIbuprofen <= 48 ?
    `${diffHoursIbuprofen.toFixed(1)}` :
    (diffHoursIbuprofen > 720) ? '∞' : `${(diffHoursIbuprofen / 24).toFixed(1)}d`

  const acetaminophenStr = diffHoursAcetaminophen <= 48 ?
    `${diffHoursAcetaminophen.toFixed(1)}` :
    (diffHoursAcetaminophen > 720) ? '∞' : `${(diffHoursAcetaminophen / 24).toFixed(1)}d`

  return `I ${ibuprofenStr}  T ${acetaminophenStr}`
}

// @ts-ignore
async function chatGptMessage() {
  const answer = await chatgpt.generateChat('Write a very short snarky compliment for Steph')
  return answer || "ChatGPT Error"
}

// @ts-ignore
async function lightLevelMessage() {
  let data = bh1750.readData()
  return ` L: ${data.toFixed(0)} B: ${matrix.brightness()}`
}

// bottom scroller settings
// @ts-ignore
const SCROLLER_SCROLL_SPEED = 0
// @ts-ignore
const SCROLLER_UPDATE_INTERVAL_SEC = 5 * 60

// @ts-ignore
async function getScrollerMessage(param: string) {
  return getLastMeds(param)
}

function autoDimmer(page: Page) {
  if (!matrix) {
    return
  }

  const currentBrightness = matrix.brightness()
  let newBrightness = currentBrightness

  let level = bh1750.readData()
  if (level < 5) {
    newBrightness = 20
  } else if (level < 10) {
    newBrightness = 35
  } else {
    newBrightness = 50
  }

  if (newBrightness !== currentBrightness) {
    matrix.brightness(newBrightness)
    page.draw()
  }

  // console.log('Light level:', level.toFixed(2));
}

process.on("SIGINT", function () {
  log.warn("SIGINT, exiting...")
  process.exit(0)
})

async function main() {
  await bt.login()
  try {
    log.verbose('Matrix dash starting...')

    matrix && matrix.brightness(20)

    const page1 = new Page('page1')

    const clock = new ClockWidget({ width: 32, height: 16 }, 0)
    page1.addWidget(clock, { x: 0, y: 0 })

    const weather = new WeatherWidget({ width: 32, height: 16 }, 0)
    page1.addWidget(weather, { x: 32, y: 0 })

    // const scrollerTop = new TextWidget({ width: 64, height: 16 }, 0)
    // scrollerTop.setText(await getScrollerMessage('Maya'))
    // scrollerTop.scrollSpeed = SCROLLER_SCROLL_SPEED
    // scrollerTop.fgColor = 0xfa0a92 // ping
    // page1.addWidget(scrollerTop, { x: 0, y: 0 })

    // const scrollerBottom = new TextWidget({ width: 64, height: 16 }, 0)
    // scrollerBottom.setText(await getScrollerMessage('Kai'))
    // scrollerBottom.scrollSpeed = SCROLLER_SCROLL_SPEED
    // scrollerBottom.fgColor = 0xeb9b34 // orange
    // page1.addWidget(scrollerBottom, { x: 0, y: 16 })

    // setInterval(async () => {
    //   // scrollerTop.setText(await getScrollerMessage('Maya'))
    //   scrollerBottom.setText(await getScrollerMessage('any'))
    // }, 1000 * SCROLLER_UPDATE_INTERVAL_SEC)

    // const aircraft = new AircraftWidget({ width: 64, height: 16 }, 0)
    // page1.addWidget(aircraft, { x: 0, y: 16 })

    const canvas = new CanvasWidget({ width: 64, height: 16 }, 0)
    const text = new TextWidget({ width: 64, height: 16 }, 0)
    text.setText('Carousel')

    // page1.addWidget(canvas, { x: 0, y: 16 })

    const carousel = new CarouselWidget({ width: 64, height: 16 })
    carousel.addWidget(canvas, { displayTimeSec: 5, defaultPriority: 0, activePriority: 0 })
    carousel.addWidget(text, { displayTimeSec: 5, defaultPriority: 0, activePriority: 0 })
    page1.addWidget(carousel, { x: 0, y: 16 })

    page1.activate()

    setInterval(autoDimmer, 1000 * 1, page1)
  } catch (error) {
    console.error(error)
  }
};

main()
