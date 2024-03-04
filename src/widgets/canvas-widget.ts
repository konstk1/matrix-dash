import { Widget, Size } from './widget'
// @ts-ignore
import log from '../log'

type Rgb = { r: number, g: number, b: number }
type Pixel = {
  x: number,
  y: number,
  color: Rgb,
  initialColor: Rgb,
  startTime: Date,
  durationMs: number,
}

export class CanvasWidget extends Widget {

  private canvas: Rgb[][] = [];
  private pixels: Pixel[] = [];

  protected override updateIntervalMs: number = 60;

  private startTime: Date = new Date();

  constructor(size: Size, border: number = 0) {
    super(size, border)

    this.canvas = [...Array(size.width)].map(e => Array(size.height))
  }

  public override draw(sync: boolean = true): void {
  // draw background and border
    super.draw(false)

    if (!this.matrix) { return }

    // this.canvas.forEach((row, x) => {
    //     row.forEach((rgb, y) => {
    //         this.matrix.fgColor(rgb.r << 16 | rgb.g << 8 | rgb.b).setPixel(this.origin.x + x, this.origin.y + y);
    //     })
    // });

    this.pixels.forEach((p, i) => {
      this.matrix.fgColor(p.color.r << 16 | p.color.g << 8 | p.color.b).setPixel(this.origin.x + p.x, this.origin.y + p.y)
    })

    if (sync) {
      this.matrix.sync()
    }

    // log.debug(`  ${this.constructor.name} Drawing done`);
  }

  private randomPixel(): Pixel {
  // limit random colors to only those with at least one 255 (eg: red, green, blue, purple)
    const colorIdx = Math.floor(Math.random() * 3)

    const color = {
      r: colorIdx === 0 ? 255 : Math.random() * 255,
      g: colorIdx === 1 ? 255 : Math.random() * 255,
      b: colorIdx === 2 ? 255 : Math.random() * 255,
    }

    return {
      x: Math.floor(Math.random() * this.size.width),
      y: Math.floor(Math.random() * this.size.height),
      color: color,
      initialColor: color,
      startTime: new Date(),
      durationMs: 1000 + Math.floor(Math.random() * 2000),
    }
  }

  private updatePixel(pixel: Pixel): Pixel | undefined {
    const now = new Date()
    const elapsedMs = now.getTime() - pixel.startTime.getTime()

    if (elapsedMs < pixel.durationMs) {
      pixel.color = {
        r: pixel.initialColor.r * (1 - elapsedMs / pixel.durationMs),
        g: pixel.initialColor.g * (1 - elapsedMs / pixel.durationMs),
        b: pixel.initialColor.b * (1 - elapsedMs / pixel.durationMs),
      }
      return pixel
    } else {
      return undefined
    }
  }

  protected override update(): void {
  // @ts-ignore
    const tMs = new Date().getTime() - this.startTime.getTime()

    // log.debug(`CanvasWidget.update() tMs ${tMs} ms`);
    if (Math.random() < .99 && this.pixels.length < 70) {
      const pixel = this.randomPixel()
      // log.info(`Inserting new pixel (dur ${durationMs}), length: ${this.pixels.length}`);
      this.pixels.push(pixel)
    }
    // const phase = -tMs * Math.PI / 1000;

    for (let i = this.pixels.length - 1; i >= 0; i--) {
      const updatedPixel = this.updatePixel(this.pixels[i])
      if (updatedPixel) {
        this.canvas[updatedPixel.x][updatedPixel.y] = updatedPixel.color
      } else {
        this.pixels.splice(i, 1)
      }
    };

    // for (let x = 0; x < this.size.width; x++) {
    //     for (let y = 0; y < this.size.height; y++) {
    //         if (Math.random() > ((y+1)/this.size.height/2)) {
    //             this.canvas[x][y] = { r: 0, g: 0, b: 0 };
    //         } else {
    //             this.canvas[x][y] = {
    //                 r: Math.random() * 255,
    //                 g: Math.random() * 255,
    //                 b: Math.random() * 255,
    //             };
    //         }
    //     }
    //     // const yy = this.size.height - 4 + Math.round(3 * Math.sin((x / Math.PI) + phase));
    //     // this.canvas[x][yy] = { r: 255, g: 0, b: 0 };
    // }

    this.draw(true)
  }

  public override activate(): void {
    this.startTime = new Date()
    super.activate()
  }

  public override deactivate(): void {
    super.deactivate()
  }

}