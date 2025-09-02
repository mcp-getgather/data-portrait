import { Request, Response } from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';

// MCP Client
const client = new Client({ name: 'data-portrait', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(
  new URL('http://127.0.0.1:23456/mcp')
);
await client.connect(transport);

const McpResponse = z.object({
  content: z.array(
    z.object({
      text: z.string(),
    })
  ),
});

const tools: Record<string, string> = {
  goodreads: 'goodreads_get_book_list',
};

export const handlePurchaseHistory = async (req: Request, res: Response) => {
  const { brandName } = req.params;

  const toolName = tools[brandName];

  const result = await client.callTool({
    name: toolName,
  });

  const mcpResponse = McpResponse.parse(result);
  const out = JSON.parse(mcpResponse.content[0].text);
  res.send(out);
};
