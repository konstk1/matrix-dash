import axios, { AxiosInstance } from 'axios';
import * as qs from 'qs';
import * as https from 'https';

/**
 * Interface to the EdgeMax API.
 * @class EdgeMax
 * 
 * https://github.com/matthew1471/EdgeOS-API/blob/master/Documentation/README.adoc
 */
export class EdgeMax {
  private readonly baseUrl: string;
  private readonly axios: AxiosInstance;

  constructor(host: string) {
    this.baseUrl = `https://${host}`;

    this.axios = axios.create({
      baseURL: this.baseUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
    });
  }

  /**
   * Login to the EdgeMax API. The credentials are set in a cookie that's
   * part of the 303 redirect.
   */
  async login(): Promise<any> {
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
    // fs.writeFileSync('edgemax.html', response.data);
    // console.log('response :>> ', response.headers);
    
    const cookies = response.headers['set-cookie']?.filter(cookie => cookie.includes('PHPSESSID') || cookie.includes('X-CSRF-TOKEN'));
    console.log('cookies :>> ', cookies);
    
    this.axios.defaults.headers.common['cookie'] = cookies?.join('; ') || '';
  }

  async getInfo(): Promise<any> {
    const response = await this.axios.get('api/edge/get.json');
    console.log('response :>> ', response);
  }
}