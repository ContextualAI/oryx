## `@contextualai/oryx-proxy-node`

`@contextualai/oryx-proxy-node` is a tiny helper for proxying Server-Sent Events (SSE) from any upstream HTTP API in a Node.js environment.

### Installation

```bash
pnpm add @contextualai/oryx-proxy-node axios
```

### Example: simple SSE proxy

```ts
import { createOryxSSEProxy } from "@contextualai/oryx-proxy-node";

export const POST = createOryxSSEProxy({
  baseUrl: "https://api.contextual.ai",
  extendHeaders: () => ({
    Authorization: `Bearer ${process.env.CONTEXTUAL_API_KEY}`,
  }),
});
```

### Example: transform URL and validate input

```ts
import { createOryxSSEProxy } from "@contextualai/oryx-proxy-node";

export const POST = createOryxSSEProxy({
  baseUrl: "https://api.contextual.ai",
  transform: (request) => {
    const url = new URL(request.url);
    const agentId = url.searchParams.get("agentId");

    if (!agentId) {
      throw new Error("Missing agentId parameter.");
    }

    // /api/chat?agentId=123 -> /v1/agents/123/query.
    return { url: `/v1/agents/${agentId}/query` };
  },
  extendHeaders: () => ({
    Authorization: `Bearer ${process.env.CONTEXTUAL_API_KEY}`,
  }),
});
```

### Example: full control over upstream request

```ts
import { createOryxSSEProxyHandler } from "@contextualai/oryx-proxy-node";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  const handler = createOryxSSEProxyHandler({
    buildUpstreamRequest: async () => ({
      url: `https://api.contextual.ai/v1/${process.env.CONTEXTUAL_AGENT_ID}/query`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CONTEXTUAL_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      data: body,
    }),
  });

  return handler(request);
}
```

### Example: custom error mapping

```ts
import { createOryxSSEProxy } from "@contextualai/oryx-proxy-node";

export const POST = createOryxSSEProxy({
  baseUrl: "https://api.contextual.ai",
  mapErrorBody: (rawBody, status) => {
    const parsed = typeof rawBody === "string" ? JSON.parse(rawBody) : {};

    return {
      status,
      message: parsed.reason ?? "Unknown failure.",
      error_code: parsed.code,
    };
  },
});
```
