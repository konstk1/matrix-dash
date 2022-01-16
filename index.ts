
import { matrix } from './src/matrix';
import { Font } from 'rpi-led-matrix';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

enum Colors {
  black = 0x000000,
  red = 0xFF0000,
  green = 0x00FF00,
  blue = 0x0000FF,
  magenta = 0xFF00FF,
  cyan = 0x00FFFF,
  yellow = 0xFFFF00,
};

(async () => {
  try {
    console.log('Writing screen...');

    const font = new Font('helvR12', `${process.cwd()}/node_modules/rpi-led-matrix/fonts/helvR12.bdf`);
    matrix.font(font);

    matrix
      .clear()
      .brightness(30)
      .fgColor(0x0000FF)
      // .fill()
      .fgColor(0xFFFF00)
      .drawCircle(matrix.width() / 2, matrix.height() / 2, matrix.height() / 2 - 1)
      .fgColor(Colors.red)
      .drawText("LED", matrix.width() / 2 - 11, matrix.height() / 2 - 7)
      .sync();
    // const interval = 5000;
    // matrix.fgColor(Colors.red).fill().sync();
    // await sleep(interval);
    // matrix.fgColor(Colors.blue).fill().sync();
    // await sleep(interval);
    // matrix.fgColor(Colors.green).fill().sync();
    // await sleep(interval);
    // matrix.clear();
    // await sleep(interval);
    
    console.log('Done');
    sleep(30000);
  } catch (error) {
    console.error(error);
  }
})();
