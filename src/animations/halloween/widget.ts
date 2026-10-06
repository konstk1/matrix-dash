import { Widget } from '../../widgets/widget'
import { animationFrame, FRAME_INTERVAL_MS, WIDTH, HEIGHT, HalloweenAnimation } from './animation'

export class HalloweenWidget extends Widget {
  protected override updateIntervalMs = FRAME_INTERVAL_MS
  private startedAt = 0

  constructor(public animation: HalloweenAnimation = 'porch-pals') {
    super({ width: WIDTH, height: HEIGHT })
  }

  public restart(animation: HalloweenAnimation): void {
    this.animation = animation
    this.startedAt = Date.now()
  }

  public override draw(sync: boolean = true): void {
    if (!this.matrix) { return }
    const pixels = animationFrame(this.animation, Date.now() - this.startedAt)
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
