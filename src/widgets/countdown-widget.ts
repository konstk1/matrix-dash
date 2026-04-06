import { Widget } from './widget'
import { Font } from '../matrix'
import { FontInstance } from 'rpi-led-matrix'

export class CountdownWidget extends Widget {
  public override fgColor = 0xFFFFFF;

  protected override updateIntervalMs = 1000;

  private label: string
  private targetDate: Date
  private font: FontInstance
  private flashVisible = true

  constructor(size: { width: number, height: number }, label: string, targetDate: Date) {
    super(size, 0)
    this.label = label
    this.targetDate = targetDate
    this.font = new Font('6x10', `${process.cwd()}/node_modules/rpi-led-matrix/vendor/fonts/6x10.bdf`)
  }

  public override draw(sync: boolean = true): void {
    super.draw(false)

    if (!this.matrix) { return }

    const now = new Date()
    const diffMs = this.targetDate.getTime() - now.getTime()
    const totalSec = Math.max(0, Math.floor(diffMs / 1000))
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    const parts = [pad(days), ':', pad(hours), ':', pad(minutes), ':', pad(seconds)]
    const colors = [0xFF0000, 0xFF8800, 0xFFFF00, 0xFF8800, 0x00FF00, 0xFFFF00, 0x44AAFF]

    const timerText = parts.join('')
    const timerWidth = this.font.stringWidth(timerText, -1)
    let x = this.origin.x + Math.floor((this.size.width - timerWidth) / 2)
    const y = this.origin.y + 18

    this.matrix
      .font(this.font)
      .fgColor(0xFF88AA)
      .drawText(this.label, this.origin.x, this.origin.y + 2, -1)

    if (totalSec === 0) {
      this.flashVisible = !this.flashVisible
    }

    if (totalSec > 0 || this.flashVisible) {
      for (let i = 0; i < parts.length; i++) {
        this.matrix.fgColor(colors[i]).drawText(parts[i], x, y, -1)
        x += this.font.stringWidth(parts[i], -1)
      }
    }

    if (sync) {
      this.matrix.sync()
    }
  }

  protected override update(): void {
    if (this.isActive) {
      this.draw(true)
    }
  }
}
