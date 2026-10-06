export const WIDTH = 64
export const HEIGHT = 16

const PUMPKIN = [
  '.....s.....', '....ss.....', '...ooooo...', '.odooooood.',
  'odooooooood', 'odooooooood', 'odoeeoeeodo', 'odooooooood',
  '.odoeoeodo.', '..ooeeeoo..', '...ooooo...',
]
const COLORS: Record<string, number> = { s: 0x617b32, o: 0xdf7825, d: 0x974312, e: 0xffd88b }

// Shared intensity drives both the flame and the light falling on the pumpkins.
function flameLight(t: number, index: number): number {
  const phase = index * 2.71
  const wave = .5 + .22 * Math.sin(t * 8.3 + phase)
    + .17 * Math.sin(t * 14.7 + phase * 2)
    + .11 * Math.sin(t * 23.1 + phase * .7)
  return .53 + .43 * wave
}

/** Render the approved Gentle candlelight preview at elapsed time in seconds. */
export function pumpkinPatchFrame(t: number): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 3)
  const flames = [17, 39, 61].map((x, i) => ({ x, light: flameLight(t, i) }))

  function dot(x: number, y: number, color: number, gain: number = 1): void {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) { return }
    const i = (y * WIDTH + x) * 3
    pixels[i] = ((color >> 16) & 255) * gain
    pixels[i + 1] = ((color >> 8) & 255) * gain
    pixels[i + 2] = (color & 255) * gain
  }

  function illumination(x: number): number {
    return Math.min(1, flames.reduce((sum, flame) =>
      sum + flame.light * Math.exp(-Math.abs(x - flame.x) / 10), 0))
  }

  for (let x = 0; x < WIDTH; x++) {
    dot(x, 15, 0xb76d29, .07 + .43 * illumination(x))
  }
  for (const origin of [1, 23, 45]) {
    PUMPKIN.forEach((row, dy) => [...row].forEach((symbol, dx) => {
      const color = COLORS[symbol]
      if (color === undefined) { return }
      const light = illumination(origin + dx)
      const gain = symbol === 'e' ? .30 + .58 * light
        : symbol === 's' ? .36 + .35 * light : .23 + .72 * light
      dot(origin + dx, 4 + dy, color, gain)
    }))
  }
  flames.forEach((flame, i) => {
    for (let y = 11; y <= 14; y++) {
      dot(flame.x - 1, y, 0xb29b76, .55)
      dot(flame.x, y, 0xe2cda1, .65)
      dot(flame.x + 1, y, 0xb29b76, .55)
    }
    dot(flame.x, 10, 0x553423)
    const height = 3 + Math.round(flame.light * 2)
    const lean = Math.round(Math.sin(t * 5 + i * 2) * .8)
    for (let dy = 0; dy < height; dy++) {
      const y = 9 - dy
      const center = flame.x + (dy > height - 3 ? lean : 0)
      dot(center, y, dy < 2 ? 0xffe6a1 : 0xffb838, .65 + .35 * flame.light)
      if (dy < height - 2) {
        dot(center - 1, y, 0xf17b21, flame.light * .8)
        dot(center + 1, y, 0xf17b21, flame.light * .8)
      }
    }
  })
  return pixels
}
