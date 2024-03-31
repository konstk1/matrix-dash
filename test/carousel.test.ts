
import { CarouselWidget } from '../src/widgets/carousel-widget'
import { Widget } from '../src/widgets/widget'

class TestWidget extends Widget {
  public fireEvent() {

  }

  public endEvent() {
  }
}

jest.useFakeTimers()

describe('Carousel', () => {
  const widget1 = new TestWidget({ width: 10, height: 10 })
  const widget2 = new TestWidget({ width: 10, height: 10 })
  const widget3 = new TestWidget({ width: 10, height: 10 })

  test('switches widgets on timer', () => {
    const carousel = new CarouselWidget({ width: 10, height: 10 })
    expect(carousel.numWidgets()).toBe(0)

    carousel.addWidget(widget1, { displayTimeSec: 2, defaultPriority: 0, activePriority: 0 })
    carousel.addWidget(widget2, { displayTimeSec: 5, defaultPriority: 0, activePriority: 0 })

    expect(carousel.numWidgets()).toBe(2)

    carousel.activate()
    expect(carousel.activeWidget()).toBe(widget1)

    // expect widget 1 to only advance to widget 2 after 2 seconds
    jest.advanceTimersByTime(1500)
    expect(carousel.activeWidget()).toBe(widget1)
    jest.advanceTimersByTime(500)
    expect(carousel.activeWidget()).toBe(widget2)

    // expect widget 2 to only advance to widget 1 after 5 seconds
    jest.advanceTimersByTime(4000)
    expect(carousel.activeWidget()).toBe(widget2)
    jest.advanceTimersByTime(1000)
    expect(carousel.activeWidget()).toBe(widget1)
  })

  test('switches between highest priority widgets only', () => {
    const carousel = new CarouselWidget({ width: 10, height: 10 })

    carousel.addWidget(widget1, { displayTimeSec: 5, defaultPriority: 0, activePriority: 0 })
    carousel.addWidget(widget2, { displayTimeSec: 5, defaultPriority: 1, activePriority: 1 })
    carousel.addWidget(widget3, { displayTimeSec: 5, defaultPriority: 1, activePriority: 1 })

    expect(carousel.numWidgets()).toBe(3)

    carousel.activate()
    expect(carousel.activeWidget()).toBe(widget2)

    jest.runOnlyPendingTimers()
    expect(carousel.activeWidget()).toBe(widget3)

    jest.runOnlyPendingTimers()
    expect(carousel.activeWidget()).toBe(widget2)
  })

  test('switches to widget with event', () => {
    const carousel = new CarouselWidget({ width: 10, height: 10 })

    carousel.addWidget(widget1, { displayTimeSec: 0, defaultPriority: 0, activePriority: 0 })
    carousel.addWidget(widget2, { displayTimeSec: 0, defaultPriority: 0, activePriority: 5 })

    carousel.activate()
    expect(carousel.activeWidget()).toBe(widget1)

    // expect widget 1 to be displayed indefinitely
    jest.advanceTimersByTime(100000)
    expect(carousel.activeWidget()).toBe(widget1)

    widget2.fireEvent()
    expect(carousel.activeWidget()).toBe(widget2)

    // expect widget 2 to be displayed until event is done
    jest.advanceTimersByTime(100000)
    expect(carousel.activeWidget()).toBe(widget2)

    widget2.endEvent()
    expect(carousel.activeWidget()).toBe(widget1)
  })
})

