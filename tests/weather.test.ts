import { Weather } from '../src/services/weather';

it('fetches weather', async () => {
    const weather = new Weather();

    const current = await weather.getWeather();

    expect(current.tempF).toBeGreaterThan(-20);
    expect(current.tempF).toBeLessThan(110);
    expect(current.humidity).toBeGreaterThan(0);
    expect(current.humidity).toBeLessThanOrEqual(100);
});