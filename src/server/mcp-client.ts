import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { settings } from './config.js';

class MCPClient {
  client: Client;
  lastAccessed: Date;

  constructor() {
    this.client = new Client({ name: 'data-portrait', version: '1.0.0' });
    this.lastAccessed = new Date();
  }

  async connect(): Promise<void> {
    const transport = new StreamableHTTPClientTransport(
      new URL(`${settings.GETGATHER_URL}/mcp`),
      {
        requestInit: {
          headers: {
            'x-getgather-custom-app': 'data-portrait',
          },
        },
      }
    );
    await this.client.connect(transport);
  }

  close(): void {
    this.client.close?.();
  }

  get isExpired(): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.lastAccessed < oneHourAgo;
  }
}

class MCPClientManager {
  private clients = new Map<string, MCPClient>();

  constructor() {
    setInterval(() => this.cleanupExpiredClients(), 10 * 60 * 1000);
  }

  private cleanupExpiredClients(): void {
    for (const [sessionId, mcpClient] of this.clients.entries()) {
      if (mcpClient.isExpired) {
        mcpClient.close();
        this.clients.delete(sessionId);
      }
    }
  }

  has(sessionId: string): boolean {
    return this.clients.has(sessionId);
  }

  set(sessionId: string, client: MCPClient): void {
    this.clients.set(sessionId, client);
  }

  async get(sessionId: string): Promise<Client> {
    if (!this.has(sessionId)) {
      const mcpClient = new MCPClient();
      await mcpClient.connect();
      this.set(sessionId, mcpClient);
    }

    const mcpClient = this.clients.get(sessionId)!;
    mcpClient.lastAccessed = new Date();

    return mcpClient.client;
  }
}

export const mcpClientManager = new MCPClientManager();
