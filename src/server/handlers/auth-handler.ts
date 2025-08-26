import { Request, Response } from 'express';
import { settings } from '../config.js';
import { createSanitizedLogMessage } from '../utils/request-sanitizer.js';

export const handleAuthProxy = async (req: Request, res: Response) => {
  try {
    const { brandName } = req.params;
    const baseUrl = settings.GETGATHER_URL.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/auth/${brandName}`;

    const headers = {
      Authorization: `Bearer ${settings.GETGATHER_API_KEY}`,
      'Content-Type': 'application/json',
      host: new URL(settings.GETGATHER_URL).host,
    };

    const data = req.body || {};
    if ((req as any).location) {
      data.location = (req as any).location;
      data.forwarded_ip = (req as any).location.ip;
    }

    console.log(
      createSanitizedLogMessage(`🔄 Auth request: ${brandName}`, data)
    );

    const upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(90000),
    });

    res.status(upstreamResponse.status);

    upstreamResponse.headers.forEach((value, key) => {
      const skipHeaders = [
        'content-encoding',
        'content-length',
        'transfer-encoding',
      ];
      if (!skipHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const responseBody = await upstreamResponse.text();
    res.send(responseBody);

    console.log(`✅ Auth successful: ${brandName}`);
  } catch (error) {
    console.error(`❌ Auth failed: ${req.params.brandName}`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Auth request failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
};
