import { BabyTracker } from '../src/services/babytracker';

it('logs in', async () => {
    const bt = new BabyTracker();
    await bt.login();

    await bt.getDevices();
});