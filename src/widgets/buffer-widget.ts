import { Widget } from "./widget";

class Pulser {
    constructor(
      readonly x: number,
      readonly y: number,
      readonly f: number
    ) { }
  
    nextColor(t: number): number {
      /** You could easily work position-dependent logic into this expression */
      const brightness = 0xFF & Math.max(0, (255 * (Math.sin(this.f * t / 1000))));
  
      return (brightness << 16) | (brightness << 8) | brightness;
    }
  }

export class BufferWidget extends Widget {
    override draw(sync: boolean = true): void {
        if (!this.matrix) {
            return;
        }

        this.matrix.clear().brightness(40);

        // const baseBuffer = [...Array(this.size.width * this.size.height * 3).keys()];
        // const baseBuffer = [...Array(this.matrix.width() * this.matrix.height() * 3).keys()];
        // const buffer1 = Buffer.of(...baseBuffer.map(() => Math.random() < 0.1 ? 0xFF : 0x00));
        // const buffer2 = Buffer.of(...baseBuffer.map(() => Math.random() < 0.1 ? 0xFF : 0x00));

        // let useBuffer1 = true;
        // this.matrix.afterSync(() => {
        //     useBuffer1 = !useBuffer1;
        //     this.matrix.drawBuffer(useBuffer1 ? buffer1 : buffer2);
        //     setTimeout(() => this.matrix.sync(), 200);
        // });

        const pulsers: Pulser[] = [];

        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                pulsers.push(new Pulser(x, y, 5 * Math.random()));
            }
        }

        this.matrix.afterSync((mat, dt, t) => {
            pulsers.map(pulser => {
                this.matrix.fgColor(pulser.nextColor(t)).setPixel(this.origin.x+pulser.x, this.origin.y+pulser.y);
            });
            setTimeout(() => this.matrix.sync(), 0);
        });

        // if (sync) {
        //     this.matrix.sync();
        // }
    }
}