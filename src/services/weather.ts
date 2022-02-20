import axios from 'axios';

export type WeatherData = {
    tempF: number;
    humidity: number;
}

export class Weather {
    private readonly apiKey = process.env.OPENWEATHER_ONECALL_API_KEY;
    private readonly apiUrl = 'https://api.openweathermap.org/data/2.5/onecall';

    private readonly coords = {
        lat: process.env.LOCATION_LAT, 
        lon: process.env.LOCATION_LON,
    }

    // constructor(apiKey: string) {
    //     this.apiKey = apiKey;
    //     this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    // }

    public async getWeather(): Promise<WeatherData> {
        const url = `${this.apiUrl}?lat=${this.coords.lat}&lon=${this.coords.lon}&exclude={part}&appid=${this.apiKey}&units=imperial`;

        try {
            const response = await axios.get(url);
            const current = response.data.current;
            return {
                tempF: current.temp,
                humidity: current.humidity
            };
        } catch (error) {
            console.log(`Error getting weather: ${error}`);
            return {
                tempF: 0,
                humidity: 0,
            };
        }
    }
};