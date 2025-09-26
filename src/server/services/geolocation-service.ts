import { Request } from 'express';
import { City, WebServiceClient } from '@maxmind/geoip2-node';
import { settings } from '../config.js';
export interface LocationData {
  ip: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}
class GeolocationService {
  private ipCache: Map<string, City>;

  constructor() {
    this.ipCache = new Map();
  }

  getClientIp(request: Request): string {
    const xff = request.headers['x-forwarded-for'];
    if (xff && typeof xff === 'string') {
      return xff.split(',')[0].trim();
    }

    return request.ip || request.connection.remoteAddress || 'unknown';
  }

  getClientLocationFromCache(ipAddress: string) {
    const cachedLocationData = this.ipCache.get(ipAddress);
    console.log(
      '[getClientLocationFromCache] cached location data for ip address: ',
      ipAddress,
      cachedLocationData
    );
    if (!cachedLocationData) {
      return null;
    }

    let requestLocationData: LocationData = {
      ip: ipAddress,
      city: null,
      state: null,
      country: null,
      postal_code: null,
    };
    if (cachedLocationData) {
      requestLocationData = {
        ...requestLocationData,
        city: cachedLocationData?.city?.names.en ?? null,
        state:
          cachedLocationData?.subdivisions?.[
            cachedLocationData.subdivisions.length - 1
          ]?.names.en ?? null,
        country: cachedLocationData?.country?.isoCode ?? null,
        postal_code: cachedLocationData?.postal?.code ?? null,
      };

      console.log(
        `🔍 Client Location: city: ${requestLocationData.city}, country: ${requestLocationData.country}, state: ${requestLocationData.state}, postal_code: ${requestLocationData.postal_code}`
      );
    }
    return requestLocationData;
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
