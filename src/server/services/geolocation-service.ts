import { Request } from 'express';
import { Cache } from '../utils/cache.js';
import { City, WebServiceClient } from '@maxmind/geoip2-node';
import { settings } from '../config.js';

class GeolocationService {
  private ipCache: Cache;

  constructor() {
    this.ipCache = new Cache(5);
  }

  getClientIp(request: Request): string {
    const xff = request.headers['x-forwarded-for'];
    if (xff && typeof xff === 'string') {
      return xff.split(',')[0].trim();
    }

    return request.ip || request.connection.remoteAddress || 'unknown';
  }

  async getClientLocation(ipAddress: string): Promise<City | null> {
    console.log(`🔍 Getting client location for IP: ${ipAddress}`);

    if (
      ipAddress === 'unknown' ||
      ipAddress === '127.0.0.1' ||
      ipAddress === '::1'
    ) {
      return null;
    }

    const cached = this.ipCache.get(ipAddress);
    if (cached) {
      console.log(
        '[getClientLocation] cached response for ip address: ',
        ipAddress
      );
      return cached;
    }

    // MaxMind API call with built-in timeout
    if (!settings.MAXMIND_ACCOUNT_ID || !settings.MAXMIND_LICENSE_KEY) {
      console.warn('MaxMind account ID or license key not configured');
      return null;
    }

    try {
      const client = new WebServiceClient(
        settings.MAXMIND_ACCOUNT_ID,
        settings.MAXMIND_LICENSE_KEY,
        { timeout: 3000 } // 3 second timeout
      );

      const response = await client.city(ipAddress);
      this.ipCache.set(ipAddress, response);
      console.log('[getClientLocation] set cache for ip address: ', ipAddress);
      return response;
    } catch (error) {
      console.error(`Error geolocating IP ${ipAddress}:`, error);
      return null;
    }
  }
}

const geolocationService = new GeolocationService();

export { geolocationService, GeolocationService };
