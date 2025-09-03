import { Request, Response } from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';

// MCP Client setup
let client: Client | null = null;

async function getOrCreateClient(): Promise<Client> {
  if (!client) {
    client = new Client({ name: 'data-portrait', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(
      new URL('http://127.0.0.1:23456/mcp')
    );
    await client.connect(transport);
  }
  return client;
}

const tools: Record<string, string> = {
  goodreads: 'goodreads_get_book_list',
};

const McpResponse = z.object({
  // Auth fields (when auth needed)
  url: z.string().optional(),
  link_id: z.string().optional(),
  message: z.string().optional(),
  system_message: z.string().optional(),

  // Data fields (when data ready)
  content: z
    .array(
      z.object({
        text: z.string(),
      })
    )
    .optional(),
});

const ExtractedResult = z.object({
  extract_result: z.array(
    z.object({
      content: z.array(z.record(z.unknown())),
    })
  ),
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
    return res.status(400).json({ error: 'Invalid brand name' });
  }

  try {
    const mcpClient = await getOrCreateClient();
    const result = await mcpClient.callTool({ name: toolName });

    console.warn(
      'DEBUGPRINT[507]: purchase-history-handler.ts:67: result.structuredContent=',
      result.structuredContent
    );
    const mcpResponse = McpResponse.parse(result.structuredContent);
    console.warn(
      'DEBUGPRINT[506]: purchase-history-handler.ts:67: mcpResponse=',
      mcpResponse
    );
    let content: Array<any> = [];
    if (mcpResponse.content) {
      console.warn(
        'DEBUGPRINT[504]: purchase-history-handler.ts:70 (after if (mcpResponse.content) )'
      );
      const mcpContent = mcpResponse.content[0]?.text;
      if (mcpContent) {
        const extracted_result = ExtractedResult.parse(JSON.parse(mcpContent));
        content = extracted_result.extract_result[0]?.content || [];
      }
    }

    const response: PurchaseHistoryResponse = {
      link_id: mcpResponse.link_id || '',
      hosted_link_url: mcpResponse.url || '',
      content,
    };

    return res.json(response);
  } catch (error) {
    console.error('MCP client error:', error);
    return res.status(500).json({ error: 'Failed to connect to MCP server' });
  }
};
