import { Page } from './page'
import { ClockWidget } from '../widgets/clock-widget'
import { WeatherWidget } from '../widgets/weather-widget'
import { CanvasWidget } from '../widgets/canvas-widget'
import { AircraftWidget } from '../widgets/aircraft-widget'
import { CarouselWidget } from '../widgets/carousel-widget'

export async function createAircraftPage(): Promise<Page> {
  const page = new Page('aircraft')
  page.addWidget(new ClockWidget({ width: 32, height: 16 }, 0), { x: 0, y: 0 })
  page.addWidget(new WeatherWidget({ width: 32, height: 16 }, 0), { x: 32, y: 0 })

  const aircraft = new AircraftWidget({ width: 64, height: 16 }, 0)
  const canvas = new CanvasWidget({ width: 64, height: 16 }, 0)

  const carousel = new CarouselWidget({ width: 64, height: 16 })
  carousel.addWidget(canvas, { displayTimeSec: 0, defaultPriority: 10, activePriority: 10 })
  carousel.addWidget(aircraft, { displayTimeSec: 0, defaultPriority: 0, activePriority: 50 })
  page.addWidget(carousel, { x: 0, y: 16 })

  return page
}
