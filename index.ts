import { LedMatrix, GpioMapping } from 'rpi-led-matrix';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

enum Colors {
  black = 0x000000,
  red = 0xFF0000,
  green = 0x00FF00,
  blue = 0x0000FF,
  magenta = 0xFF00FF,
  cyan = 0x00FFFF,
  yellow = 0xFFFF00,
}

(async () => {
  try {
    const matrix = new LedMatrix({
      ...LedMatrix.defaultMatrixOptions(),
      rows: 32,
      cols: 64,
      hardwareMapping: GpioMapping.AdafruitHat,
      // pixelMapper: PixelMapperType.Simple,
    }, {
      ...LedMatrix.defaultRuntimeOptions(),
      gpioSlowdown: 4,
    });

    console.log('Writing screen...');

    matrix
    //   .clear()
      .brightness(30);
    //   .fgColor(0x0000FF)
    //   .fill()
    //   .fgColor(0xFFFFF0)
    //   .drawCircle(matrix.width() / 2, matrix.height() / 2, matrix.height() / 2 - 1);
    const interval = 5000;
    matrix.fgColor(Colors.red).fill().sync();
    await sleep(interval);
    matrix.fgColor(Colors.blue).fill().sync();
    await sleep(interval);
    matrix.fgColor(Colors.green).fill().sync();
    await sleep(interval);
    matrix.clear();
    await sleep(interval);
    
    // console.log('Done');
    sleep(30000);
    matrix.clear();
  } catch (error) {
    console.error(error);
  }
})();
