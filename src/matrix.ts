// import { LedMatrix, LedMatrixInstance, GpioMapping, MatrixOptions, MuxType, RowAddressType, ScanMode, RuntimeOptions, RuntimeFlag } from 'rpi-led-matrix';
// @ts-nocheck
import { LedMatrix, LedMatrixInstance, GpioMapping, Font } from "rpi-led-matrix";

// const defaultMatrixOptions: MatrixOptions = {
//     brightness: 100,
//     chainLength: 1,
//     cols: 64,
//     disableHardwarePulsing: false,
//     hardwareMapping: GpioMapping.AdafruitHat,
//     inverseColors: false,
//     ledRgbSequence: 'RGB',
//     multiplexing: MuxType.Direct,
//     parallel: 1,
//     pixelMapperConfig: '',
//     pwmBits: 11,
//     pwmDitherBits: 0,
//     pwmLsbNanoseconds: 130,
//     rowAddressType: RowAddressType.Direct,
//     rows: 32,
//     scanMode: ScanMode.Progressive,
//     showRefreshRate: false,
// };

// const defaultRuntimeOptions: RuntimeOptions = {
//     daemon: RuntimeFlag.Off,
//     doGpioInit: true,
//     dropPrivileges: RuntimeFlag.On,
//     gpioSlowdown: 2,
// }

let matrix: LedMatrixInstance;

if (process.env.NODE_ENV !== 'test') {
    // @ts-ignore
    matrix = new LedMatrix({
        // @ts-ignore
        ...LedMatrix.defaultMatrixOptions(),
        rows: 32,
        cols: 64,
        hardwareMapping: GpioMapping.AdafruitHat,
        showRefreshRate: true,
    }, {
        ...LedMatrix.defaultRuntimeOptions(),
        gpioSlowdown: 2,
    });
}

export { LedMatrixInstance, Font, matrix };