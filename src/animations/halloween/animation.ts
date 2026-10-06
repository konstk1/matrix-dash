import { inflateSync } from 'node:zlib'
import { COMPRESSED_FRAMES, FRAME_COUNT, FRAME_INTERVAL_MS, WIDTH, HEIGHT } from './frames'

export { FRAME_INTERVAL_MS, WIDTH, HEIGHT }
export type HalloweenAnimation = keyof typeof COMPRESSED_FRAMES
export const HALLOWEEN_ANIMATIONS = Object.keys(COMPRESSED_FRAMES) as HalloweenAnimation[]
const FRAME_BYTES = WIDTH * HEIGHT * 3
const frames = new Map<HalloweenAnimation, Buffer>()

export function pickAnimation(previous?: HalloweenAnimation): HalloweenAnimation {
  const choices = HALLOWEEN_ANIMATIONS.filter(name => name !== previous)
  return choices[Math.floor(Math.random() * choices.length)]
}

export function animationFrame(name: HalloweenAnimation, elapsedMs: number): Buffer {
  let data = frames.get(name)
  if (!data) {
    data = inflateSync(Buffer.from(COMPRESSED_FRAMES[name], 'base64'))
    if (data.length !== FRAME_COUNT * FRAME_BYTES) {
      throw new Error(`Invalid frame data for ${name}`)
    }
    frames.set(name, data)
  }
  const index = Math.floor(Math.max(0, elapsedMs) / FRAME_INTERVAL_MS) % FRAME_COUNT
  return data.subarray(index * FRAME_BYTES, (index + 1) * FRAME_BYTES)
}
