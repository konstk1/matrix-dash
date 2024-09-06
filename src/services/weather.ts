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

  // constructor(apiKey: string) {
  //     this.apiKey = apiKey;
  //     this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  // }

  public async getWeather(): Promise<WeatherData> {
    const url = `${this.apiUrl}?lat=${this.coords.lat}&lon=${this.coords.lon}&exclude=minutely,hourly,daily&appid=${this.apiKey}&units=imperial`

    const response = await axios.get(url)
    const current = response.data.current
    return {
      timestamp: new Date(current.dt * 1000),
      tempF: current.temp,
      humidity: current.humidity,
      windSpeedMph: current.wind_speed,
      uvIndex: current.uvi,
    }
  }
}