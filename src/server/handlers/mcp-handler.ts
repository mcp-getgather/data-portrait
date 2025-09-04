import { Request, Response } from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';
import { settings } from '../config.js';

let client: Client | null = null;

async function getOrCreateClient(): Promise<Client> {
  if (!client) {
    client = new Client({ name: 'data-portrait', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(
      new URL(`${settings.GETGATHER_URL}/mcp`)
    );
    await client.connect(transport);
  }
  return client;
}

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
        parse_schema: z.record(z.unknown()),
        content: z.array(z.record(z.unknown())),
      })
    )
    .optional(),
});

type PurchaseHistoryResponse = {
  link_id: string;
  hosted_link_url: string;
  content: Array<any>;
};

export const handlePurchaseHistory = async (req: Request, res: Response) => {
  const { brandName } = req.params;

  const toolName = tools[brandName];
  if (!toolName) {
    res.status(400).json({ error: 'Invalid brand name' });
    return;
  }

  try {
    const mcpClient = await getOrCreateClient();

    const result = await mcpClient.callTool({ name: toolName });

    const mcpResponse = McpResponse.parse(result.structuredContent);

    const response: PurchaseHistoryResponse = {
      link_id: mcpResponse.link_id || '',
      hosted_link_url: mcpResponse.url || '',
      content: mcpResponse.extract_result?.[0]?.content || [],
    };

    res.json(response);
  } catch (error) {
    console.error('MCP client error:', error);
    res.status(500).json({ error: 'Failed to connect to MCP server' });
  }
};

export const handleMcpPoll = async (req: Request, res: Response) => {
  const { linkId } = req.params;
  const client = await getOrCreateClient();

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
