import { BabyTracker } from '../src/services/babytracker'

describe('BabyTracker', () => {
  const bt = new BabyTracker()

  beforeAll(async () => {
    await bt.login()
  })

  // it('Fetches sync info', async () => {
  //     const devInfo = await bt.sync();
  //     const firstDevice = devInfo[0];

  //     expect(firstDevice.DeviceUUID).toBeDefined();
  //     expect(firstDevice.LastSyncID).toBeDefined();
  //     expect(firstDevice.DeviceName).toBeDefined();
  //     expect(firstDevice.DeviceOSInfo).toBeDefined();
  // });

  it.skip('Syncs', async () => {
    await bt.sync()
  })
})
