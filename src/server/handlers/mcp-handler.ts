import { Request, Response } from 'express';
import { z } from 'zod';
import { mcpClientManager } from '../mcp-client.js';

const tools: Record<string, string> = {
  amazon: 'amazon_get_purchase_history',
  officedepot: 'officedepot_get_order_history',
  wayfair: 'wayfair_get_order_history',
  goodreads: 'goodreads_get_book_list',
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
        content: z.union([
          // wayfair response unparsed string
          z.string(),
          // amazon, officedepot, goo is parsed
          z.array(z.record(z.unknown())),
        ]),
      })
    )
    .optional(),
});

type PurchaseHistoryResponse = {
  link_id: string;
  hosted_link_url: string;
  content: Array<any> | Record<string, any>;
};

export const handlePurchaseHistory = async (req: Request, res: Response) => {
  const { brandName } = req.params;

  const toolName = tools[brandName];
  if (!toolName) {
    res.status(400).json({ error: 'Invalid brand name' });
    return;
  }

  const mcpClient = await mcpClientManager.get(req.sessionID);
  const result = await mcpClient.callTool({ name: toolName });

  const mcpResponse = McpResponse.parse(result.structuredContent);

  const response: PurchaseHistoryResponse = {
    link_id: mcpResponse.link_id || '',
    hosted_link_url: mcpResponse.url || '',
    content: [],
  };

  // didn't have any content
  if (!mcpResponse.extract_result?.[0]?.content) {
    res.json(response);
    return;
  }

  const rawContent = mcpResponse.extract_result[0].content;

  if (typeof rawContent === 'string') {
    response.content = JSON.parse(rawContent);
  } else {
    response.content = rawContent;
  }

  res.json(response);
};

export const handleMcpPoll = async (req: Request, res: Response) => {
  const { linkId } = req.params;

  const client = await mcpClientManager.get(req.sessionID);

  const result = await client.callTool({
    name: 'poll_auth',
    arguments: { link_id: linkId },
  });

  const response = result.structuredContent as { status?: string };

  res.json({
    auth_completed: response?.status === 'FINISHED',
    link_id: linkId,
  });
};
