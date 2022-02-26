import { EdgeMax } from '../src/services/edgemax';

const edgemax = new EdgeMax(process.env.EDGEMAX_HOST || '192.168.1.1');

it('Fetches get.json', async () => {
    await edgemax.login();
    await edgemax.getInfo();
});