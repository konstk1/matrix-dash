import { EdgeMax } from '../src/services/edgemax';

const edgemax = new EdgeMax(process.env.EDGEMAX_HOST || '192.168.1.1');

it('Logs in', async () => {
    await edgemax.login();
    expect(edgemax.isLoggedIn()).toEqual(true);

    const result = await edgemax.getInfo();
    expect(result.success).toEqual(true);

    await edgemax.heartBeat();

    await edgemax.connectWebsocket();

    edgemax.onStats = (stats: any) => {
        console.log('tx bps: ', stats.txBps);
        console.log('rx bps: ', stats.rxBps);
    }
});
