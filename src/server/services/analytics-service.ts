import { Analytics } from '@segment/analytics-node';
import { settings } from '../config.js';

class AnalyticsService {
  private analytics: Analytics | null;

  constructor() {
    this.analytics = this._getAnalytics();
  }

  private _getAnalytics(): Analytics | null {
    if (settings.SEGMENT_WRITE_KEY) {
      return new Analytics({
        writeKey: settings.SEGMENT_WRITE_KEY,
      });
    }
    console.log('Analytics disabled - no write key configured');
    return null;
  }

  async identify(
    userId: string,
    traits: Record<string, any> = {}
  ): Promise<void> {
    if (!userId || !this.analytics) return;

    try {
      // Only set email as userId if it looks like an email, otherwise use provided email in traits
      const finalTraits = { ...traits };
      if (!finalTraits.email && userId.includes('@')) {
        finalTraits.email = userId;
      }

      this.analytics.identify({
        userId,
        traits: finalTraits,
      });
    } catch (error) {
      console.error('Analytics identify failed:', error);
    }
  }

  async track(
    userId: string,
    event: string,
    properties: Record<string, any> = {}
  ): Promise<void> {
    if (!userId || !event || !this.analytics) return;

    try {
      this.analytics.track({
        userId,
        event,
        properties: {
          ...properties,
          source: 'circuit-shack',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Analytics track failed:', error);
    }
  }

  async flush(): Promise<void> {
    if (!this.analytics) return;

    try {
      await this.analytics.closeAndFlush();
    } catch (error) {
      console.error('Analytics flush failed:', error);
    }
  }
}

export const analytics = new AnalyticsService();

// Graceful shutdown
process.on('SIGTERM', () => analytics.flush());
process.on('SIGINT', () => analytics.flush());
