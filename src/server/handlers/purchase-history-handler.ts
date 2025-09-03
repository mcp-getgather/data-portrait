import { Request, Response } from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';

// MCP Client setup
let client: Client | null = null;

const McpResponse = z.object({
  content: z.array(
    z.object({
      text: z.string(),
    })
  ),
});

const ExtractedResult = z.object({
  extract_result: z.array(
    z.object({
      content: z.array(z.record(z.unknown())),
    })
  ),
});

const tools: Record<string, string> = {
  goodreads: 'goodreads_get_book_list',
};

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

export const handlePurchaseHistory = async (req: Request, res: Response) => {
  const { brandName } = req.params;

  const toolName = tools[brandName];
  if (!toolName) {
    return res.status(400).json({ error: 'Invalid brand name' });
  }

  try {
    const mcpClient = await getOrCreateClient();
    const result = await mcpClient.callTool({ name: toolName });

    const mcpResponse = McpResponse.parse(result);
    const mcpContent = mcpResponse.content[0]?.text;
    if (!mcpContent) {
      return res
        .status(500)
        .json({ error: 'No content received from MCP server' });
    }

    const extracted_result = ExtractedResult.parse(JSON.parse(mcpContent));
    res.send(extracted_result.extract_result[0]?.content);
  } catch (error) {
    console.error('MCP client error:', error);
    return res.status(500).json({ error: 'Failed to connect to MCP server' });
  }
};
