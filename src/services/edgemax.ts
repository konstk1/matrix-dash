import axios, { AxiosInstance } from 'axios';
import * as WebSocket from 'ws';
import * as qs from 'qs';
import * as https from 'https';
import { log } from '../log';

/**
 * Interface to the EdgeMax API.
 * @class EdgeMax
 * 
 * https://github.com/matthew1471/EdgeOS-API/blob/master/Documentation/README.adoc
 */
export class EdgeMax {
    private readonly host: string
    private readonly baseUrl: string;
    private readonly axios: AxiosInstance;

    private ws?: WebSocket;

    private sessionId = '';
    private csrfToken = '';

    // streaming data management
    private incomingData: string = '';
    private incomingLength: number = 0;

    public onStats: (stats: any) => void = () => { };

    constructor(host: string) {
        this.host = host;
        this.baseUrl = `https://${host}`;

        this.axios = axios.create({
            baseURL: this.baseUrl,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
        });
    }

    public isLoggedIn(): boolean {
        return this.sessionId !== '';
    }

    /**
     * Login to the EdgeMax API. The credentials are set in a cookie that's
     * part of the 303 redirect.
     */
    public async login(): Promise<void> {
        const credentials = {
            username: process.env.EDGEMAX_USERNAME || '',
            password: process.env.EDGEMAX_PASSWORD || '',
        };

        const options = {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            maxRedirects: 0, // don't follow 303 redirect and get cookies from response
            validateStatus: function (status: number) {
                return status >= 200 && status <= 303; // allow 303 response, expect this
            },
        };

        const response = await this.axios.post('/', qs.stringify(credentials), options);
        log.info('Logged in to EdgeMax');

        // get the session id and csrf token from the response cookies
        response.headers['set-cookie']?.forEach(cookie => {
            const sessMatch = cookie.match(/beaker\.session\.id=([^;]+)/);
            if (sessMatch) {
                this.sessionId = sessMatch[1];
            }

            const csrfMatch = cookie.match(/X-CSRF-TOKEN=([^;]+)/);
            if (csrfMatch) {
                this.csrfToken = csrfMatch[1];
            }

        });

        this.axios.defaults.headers.common['cookie'] = `beaker.session.id=${this.sessionId}; X-CSRF-TOKEN=${this.csrfToken}`;

        // periodically call heartbeat to keep the session alive
        setInterval(this.heartBeat.bind(this), 1000 * 60 * 10);
    }

    public async heartBeat(): Promise<void> {
        const response = await this.axios.get(`api/edge/heartbeat.json?t=${Date.now()}`);
        log.verbose('EdgeMax heart beat: %O', response.data);
    }

    public async getInfo(): Promise<any> {
        const response = await this.axios.get('api/edge/get.json');
        return response.data;
    }

    public connectWebsocket(): void {
        this.ws = new WebSocket(`wss://${this.host}/ws/stats`, {
            headers: { 'Cookie': `beaker.session.id=${this.sessionId}; X-CSRF-TOKEN=${this.csrfToken}` },
            rejectUnauthorized: false,  // allow self-signed certs
        });

        this.ws.on('open', this.onWsConnect.bind(this));
        this.ws.on('message', this.onWsMessage.bind(this));
        this.ws.on('close', this.onWsDisconnect.bind(this));

        this.ws.on('error', (error: any) => {
            log.error('Edgemax websocket error: %O', error);
        });
    }

    private onWsConnect() {
        log.info('Websocket connected');

        const subscribeCommand = {
            SUBSCRIBE: [{
                name: 'interfaces',
            }],
            SESSION_ID: this.sessionId,
        };

        const str = JSON.stringify(subscribeCommand);
        const msg = `${str.length}\n${str}`;

        this.ws?.send(msg);
    }

    private onWsDisconnect() {
        log.info('Websocket disconnected, reconnecting...');
        this.connectWebsocket();
    }

    private onWsMessage(data: string) {
        if (this.incomingLength === 0) {
            // console.log('data :>> ', data.substring(0, 8));
            const len = data.substring(0, data.indexOf('\n'));
            this.incomingLength = parseInt(len, 10);
            this.incomingData = data.substring(data.indexOf('\n') + 1);
            // console.log('this.incomingLength :>> ', this.incomingLength);
        } else {
            this.incomingData += data;
            // console.log('Added data: ', this.incomingData.length);
        }

        if (this.incomingData.length >= this.incomingLength) {
            const message = JSON.parse(this.incomingData);
            this.incomingData = '';
            this.incomingLength = 0;

            this.onStats({
                rxBps: message.interfaces.eth0.stats.rx_bps,
                txBps: message.interfaces.eth0.stats.tx_bps,
            });
        }
    }
}

// {"SUBSCRIBE":[{"name":"export"},{"name":"discover"},{"name":"interfaces"},{"name":"system-stats"},{"name":"num-routes"},{"name":"config-change"},{"name":"users"}],"UNSUBSCRIBE":[],"SESSION_ID":"a887b890bb614870aac819e916ddd039"}

