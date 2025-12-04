import { NextRequest, NextResponse } from "next/server";

import { CONTEXTUAL_AGENT_ID, CONTEXTUAL_API_KEY } from "@/lib/constants";

const CONTEXTUAL_API_BASE_URL =
  process.env.CONTEXTUAL_API_BASE_URL ?? "https://api.contextual.ai";

/**
 * Proxy endpoint for retrieval info requests.
 */
export async function GET(request: NextRequest) {
  if (!CONTEXTUAL_API_KEY) {
    return NextResponse.json(
      { error: "CONTEXTUAL_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  if (!CONTEXTUAL_AGENT_ID) {
    return NextResponse.json(
      { error: "CONTEXTUAL_AGENT_ID is not configured on the server." },
      { status: 500 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const messageId = searchParams.get("messageId");
  const contentId = searchParams.get("contentId");

  if (!messageId || !contentId) {
    return NextResponse.json(
      {
        error: "Missing required query parameters: messageId, contentId",
      },
      { status: 400 },
    );
  }

  try {
    // Build URL with content_ids as array parameter
    // The API expects content_ids as an array, so we pass it multiple times
    const url = new URL(
      `${CONTEXTUAL_API_BASE_URL}/v1/agents/${CONTEXTUAL_AGENT_ID}/query/${messageId}/retrieval/info`,
    );
    url.searchParams.append("content_ids", contentId);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CONTEXTUAL_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Retrieval info proxy failed.", {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: `API responded with ${response.status}: ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
