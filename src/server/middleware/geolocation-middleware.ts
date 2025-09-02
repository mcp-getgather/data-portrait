import { Request, Response, NextFunction } from 'express';
import { GeolocationService } from '../services/geolocation-service.js';

// LocationData interface - defined here where it's created
export interface LocationData {
  ip: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

class GeolocationMiddleware {
  private geolocationService: GeolocationService;

  constructor(geolocationService: GeolocationService) {
    this.geolocationService = geolocationService;
  }

  middleware = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const clientIp = this.geolocationService.getClientIp(request);
      const locationData =
        await this.geolocationService.getClientLocation(clientIp);

      let requestLocationData: LocationData = {
        ip: clientIp,
        city: null,
        state: null,
        country: null,
        postal_code: null,
      };

      if (locationData) {
        requestLocationData = {
          ...requestLocationData,
          city: locationData?.city?.names.en ?? null,
          state:
            locationData?.subdivisions?.[locationData.subdivisions.length - 1]
              ?.names.en ?? null,
          country: locationData?.country?.isoCode ?? null,
          postal_code: locationData?.postal?.code ?? null,
        };

        console.log(
          `🔍 Client Location: city: ${requestLocationData.city}, country: ${requestLocationData.country}, state: ${requestLocationData.state}, postal_code: ${requestLocationData.postal_code}`
        );
      }

      // Attach location data to request for use by auth routes
      request.location = requestLocationData;

      next();
    } catch (error) {
      console.error('Geolocation middleware error:', error);
      // Continue without location data on error
      request.location = {
        ip: this.geolocationService.getClientIp(request),
      };
      next();
    }
  };
}
