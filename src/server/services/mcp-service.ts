import { mcpClientManager } from '../mcp-client.js';

export async function finalizeSignin({
  sessionId,
  clientIp,
  brandId,
  signinId,
}: {
  sessionId: string;
  clientIp: string;
  brandId: string;
  signinId: string;
}) {
  const mcpClient = await mcpClientManager.get({
    sessionId,
    clientIp,
    brandId,
  });

  await mcpClient.callTool({
    name: 'finalize_signin',
    arguments: { signin_id: signinId },
  });
}
