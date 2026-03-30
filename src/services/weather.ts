import axios from 'axios'

export type WeatherData = {
  timestamp: Date
  tempF: number
  humidity: number
  windSpeedMph: number
  uvIndex: number
}

export class Weather {
  private readonly apiKey = process.env.OPENWEATHER_ONECALL_API_KEY;
  private readonly apiUrl = 'https://api.openweathermap.org/data/3.0/onecall';

  private readonly coords = {
    lat: process.env.LOCATION_LAT,
    lon: process.env.LOCATION_LON,
  }

  private static readonly CACHE_TTL_MS = 5 * 60 * 1000;
  private cachedWeather: WeatherData | null = null;
  private lastFetchedAt: number = 0;

  public async getWeather(): Promise<WeatherData> {
    if (this.cachedWeather && (Date.now() - this.lastFetchedAt) < Weather.CACHE_TTL_MS) {
      return this.cachedWeather;
    }

    const url = `${this.apiUrl}?lat=${this.coords.lat}&lon=${this.coords.lon}&exclude=minutely,hourly,daily&appid=${this.apiKey}&units=imperial`

    const response = await axios.get(url)
    const current = response.data.current
    this.cachedWeather = {
      timestamp: new Date(current.dt * 1000),
      tempF: current.temp,
      humidity: current.humidity,
      windSpeedMph: current.wind_speed,
      uvIndex: current.uvi,
    }
    this.lastFetchedAt = Date.now();
    return this.cachedWeather;
  }
}
