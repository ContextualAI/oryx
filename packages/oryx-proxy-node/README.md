# `@contextualai/oryx-proxy-node`

Oryx Proxy is a lightweight SSE proxy utility for forwarding requests to Contextual AI agents in Node.js environments. It keeps your API keys secure on the server while providing flexible routing and error handling.

## Installation

```bash
pnpm add @contextualai/oryx-proxy-node
```

## Basic Usage

```ts
import { createOryxSSEProxy } from "@contextualai/oryx-proxy-node";

export const POST = createOryxSSEProxy({
  baseUrl: "https://api.contextual.ai",
  // Use `transform` to map agent ID.
  transform: (request) => ({
    url: `/v1/agents/${process.env.CONTEXTUAL_AGENT_ID}/query`,
  }),
  // Use `extraHeaders` to inject authentication or other headers.
  extendHeaders: (request) => ({
    Authorization: `Bearer ${process.env.CONTEXTUAL_API_KEY}`,
  }),
});
```

## Why Proxy?

- **Secure your API key** — proxying keeps your API key out of the browser.
- **Enforce authentication** — validate user sessions before forwarding requests.
- **Route dynamically** — hardcode or select agent IDs on the server side.
- **Rate limit on your end** — add additional layers of rate limiting using your tech stack.

## Documentation

For detailed guides, API reference, and examples, visit the **[Oryx Documentation](https://oryx.contextual.ai/proxy)**.
