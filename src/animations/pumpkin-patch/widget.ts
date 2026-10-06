import { Widget } from '../../widgets/widget'
import { pumpkinPatchFrame, WIDTH, HEIGHT } from './scene'

export class PumpkinPatchWidget extends Widget {
  protected override updateIntervalMs = 60
  private startedAt = Date.now()

  constructor() {
    super({ width: WIDTH, height: HEIGHT })
  }

  public override activate(): void {
    this.startedAt = Date.now()
    super.activate()
  }

  public override draw(sync: boolean = true): void {
    if (!this.matrix) { return }
    const pixels = pumpkinPatchFrame((Date.now() - this.startedAt) / 1000)
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const i = (y * WIDTH + x) * 3
        const color = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]
        this.matrix.fgColor(color).setPixel(this.origin.x + x, this.origin.y + y)
      }
    }
    if (sync) { this.matrix.sync() }
  }
}
