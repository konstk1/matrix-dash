
import { CarouselWidget } from '../src/widgets/carousel-widget'
import { Widget } from '../src/widgets/widget'

class TestWidget extends Widget {
}

jest.useFakeTimers()

describe('Carousel', () => {
  const widget1 = new TestWidget({ width: 10, height: 10 })
  const widget2 = new TestWidget({ width: 10, height: 10 })

  test('switches widgets on timer', () => {
    const carousel = new CarouselWidget({ width: 10, height: 10 })
    expect(carousel.numWidgets()).toBe(0)

    carousel.addWidget(widget1, { displayTimeSec: 5, defaultPriority: 0, activePriority: 0 })
    carousel.addWidget(widget2, { displayTimeSec: 5, defaultPriority: 0, activePriority: 0 })

    expect(carousel.numWidgets()).toBe(2)

    carousel.activate()
    expect(carousel.activeWidget()).toBe(widget1)

    jest.runOnlyPendingTimers()
    expect(carousel.activeWidget()).toBe(widget2)

    jest.runOnlyPendingTimers()
    expect(carousel.activeWidget()).toBe(widget1)
  })
})

