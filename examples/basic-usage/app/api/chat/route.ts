import { createOryxSSEProxy } from "@contextualai/oryx-proxy-node";

import { CONTEXTUAL_AGENT_ID, CONTEXTUAL_API_KEY } from "@/lib/constants";

const CONTEXTUAL_API_BASE_URL =
  process.env.CONTEXTUAL_API_BASE_URL ?? "https://api.contextual.ai";

export const POST = createOryxSSEProxy({
  baseUrl: CONTEXTUAL_API_BASE_URL,
  transform: () => ({
    url: `/v1/agents/${CONTEXTUAL_AGENT_ID}/query`,
  }),
  extendHeaders: () => ({
    Authorization: `Bearer ${CONTEXTUAL_API_KEY}`,
  }),
});
