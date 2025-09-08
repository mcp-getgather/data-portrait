import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  type CallToolResult,
  type CompatibilityCallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { settings } from './config.js';

class MCPClient {
  private client: Client;
  lastAccessed: Date;

  constructor() {
    this.client = this.createClient();
    this.lastAccessed = new Date();
  }

  private createClient(): Client {
    return new Client({ name: 'data-portrait', version: '1.0.0' });
  }

  private createTransport(): StreamableHTTPClientTransport {
    return new StreamableHTTPClientTransport(
      new URL(`${settings.GETGATHER_URL}/mcp`),
      {
        requestInit: {
          headers: {
            'x-getgather-custom-app': 'data-portrait',
          },
        },
      }
    );
  }

  async connect(): Promise<void> {
    await this.client.connect(this.createTransport());
  }

  async callTool(
    params: {
      name: string;
      arguments?: {};
    },
    maxRetries: number = 3
  ): Promise<CallToolResult | CompatibilityCallToolResult> {
    this.lastAccessed = new Date();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.client.callTool(params);
      } catch (err) {
        if (attempt === maxRetries) {
          throw err;
        }
        console.warn(
          `callTool failed (attempt ${attempt + 1}/${maxRetries + 1}), attempting MCP client reconnect...`,
          err
        );
        await this.reconnect();
      }
    }

    throw new Error('callTool failed after maximum retries');
  }

  async reconnect(): Promise<void> {
    this.lastAccessed = new Date();

    try {
      if (this.client) {
        await this.client.close?.().catch(() => {});
      }
    } finally {
      this.client = this.createClient();
      await this.connect();
    }
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
    for (const [sessionId, mcpClient] of Array.from(this.clients.entries())) {
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

  async get(sessionId: string): Promise<MCPClient> {
    if (!this.has(sessionId)) {
      const mcpClient = new MCPClient();
      await mcpClient.connect();
      this.set(sessionId, mcpClient);
    }

    const mcpClient = this.clients.get(sessionId)!;
    mcpClient.lastAccessed = new Date();

    return mcpClient;
  }
}

export const mcpClientManager = new MCPClientManager();
