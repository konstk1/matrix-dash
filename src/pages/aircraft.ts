import { Page } from './page'
import { ClockWidget } from '../widgets/clock-widget'
import { WeatherWidget } from '../widgets/weather-widget'
import { TextWidget } from '../widgets/text-widget'
import { CanvasWidget } from '../widgets/canvas-widget'
import { AircraftWidget } from '../widgets/aircraft-widget'
import { CarouselWidget } from '../widgets/carousel-widget'
import log from '../log'

export async function createAircraftPage(): Promise<Page> {
  const page = new Page('aircraft')
  page.addWidget(new ClockWidget({ width: 32, height: 16 }, 0), { x: 0, y: 0 })
  page.addWidget(new WeatherWidget({ width: 32, height: 16 }, 0), { x: 32, y: 0 })

  const aircraft = new AircraftWidget({ width: 64, height: 16 }, 0)
  const canvas = new CanvasWidget({ width: 64, height: 16 }, 0)
  const scroller = new TextWidget({ width: 64, height: 16 }, 0)
  scroller.setText('6 7')
  scroller.fgColor = 0x00FF00

  const carousel = new CarouselWidget({ width: 64, height: 16 })
  carousel.addWidget(canvas, { displayTimeSec: 0, defaultPriority: 10, activePriority: 10 })
  carousel.addWidget(aircraft, { displayTimeSec: 0, defaultPriority: 0, activePriority: 50 })
  carousel.addWidget(scroller, { displayTimeSec: 0, defaultPriority: 0, activePriority: 100 })
  page.addWidget(carousel, { x: 0, y: 16 })

  const scheduleScroller = () => {
    const delayMs = (5 + Math.random() * 1) * 60 * 1000
    log.verbose(`Next scroller in ${(delayMs / 60000).toFixed(1)} min`)
    setTimeout(() => {
      scroller.scroll(2)
      scheduleScroller()
    }, delayMs)
  }
  scheduleScroller()

  return page
}
