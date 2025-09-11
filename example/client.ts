import { makePaymentAwareClientTransport } from "mcpay/transport";
import { createSigner, type MultiNetworkSigner } from "x402/types";
import { experimental_createMCPClient, generateText, type Tool } from "ai"

export const getClient = async () => {
    // GET PRIVATE KEYS TO SIGN TRANSACTIONS
    const PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY as `0x${string}`;
    const SOLANA_SECRET_KEY = process.env.SOLANA_SECRET_KEY as `0x${string}`;
    const MCP_SERVER_URL = "http://localhost:3000/mcp"

    // CREATE SIGNERS FOR EVM AND SOLANA
    const evmSigner = await createSigner("base-sepolia", PRIVATE_KEY);
    const solanaSigner = await createSigner("solana-devnet", SOLANA_SECRET_KEY);

    const client = await experimental_createMCPClient({
        name: 'example-client',
        transport: makePaymentAwareClientTransport(MCP_SERVER_URL, { evm: evmSigner, svm: undefined } as unknown as MultiNetworkSigner)
    });

    return client
}

export const getClientResponse = async () => {
    const client = await getClient()

    const tools = await client.tools() as Record<string, Tool>

    const response = await generateText({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: "How is the weather in Tokyo?" }],
        tools: tools,
        maxRetries: 10,
        stopWhen: ({steps}) => {
            if (steps.length > 10) {
                return true
            }
            return false
        }
    })

    return response
}

const response = await getClientResponse()
console.log(response.text)