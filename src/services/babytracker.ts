import axios, { AxiosInstance } from 'axios';
// import * as fs from 'fs';
import { log } from '../log';

type UUID = string;

type DeviceInfo = {
    DeviceUUID: UUID,
    LastSyncID: number,
    DeviceName: string,
    DeviceOSInfo: string,
}

type EventInfo = {
    syncID: number,
    opCode: number, // 0-create, 1-update, 2-delete
    type: string,
    startSide: string, // E-expressed, R-right, L-left
    medication: string,
    time: Date,
    baby: string,
}

export class BabyTracker {
    private readonly email = process.env.BABYTRACKER_EMAIL;
    private readonly password = process.env.BABYTRACKER_PASSWORD;
    private readonly baseUrl = 'https://prodapp.babytrackers.com';

    private readonly maxEventsLookback = 5;

    // private accountId?: number;

    private readonly axios: AxiosInstance;
    private cookies?: string[] = [];

    private localDeviceInfo: {[key: UUID]: DeviceInfo} = {};

    private newEvents: EventInfo[] = [];
    lastFeedingTime: Date = new Date(0);
    lastStartSide = '';

    lastIbuprofenTime: Date = new Date(0);
    lastAcetaminophenTime: Date = new Date(0);

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

    async sync() {
        const res = await this.axios.get(`${this.baseUrl}/account/device`);

        if (res.status !== 200) {
            log.error('Baby tracker failed to get devices')
        }


        const remoteDeviceInfo = res.data;

        for (const remoteDevice of remoteDeviceInfo) {
            // if (!remoteDevice.DeviceUUID.includes('9E33F0E7')) continue;
            // if (remoteDevice.DeviceUUID != 'C73C5794-1189-419E-9B24-37056AE4D29D') continue;

            const numToSync = this.calcSyncDiff(remoteDevice);
            if (numToSync > 0) {
                log.info(`Syncing ${remoteDevice.DeviceUUID.substring(0,8)} (${remoteDevice.DeviceName}): ${numToSync} events [${remoteDevice.LastSyncID - numToSync + 1} - ${remoteDevice.LastSyncID}]`);
                await this.syncDevice(remoteDevice, numToSync);
            }
        }

        let eventTypes = [...new Set(this.newEvents.map(e => e.type))];
        log.verbose(`Sync complete, found ${eventTypes.length} event types: [${eventTypes}]`);
        log.info(`Most recent feeding at ${this.lastFeedingTime.toLocaleString()}`);
    }

    async syncDevice(remoteDevice: DeviceInfo, numToSync: number) {
        const syncSinceId = remoteDevice.LastSyncID - numToSync;

        const url = `${this.baseUrl}/account/transaction/${remoteDevice.DeviceUUID}/${syncSinceId}`
        const res = await this.axios.get(url);
        if (res.status !== 200) {
            log.error('Baby tracker failed to sync device ${remoteDevice.DeviceUUID}');
            return;
        }

        const events = this.parseTransactions(res.data).filter(e => e.baby === 'Kai');
        // console.log(events);

        // update local sync state
        this.localDeviceInfo[remoteDevice.DeviceUUID] = remoteDevice;

        // save events to local storage
        this.newEvents.push(...events);

        // look for medication events
        this.findMedications(events);
    }

    calcSyncDiff(remoteDevice: DeviceInfo): number {
        const localDevice = this.localDeviceInfo[remoteDevice.DeviceUUID];
        if (!localDevice) {
            return Math.min(this.maxEventsLookback, remoteDevice.LastSyncID);
        }

        const diff = Math.max(0, remoteDevice.LastSyncID - localDevice.LastSyncID);

        return Math.min(diff, this.maxEventsLookback);
    }

    async saveSyncInfo() {
        // TODO: Save local sync state to disk
    }

    parseTransactions(transactions: any[]): EventInfo[] {
        return transactions.map(t => {
            // base64 decode the data
            const obj = JSON.parse(Buffer.from(t.Transaction, 'base64').toString('utf8'));
            if (obj.BCObjectType === 'Medication') {
                // console.log('obj :>> ', obj);
            }

            let startSide = 'E';    // assume Expressed unless Nursing below
            if (obj.BCObjectType === 'Nursing') {
                // 1 = Right, 2 = Left. So if finished on the left, started on the right
                startSide = obj.finishSide === 2 ? 'R' : 'L';
            }

            let medication = obj.medicationSelection?.name || '';
            if (medication.toLowerCase().includes('ibuprofen') || medication.toLowerCase().includes('motrin')) {
                medication = 'ibuprofen';
            } else if (medication.toLowerCase().includes('acetaminophen') || medication.toLowerCase().includes('tylenol')) {
                medication = 'acetaminophen';
            }

            return {
                syncID: t.SyncID,
                opCode: t.OPCode,
                type: obj.BCObjectType,
                startSide: startSide,
                medication: medication,
                time: new Date(obj.time),
                baby: obj.baby?.name || '',
            };
        });
    }

    findFeedings(events: EventInfo[]) {
        const feedings: EventInfo[] = [];
        for (const event of events) {
            if (event.type === 'Nursing' || event.type === 'Pumped' || 
                event.type === 'OtherFeed' || event.type === 'Formula') {
                feedings.push(event);
                // update last feeding time
                if (event.time > this.lastFeedingTime) {
                    log.info(`Found more recent feeding (ID ${event.syncID}): ${event.time.toLocaleString()}`)
                    this.lastFeedingTime = event.time;
                    
                    // if feeding is not nursing, append stars to indicate number of feeds since last nursing
                    if (event.type === 'Nursing') {
                        this.lastStartSide = event.startSide;
                    } else {
                        this.lastStartSide += '*';
                    }
                }
            }
        }
        // console.log(feedings);
    }

    findMedications(events: EventInfo[]) {
        const medications: EventInfo[] = [];
        for (const event of events) {
            if (event.type === 'Medication') {
                medications.push(event);

                // update last ibuprofen time
                if (event.medication === 'ibuprofen' && event.time > this.lastIbuprofenTime) {
                    log.info(`Found more recent ibuprofen (ID ${event.syncID}): ${event.time.toLocaleString()}`)
                    this.lastIbuprofenTime = event.time;
                }

                // update last acetaminophen time
                if (event.medication === 'acetaminophen' && event.time > this.lastAcetaminophenTime) {
                    log.info(`Found more recent acetaminophen (ID ${event.syncID}): ${event.time.toLocaleString()}`)
                    this.lastAcetaminophenTime = event.time;
                }
            }
        }
        console.log(medications);
    }
};
