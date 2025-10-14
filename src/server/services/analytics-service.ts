import { Analytics } from '@segment/analytics-node';
import { settings } from '../config.js';

class AnalyticsService {
  private analytics: Analytics | null = null;

  private getClient(): Analytics | null {
    if (!settings.SEGMENT_WRITE_KEY) {
      console.log('Segment write key not configured');
    } else {
      this.analytics = new Analytics({
        writeKey: settings.SEGMENT_WRITE_KEY,
      });
      return this.analytics;
    }
    return null;
  }

  async identify(
    userId: string,
    traits: Record<string, any> = {}
  ): Promise<void> {
    if (!userId) return;

    const client = this.getClient();
    if (!client) return;

    try {
      // Only set email as userId if it looks like an email, otherwise use provided email in traits
      const finalTraits = { ...traits };
      if (!finalTraits.email && userId.includes('@')) {
        finalTraits.email = userId;
      }

      client.identify({
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
    if (!userId || !event) return;

    const client = this.getClient();
    if (!client) return;

    try {
      client.track({
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
    const client = this.getClient();
    if (!client) return;

    try {
      await client.closeAndFlush();
    } catch (error) {
      console.error('Analytics flush failed:', error);
    }
  }
}

export const analytics = new AnalyticsService();

// Graceful shutdown
process.on('SIGTERM', () => analytics.flush());
process.on('SIGINT', () => analytics.flush());
