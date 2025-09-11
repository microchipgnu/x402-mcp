import { Hono } from "hono";
import { createMcpHandler } from "mcp-handler"; // your src/handler/index.ts default export
import { withPayment } from "mcpay/handler";
import { z } from "zod";

const app = new Hono();

const base = createMcpHandler(
    (server) => {
        server.tool(
            "weather",
            "Paid tool",
            { city: z.string() },
            async ({ city }) => ({
                content: [{ type: "text", text: `The weather in ${city} is sunny` }],
            })
        );

        server.tool(
            "free_tool",
            "Free to use",
            { s: z.string(), city: z.string() },
            async ({ s, city }) => ({
                content: [{ type: "text", text: `We support ${city}` }],
            })
        );
    },
    {
        serverInfo: { name: "paid-mcp", version: "1.0.0" },
    },
);

const paid = withPayment(base, {
    toolPricing: {
        weather: "$0.001",
    },
    payTo: {
        "base-sepolia": "0xc9343113c791cB5108112CFADa453Eef89a2E2A2",
        "solana-devnet": "4VQeAqyPxR9pELndskj38AprNj1btSgtaCrUci8N4Mdg"
    },
    facilitator: {
        url: "https://facilitator.x402.rs"
    }
});

app.use("*", (c) => paid(c.req.raw));

export default app;