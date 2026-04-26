import { Widget, Size } from './widget'
import { Font } from '../matrix'
import { FontInstance } from 'rpi-led-matrix'

type Rgb = { r: number, g: number, b: number }

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  color: Rgb
  birthTime: number
  lifeMs: number
}

type Firework = {
  // launch phase
  rocketX: number
  rocketY: number
  rocketVy: number
  targetY: number
  // explosion phase
  sparks: Spark[]
  exploded: boolean
  explodeTime: number
}

const GRAVITY = 0.03
const FRAME_MS = 40

export class FireworksWidget extends Widget {
  protected override updateIntervalMs = FRAME_MS

  private fireworks: Firework[] = []
  private now = 0

  private overlayLines: string[] = []
  private overlayColor: number = 0xFFFFFF
  private font: FontInstance
  private fontKerning = -1

  constructor(size: Size, border: number = 0) {
    super(size, border)
    const fontName = '6x10'
    this.font = new Font(fontName, `${process.cwd()}/node_modules/rpi-led-matrix/vendor/fonts/${fontName}.bdf`)
  }

  public setOverlayText(lines: string[], color: number = 0xFFFFFF): void {
    this.overlayLines = lines
    this.overlayColor = color
  }

  public override activate(): void {
    this.fireworks = []
    this.now = Date.now()
    super.activate()
  }

  private spawnFirework(): void {
    const x = 4 + Math.random() * (this.size.width - 8)
    const targetY = 2 + Math.random() * (this.size.height * 0.4)

    this.fireworks.push({
      rocketX: x,
      rocketY: this.size.height - 1,
      rocketVy: -(0.6 + Math.random() * 0.4),
      targetY,
      sparks: [],
      exploded: false,
      explodeTime: 0,
    })
  }

  private explode(fw: Firework): void {
    fw.exploded = true
    fw.explodeTime = this.now

    // pick 1-2 bright base colors for this burst
    const hue = Math.random() * 360
    const numSparks = 12 + Math.floor(Math.random() * 12)

    for (let i = 0; i < numSparks; i++) {
      const angle = (Math.PI * 2 * i) / numSparks + (Math.random() - 0.5) * 0.3
      const speed = 0.3 + Math.random() * 0.7
      const sparkHue = hue + (Math.random() - 0.5) * 40

      this.fireworks[this.fireworks.indexOf(fw)].sparks.push({
        x: fw.rocketX,
        y: fw.rocketY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: hslToRgb(sparkHue, 1, 0.5),
        birthTime: this.now,
        lifeMs: 600 + Math.random() * 800,
      })
    }
  }

  protected override update(): void {
    this.now = Date.now()

    // randomly spawn new fireworks
    if (this.fireworks.length < 4 && Math.random() < 0.08) {
      this.spawnFirework()
    }

    // update each firework
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i]

      if (!fw.exploded) {
        fw.rocketY += fw.rocketVy
        if (fw.rocketY <= fw.targetY) {
          this.explode(fw)
        }
      } else {
        // update sparks
        for (const s of fw.sparks) {
          s.x += s.vx
          s.y += s.vy
          s.vy += GRAVITY // gravity pulls down
          s.vx *= 0.98    // air resistance
        }

        // remove firework when all sparks are dead
        const allDead = fw.sparks.every(s => this.now - s.birthTime > s.lifeMs)
        if (allDead) {
          this.fireworks.splice(i, 1)
        }
      }
    }

    if (this.isActive) {
      this.draw(true)
    }
  }

  public override draw(sync: boolean = true): void {
    super.draw(false)
    if (!this.matrix) return

    if (this.overlayLines.length > 0) {
      const lineHeight = 10
      const totalHeight = this.overlayLines.length * lineHeight
      const startY = this.origin.y + Math.floor((this.size.height - totalHeight) / 2)
      this.matrix
        .font(this.font)
        .fgColor(this.overlayColor)
      for (let i = 0; i < this.overlayLines.length; i++) {
        const textWidth = this.font.stringWidth(this.overlayLines[i], this.fontKerning)
        const x = this.origin.x + Math.floor((this.size.width - textWidth) / 2)
        this.matrix.drawText(this.overlayLines[i], x, startY + i * lineHeight, this.fontKerning)
      }
    }

    for (const fw of this.fireworks) {
      if (!fw.exploded) {
        // draw rocket trail
        const rx = Math.round(fw.rocketX)
        const ry = Math.round(fw.rocketY)
        if (inBounds(rx, ry, this.size.width, this.size.height)) {
          this.matrix
            .fgColor(0xFFFFFF)
            .setPixel(this.origin.x + rx, this.origin.y + ry)
        }
        // faint trail
        const ty = ry + 1
        if (inBounds(rx, ty, this.size.width, this.size.height)) {
          this.matrix
            .fgColor(0x666666)
            .setPixel(this.origin.x + rx, this.origin.y + ty)
        }
      } else {
        // draw sparks with fade
        for (const s of fw.sparks) {
          const age = (this.now - s.birthTime) / s.lifeMs
          if (age >= 1) continue

          const fade = 1 - age
          const px = Math.round(s.x)
          const py = Math.round(s.y)

          if (inBounds(px, py, this.size.width, this.size.height)) {
            const r = Math.floor(s.color.r * fade)
            const g = Math.floor(s.color.g * fade)
            const b = Math.floor(s.color.b * fade)
            this.matrix
              .fgColor((r << 16) | (g << 8) | b)
              .setPixel(this.origin.x + px, this.origin.y + py)
          }
        }
      }
    }

    if (sync) {
      this.matrix.sync()
    }
  }
}

function inBounds(x: number, y: number, w: number, h: number): boolean {
  return x >= 0 && x < w && y >= 0 && y < h
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}
