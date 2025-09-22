import { Request, Response } from 'express';
import { z } from 'zod';
import { mcpClientManager } from '../mcp-client.js';
import { settings } from '../config.js';

const tools: Record<string, string[]> = {
  amazon: ['amazon_get_purchase_history'],
  officedepot: ['officedepot_get_order_history'],
  wayfair: ['wayfair_get_order_history', 'wayfair_get_order_history_details'],
  goodreads: ['goodreads_get_book_list'],
};

const McpResponse = z.object({
  // Auth fields
  url: z.string().optional(),
  link_id: z.string().optional(),
  message: z.string().optional(),
  system_message: z.string().optional(),

  // Data fields
  extract_result: z
    .array(
      z.object({
        name: z.string(),
        parsed: z.boolean(),
        parse_schema: z.record(z.unknown()).nullable(),
        // officedepot is parsed
        content: z.array(z.record(z.unknown())),
      })
    )
    .optional(),
  // goodreads response
  books: z.array(z.record(z.unknown())).optional(),
  // amazon response
  purchases: z.array(z.record(z.unknown())).optional(),
  // wayfair response
  purchase_history: z.array(z.record(z.unknown())).optional(),
  purchase_history_details: z.array(z.record(z.unknown())).optional(),
});

type PurchaseHistoryResponse = {
  link_id: string;
  hosted_link_url: string;
  content: Array<unknown> | Record<string, unknown>;
};

type PurchaseHistoryDetailsResponse = {
  content: Array<unknown> | Record<string, unknown>;
};

export const handlePurchaseHistory = async (req: Request, res: Response) => {
  const { brandName } = req.params;

  const toolName = tools[brandName][0];
  if (!toolName) {
    res.status(400).json({ error: 'Invalid brand name' });
    return;
  }

  const mcpClient = await mcpClientManager.get(req.sessionID);
  const result = await mcpClient.callTool({ name: toolName });

  const mcpResponse = McpResponse.parse(result.structuredContent);

  // replace get gatgather hosted-link with our own
  let hosted_link_url = '';
  if (mcpResponse.url) {
    hosted_link_url = mcpResponse.url.replace(
      settings.GETGATHER_URL,
      settings.APP_HOST
    );
  }

  const response: PurchaseHistoryResponse = {
    link_id: mcpResponse.link_id || '',
    hosted_link_url: hosted_link_url,
    content: [],
  };

  // didn't have any content
  if (
    !mcpResponse.extract_result?.[0]?.content &&
    !mcpResponse.books?.length &&
    !mcpResponse.purchases?.length &&
    !mcpResponse.purchase_history?.length
  ) {
    res.json(response);
    return;
  }

  const rawContent =
    mcpResponse.extract_result?.[0]?.content ||
    mcpResponse.books ||
    mcpResponse.purchases ||
    mcpResponse.purchase_history;

  if (typeof rawContent === 'string') {
    response.content = JSON.parse(rawContent);
  } else {
    response.content = rawContent || [];
  }

  res.json(response);
};

export const handlePurchaseHistoryDetails = async (
  req: Request,
  res: Response
) => {
  const { brandName, orderId } = req.params;
  const toolName = tools[brandName][1];
  if (!toolName) {
    res.status(400).json({ error: 'Invalid brand name' });
    return;
  }

  const mcpClient = await mcpClientManager.get(req.sessionID);
  const result = await mcpClient.callTool({
    name: tools[brandName][1],
    arguments: { order_id: orderId },
  });

  const mcpResponse = McpResponse.parse(result.structuredContent);

  // if didn't have any content
  if (!mcpResponse.purchase_history_details?.length) {
    res.json({});
    return;
  }

  const response: PurchaseHistoryDetailsResponse = {
    content: [],
  };

  const rawContent = mcpResponse.purchase_history_details;
  if (typeof rawContent === 'string') {
    response.content = JSON.parse(rawContent);
  } else {
    response.content = rawContent || [];
  }

  res.json(response);
};

export const handleMcpPoll = async (req: Request, res: Response) => {
  const { linkId } = req.params;
  const mcpClient = await mcpClientManager.get(req.sessionID);
  const result = await mcpClient.callTool({
    name: 'poll_signin',
    arguments: { link_id: linkId },
  });

  const response = result.structuredContent as { status?: string };

  res.json({
    auth_completed: response?.status === 'FINISHED',
    link_id: linkId,
  });
};
