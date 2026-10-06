jest.mock('../src/matrix', () => ({
  matrix: {
    fgColor: jest.fn().mockReturnThis(),
    setPixel: jest.fn().mockReturnThis(),
    sync: jest.fn(),
  },
}))
jest.mock('../src/log', () => ({ __esModule: true, default: { warn: jest.fn() } }))

import { matrix } from '../src/matrix'
import { animationFrame, HALLOWEEN_ANIMATIONS, pickAnimation } from '../src/animations/halloween/animation'
import { FRAME_COUNT, FRAME_INTERVAL_MS } from '../src/animations/halloween/frames'
import { HalloweenPage } from '../src/animations/halloween/page'

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
})
afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

test('all selected scenes contain animated RGB frames and wrap correctly', () => {
  expect(HALLOWEEN_ANIMATIONS).toEqual(['porch-pals', 'moon-patrol', 'something-brewing'])
  for (const name of HALLOWEEN_ANIMATIONS) {
    const first = animationFrame(name, 0)
    expect(first.length).toBe(64 * 32 * 3)
    expect(first.some(value => value !== 0)).toBe(true)
    expect(animationFrame(name, 1500).equals(first)).toBe(false)
    expect(animationFrame(name, FRAME_COUNT * FRAME_INTERVAL_MS).equals(first)).toBe(true)
  }
})

test('random selection reaches all scenes and excludes the last scene', () => {
  const random = jest.spyOn(Math, 'random')
  HALLOWEEN_ANIMATIONS.forEach((name, i) => {
    random.mockReturnValue((i + .5) / HALLOWEEN_ANIMATIONS.length)
    expect(pickAnimation()).toBe(name)
    for (const value of [0, .99]) {
      random.mockReturnValue(value)
      expect(pickAnimation(name)).not.toBe(name)
    }
  })
})

test('page paints the full panel, animates only while active, and restarts on return', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0)
  const page = new HalloweenPage()
  page.activate()
  expect(page.title).toBe('halloween:porch-pals')
  expect(jest.getTimerCount()).toBe(1)
  jest.clearAllMocks()
  jest.advanceTimersByTime(100)
  expect(matrix.setPixel).toHaveBeenCalledTimes(2048)
  expect(matrix.setPixel).toHaveBeenCalledWith(0, 0)
  expect(matrix.setPixel).toHaveBeenCalledWith(63, 31)
  expect(matrix.sync).toHaveBeenCalledTimes(1)
  page.deactivate()
  expect(jest.getTimerCount()).toBe(0)
  jest.clearAllMocks()
  jest.advanceTimersByTime(1000)
  expect(matrix.setPixel).not.toHaveBeenCalled()
  page.activate()
  expect(page.title).toBe('halloween:moon-patrol')
  const first = animationFrame('moon-patrol', 0)
  expect(matrix.fgColor).toHaveBeenNthCalledWith(1, (first[0] << 16) | (first[1] << 8) | first[2])
  expect(jest.getTimerCount()).toBe(1)
  page.deactivate()
})
