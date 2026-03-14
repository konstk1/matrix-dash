import { Page } from '../widgets/page'
import { ClockWidget } from '../widgets/clock-widget'
import { WeatherWidget } from '../widgets/weather-widget'
import { TextWidget } from '../widgets/text-widget'
import { BabyTracker } from '../services/babytracker'
import log from '../log'

const SCROLLER_SCROLL_SPEED = 0
const SCROLLER_UPDATE_INTERVAL_SEC = 5 * 60

// @ts-ignore
async function getLastMeds(bt: BabyTracker, name: string) {
  try {
    await bt.sync()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ''
    log.error('BT sync error:', errorMessage)
    return 'BT error'
  }
  const meds = bt.getLastMeds(name)
  if (!meds) return 'No meds'
  const now = new Date()
  const timeDiffIbuprofen = now.getTime() - meds.ibuprofen.getTime()
  const timeDiffAcetaminophen = now.getTime() - meds.acetaminophen.getTime()
  const diffHoursIbuprofen = timeDiffIbuprofen / (1000 * 3600)
  const diffHoursAcetaminophen = timeDiffAcetaminophen / (1000 * 3600)
  const ibuprofenStr = diffHoursIbuprofen <= 48
    ? `${diffHoursIbuprofen.toFixed(1)}`
    : (diffHoursIbuprofen > 720) ? '∞' : `${(diffHoursIbuprofen / 24).toFixed(1)}d`
  const acetaminophenStr = diffHoursAcetaminophen <= 48
    ? `${diffHoursAcetaminophen.toFixed(1)}`
    : (diffHoursAcetaminophen > 720) ? '∞' : `${(diffHoursAcetaminophen / 24).toFixed(1)}d`
  return `I ${ibuprofenStr}  T ${acetaminophenStr}`
}

// @ts-ignore
async function getScrollerMessage(bt: BabyTracker, param: string) {
  return getLastMeds(bt, param)
}

export async function createMedsPage(bt: BabyTracker): Promise<Page> {
  const page = new Page('meds')
  page.addWidget(new ClockWidget({ width: 32, height: 16 }, 0), { x: 0, y: 0 })
  page.addWidget(new WeatherWidget({ width: 32, height: 16 }, 0), { x: 32, y: 0 })

  const scrollerBottom = new TextWidget({ width: 64, height: 16 }, 0)
  scrollerBottom.setText(await getScrollerMessage(bt, 'any'))
  scrollerBottom.scrollSpeed = SCROLLER_SCROLL_SPEED
  scrollerBottom.fgColor = 0xeb9b34
  page.addWidget(scrollerBottom, { x: 0, y: 16 })

  setInterval(
    () => getScrollerMessage(bt, 'any').then(t => scrollerBottom.setText(t)),
    1000 * SCROLLER_UPDATE_INTERVAL_SEC
  )

  return page
}
