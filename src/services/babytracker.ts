import axios, { AxiosInstance } from 'axios';
// import * as fs from 'fs';
import { log } from '../log';

type DeviceInfo = {
    DeviceUUID: string,
    LastSyncID: number,
    DeviceName: string,
    DeviceOSInfo: string,
}

type EventInfo = {
    syncID: number,
    opCode: number, // 0-create, 1-update, 2-delete
    type: string,
    time: Date,
}

export class BabyTracker {
    private readonly email = process.env.BABYTRACKER_EMAIL;
    private readonly password = process.env.BABYTRACKER_PASSWORD;
    private readonly baseUrl = 'https://prodapp.babytrackers.com';

    private readonly maxEventsLookback = 5;

    // private accountId?: number;

    private readonly axios: AxiosInstance;
    private cookies?: string[] = [];

    private localDeviceInfo: DeviceInfo[] = [];

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

        // this.accountId = res.data.AccountID;

        this.cookies = res.headers['set-cookie'];
        if (this.cookies) {
            this.axios.defaults.headers.common.cookie = this.cookies.join(';');
        } else {
            log.error('Baby tracker missing cookies');
            throw new Error("Baby tracker missing cookies");
        }

        return res.data;
    }

    async fetchSyncInfo(): Promise<DeviceInfo[]> {
        const res = await this.axios.get(`${this.baseUrl}/account/device`);

        if (res.status !== 200) {
            log.error('Baby tracker failed to get devices')
        }

        // console.log(res.data);

        return res.data;
    }

    async sync() {
        const remoteDeviceInfo = await this.fetchSyncInfo();

        for (const remoteDevice of remoteDeviceInfo) {
            const numToSync = this.calcSyncDiff(remoteDevice);
            if (numToSync > 0) {
                log.info(`Syncing ${numToSync} events for ${remoteDevice.DeviceUUID} (${remoteDevice.DeviceName})`);
                await this.syncDevice(remoteDevice, numToSync);
            }
        } 
    }

    async syncDevice(remoteDevice: DeviceInfo, numToSync: number) {
        const syncSinceId = remoteDevice.LastSyncID - numToSync;

        const url = `${this.baseUrl}/account/transaction/${remoteDevice.DeviceUUID}/${syncSinceId}`
        const res = await this.axios.get(url);
        if (res.status !== 200) {
            log.error('Baby tracker failed to sync device ${remoteDevice.DeviceUUID}');
            return;
        }

        const events = this.parseTransactions(res.data);
        console.log(events);
    }

    calcSyncDiff(remoteDevice: DeviceInfo): number {
        const localDevice = this.localDeviceInfo.find(d => d.DeviceUUID === remoteDevice.DeviceUUID);
        if (!localDevice) {
            return Math.min(this.maxEventsLookback, remoteDevice.LastSyncID);
        }

        const diff = Math.max(0, remoteDevice.LastSyncID - localDevice.LastSyncID);

        return Math.min(diff, this.maxEventsLookback);
    }

    async saveSyncInfo() {

    }

    parseTransactions(transactions: any[]): EventInfo[] {
        return transactions.map(t => {
            // base64 decode the data
            const obj = JSON.parse(Buffer.from(t.Transaction, 'base64').toString('utf8'));
            console.log('obj :>> ', obj);

            return {
                syncID: t.SyncID,
                opCode: t.OPCode,
                type: obj.BCObjectType,
                time: new Date(obj.time),
                baby: obj.baby.name,
            };
        });
    }
};
