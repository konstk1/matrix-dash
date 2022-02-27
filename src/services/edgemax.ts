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

  private sessionId = '';
  private csrfToken = '';

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
      validateStatus: function(status: number) {
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
  }

  public async getInfo(): Promise<any> {
    const response = await this.axios.get('api/edge/get.json');
    return response.data;
  }

  public async connectWebsocket(): Promise<void> {
    const ws = new WebSocket(`wss://${this.host}/ws/stats`, {
      headers: { 'Cookie': `beaker.session.id=${this.sessionId}; X-CSRF-TOKEN=${this.csrfToken}`},
      rejectUnauthorized: false,  // allow self-signed certs
    });

    ws.on('open', () => {
      const subscribeCommand = {
        SUBSCRIBE: [{
          name: 'interfaces',
        }],
        SESSION_ID: this.sessionId,
      };
      console.log('connected');
      const str = JSON.stringify(subscribeCommand);
      const msg = `${str.length}\r\n${str}`;
      console.log('msg :>> ', msg);
      ws.send(msg);
    });
    
    ws.on('message', function message(data: any) {
      console.log('received: %s', data);
    });
  }
}

// 228
// {"SUBSCRIBE":[{"name":"export"},{"name":"discover"},{"name":"interfaces"},{"name":"system-stats"},{"name":"num-routes"},{"name":"config-change"},{"name":"users"}],"UNSUBSCRIBE":[],"SESSION_ID":"a887b890bb614870aac819e916ddd039"}