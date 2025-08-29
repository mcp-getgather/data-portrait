import { Request, Response } from 'express';
import { settings } from '../config.js';
import { createSanitizedLogMessage } from '../utils/request-sanitizer.js';

export const handleLinkProxy = async (req: Request, res: Response) => {
  try {
    const baseUrl = settings.GETGATHER_URL.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/link/create`;

    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    };

    const data = req.body || {};

    console.log(createSanitizedLogMessage('🔗 Link creation request', data));

    const upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(30000),
    });

    res.status(upstreamResponse.status);

    const responseBody = await upstreamResponse.text();
    res.send(responseBody);

    console.log('✅ Link created successfully');
  } catch (error) {
    console.error('❌ Link creation failed', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Link creation failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
};

export const handleLinkStatusProxy = async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;
    const baseUrl = settings.GETGATHER_URL.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/link/status/${linkId}`;

    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    };

    console.log(
      createSanitizedLogMessage('📊 Link status request', { linkId })
    );

    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000),
    });

    res.status(upstreamResponse.status);

    const responseBody = await upstreamResponse.text();
    res.send(responseBody);

    console.log('✅ Link status retrieved successfully');
  } catch (error) {
    console.error('❌ Link status retrieval failed', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Link status retrieval failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
};
