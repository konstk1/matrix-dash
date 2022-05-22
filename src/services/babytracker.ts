import axios, { AxiosInstance } from 'axios';
import { log } from '../log';

type DeviceInfo = {
    DeviceUUID: string,
    LastSyncID: number,
    DeviceName: string,
    DeviceOSInfo: string,
}

export class BabyTracker {
    private readonly email = process.env.BABYTRACKER_EMAIL;
    private readonly password = process.env.BABYTRACKER_PASSWORD;
    private readonly baseUrl = 'https://prodapp.babytrackers.com';

    private accountId?: number;

    private readonly axios: AxiosInstance;
    private cookies?: string[] = [];

    constructor() {
        if (!this.email || !this.password) {
            throw new Error('BABYTRACKER_EMAIL and BABYTRACKER_PASSWORD must be set');
        }

        this.axios = axios.create({
            withCredentials: true,
        });
    }

    async login() {
        const body = { 
            Device: { 
                DeviceOSInfo: "iPad11,1", 
                DeviceName: "RasPi's iPad Mini", 
                DeviceUUID: "9B56B547-557B-4636-9A1E-5C820A576BAE" 
            }, 
            AppInfo: { 
                AppType: 0, 
                AccountType: 0 
            }, 
            EmailAddress: this.email, 
            Password: this.password, 
        };

        const res = await this.axios.post(`${this.baseUrl}/session`, body);

        if (res.status !== 200) {
            log.error('Baby tracker login failed');
            throw new Error('Baby tracker login failed');
        }

        this.accountId = res.data.AccountID;
        console.log(res.data);
        console.log(this.accountId);

        this.cookies = res.headers['set-cookie'];
        if (this.cookies) {
            this.axios.defaults.headers.common.cookie = this.cookies.join(';');
        } else {

        }
        console.log(res.headers['set-cookie']);

        return res.data;
    }

    async getDevices(): Promise<DeviceInfo[]> {
        const res = await this.axios.get(`${this.baseUrl}/account/device`);

        if (res.status !== 200) {
            log.error('Baby tracker failed to get devices')
        }

        return res.data;
    }
};
