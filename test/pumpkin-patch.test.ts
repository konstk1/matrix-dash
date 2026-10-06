jest.mock('../src/matrix', () => ({ matrix: {
  fgColor: jest.fn().mockReturnThis(),
  fill: jest.fn().mockReturnThis(),
  setPixel: jest.fn().mockReturnThis(),
  sync: jest.fn(),
} }))
jest.mock('../src/log', () => ({ __esModule: true, default: { warn: jest.fn(), info: jest.fn() } }))

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { matrix } from '../src/matrix'
import { pumpkinPatchFrame } from '../src/animations/pumpkin-patch/scene'
import { PumpkinPatchWidget } from '../src/animations/pumpkin-patch/widget'
import { CarouselWidget } from '../src/widgets/carousel-widget'
import { Widget } from '../src/widgets/widget'
import { emitWidgetEvent } from '../src/events'

beforeEach(() => { jest.useFakeTimers(); jest.clearAllMocks() })
afterEach(() => { jest.useRealTimers() })

test('runtime frames match the approved candlelight preview exactly', () => {
  const preview = runInNewContext(readFileSync(resolve(__dirname,
    '../previews/pumpkin-flames/scenes.js'), 'utf8') + '\nrenderScene') as
    (index: number, t: number) => Uint8ClampedArray
  for (const t of [0, .06, .4, 1.2, 10, 300]) {
    expect(Buffer.from(pumpkinPatchFrame(t))).toEqual(Buffer.from(preview(0, t)))
  }
})

test('flicker affects pumpkin illumination', () => {
  const first = pumpkinPatchFrame(0)
  const later = pumpkinPatchFrame(.4)
  const pumpkinSurface = (8 * 64 + 6) * 3
  expect(first[pumpkinSurface]).not.toBe(later[pumpkinSurface])
})

test('paints only the lower strip and stops during aircraft alerts', () => {
  const patch = new PumpkinPatchWidget()
  const aircraft = new class extends Widget {}({ width: 64, height: 16 })
  const carousel = new CarouselWidget({ width: 64, height: 16 })
  carousel.origin = { x: 0, y: 16 }
  carousel.addWidget(patch, { displayTimeSec: 0, defaultPriority: 10, activePriority: 10 })
  carousel.addWidget(aircraft, { displayTimeSec: 0, defaultPriority: 0, activePriority: 50 })
  carousel.activate()
  expect(carousel.activeWidget()).toBe(patch)
  jest.clearAllMocks()
  jest.advanceTimersByTime(60)
  expect(matrix.setPixel).toHaveBeenCalledTimes(1024)
  for (const [x, y] of (matrix.setPixel as jest.Mock).mock.calls) {
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThan(64)
    expect(y).toBeGreaterThanOrEqual(16)
    expect(y).toBeLessThan(32)
  }
  expect(matrix.sync).toHaveBeenCalledTimes(1)
  emitWidgetEvent('RequestActive', aircraft)
  expect(carousel.activeWidget()).toBe(aircraft)
  expect(jest.getTimerCount()).toBe(0)
  jest.clearAllMocks()
  jest.advanceTimersByTime(600)
  expect(matrix.setPixel).not.toHaveBeenCalled()
  emitWidgetEvent('EndActive', aircraft)
  expect(carousel.activeWidget()).toBe(patch)
  expect(jest.getTimerCount()).toBe(1)
  carousel.deactivate()
  expect(jest.getTimerCount()).toBe(0)
})
