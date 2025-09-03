import { Request, Response } from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';

// Single MCP Client instance
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

// Function to poll auth status
async function pollAuthStatus(
  client: Client,
  linkId: string
): Promise<boolean> {
  try {
    const result = await client.callTool({
      name: 'poll_auth',
      arguments: { link_id: linkId },
    });

    console.log('Poll auth result:', result.structuredContent);

    // Check if auth is completed - handle different response formats
    const response = result.structuredContent as any;
    return (
      response?.status === 'completed' ||
      response?.status === 'FINISHED' ||
      response?.auth_completed === true
    );
  } catch (error) {
    console.error('Failed to poll auth status:', error);
    return false;
  }
}

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
    res.status(400).json({ error: 'Invalid brand name' });
    return;
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

    res.json(response);
  } catch (error) {
    console.error('MCP client error:', error);
    res.status(500).json({ error: 'Failed to connect to MCP server' });
  }
};

export const handleMcpPoll = async (req: Request, res: Response) => {
  const { linkId } = req.params;

  if (!linkId) {
    res.status(400).json({ error: 'link_id is required' });
    return;
  }

  try {
    const mcpClient = await getOrCreateClient();

    const authCompleted = await pollAuthStatus(mcpClient, linkId);

    res.json({
      auth_completed: authCompleted,
      link_id: linkId,
    });
  } catch (error) {
    console.error('MCP poll error:', error);
    res.status(500).json({ error: 'Failed to poll MCP server' });
  }
};
