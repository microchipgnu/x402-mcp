import { z } from "zod";
import { createMcpHandler } from "mcp-handler"; // your src/handler/index.ts default export
import { Hono } from "hono";
import { withPayment } from "mcpay/handler";

const app = new Hono();

const base = createMcpHandler(
    (server) => {
        server.tool(
            "paid_tool",
            "Paid tool",
            {},
            async () => ({
                content: [{ type: "text", text: `Result for` }],
            })
        );

        server.tool(
            "free_tool",
            "Free to use",
            { s: z.string() },
            async ({ s }) => ({
                content: [{ type: "text", text: `Echo: ${s}` }],
            })
        );
    },
    {
        serverInfo: { name: "paid-mcp", version: "1.0.0" },
    },
);

const paid = withPayment(base, {
    toolPricing: {
        hello: "$0.01",
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