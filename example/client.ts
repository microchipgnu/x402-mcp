import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { withX402Client } from "mcpay/client";
import { createSigner, isEvmSignerWallet, isSvmSignerWallet } from "x402/types";


export const getClient = async () => {
  const client = new Client({
    name: "example-client",
    version: "1.0.0",
  });

  const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY as `0x${string}`;
  const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY as `0x${string}`;
  const MCP_SERVER_URL = "http://localhost:3000/mcp"

  const transport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL));

  // ✅ Wait for the connection
  await client.connect(transport);

  const evmSigner = await createSigner("base-sepolia", EVM_PRIVATE_KEY);
  const svmSigner = await createSigner("solana-devnet", SOLANA_PRIVATE_KEY);

  if (!isEvmSignerWallet(evmSigner)) {
    throw new Error("Failed to create EVM signer");
  }
  if (!isSvmSignerWallet(svmSigner)) {
    throw new Error("Failed to create SVM signer");
  }

  return withX402Client(client, {
    wallet: {
      evm: evmSigner,
      svm: svmSigner
    },
    confirmationCallback: async (payment) => {
        return true
    }
  });
};

export const getClientResponse = async () => {
  const client = await getClient();

  const tools = await client.listTools();
  console.log("Tools:", JSON.stringify(tools, null, 2));

  // ✅ Correct overload: (name: string, args?: Record<string, unknown>)
  const res = await client.callTool({
    name: "hello",
    arguments: {
      name: "Yo"
    },
  });
  return res;
};

try {
  console.log("[main] Starting test...");
  const response = await getClientResponse();
  console.log("[main] Final response:", response);
} catch (err) {
  console.error(err);
}