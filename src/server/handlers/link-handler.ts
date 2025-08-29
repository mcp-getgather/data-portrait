import { Request, Response } from 'express';
import { z } from 'zod';
import { settings } from '../config.js';
import { createSanitizedLogMessage } from '../utils/request-sanitizer.js';

const LinkCreateResponseSchema = z.object({
  link_id: z.string(),
  hosted_link_url: z.string(),
});

export const handleLinkCreate = async (req: Request, res: Response) => {
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

    const rawResponseBody = await upstreamResponse.json();
    const responseBody = LinkCreateResponseSchema.parse(rawResponseBody);

    // replace get gatgather hosted-link with our own
    responseBody.hosted_link_url = responseBody.hosted_link_url.replace(
      settings.GETGATHER_URL,
      settings.APP_HOST
    );

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

export const handleLinkStatus = async (req: Request, res: Response) => {
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
