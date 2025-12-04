import { createOryxSSEProxy, createOryxSSEProxyHandler } from "../src";
import { startTestServer } from "./helpers/test-server";

let baseUrl: string;
let closeServer: () => Promise<void>;

beforeAll(async () => {
  const server = await startTestServer();
  baseUrl = server.baseUrl;
  closeServer = server.close;
});

afterAll(async () => {
  await closeServer();
});

async function readResponseStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    return "";
  }
  const chunks: string[] = [];
  const decoder = new TextDecoder();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      chunks.push(decoder.decode());
      break;
    }
    if (value) {
      chunks.push(decoder.decode(value, { stream: true }));
    }
  }
  return chunks.join("");
}

type ParsedEvent = {
  event: string;
  data: unknown;
};

function parseEvents(raw: string): ParsedEvent[] {
  return raw
    .split("\n\n")
    .filter((chunk) => chunk.startsWith("data: "))
    .map((chunk) => {
      const jsonPayload = chunk.replace("data: ", "");
      const parsed = JSON.parse(jsonPayload);
      if (!isParsedEvent(parsed)) {
        throw new Error("Malformed SSE payload.");
      }
      return parsed;
    });
}

describe("createOryxSSEProxyHandler", () => {
  test("forwards upstream SSE chunks verbatim", async () => {
    const handler = createOryxSSEProxyHandler({
      buildUpstreamRequest: async () => ({
        url: `${baseUrl}/sse-ok`,
        method: "GET",
      }),
    });

    const response = await handler(new Request("https://proxy.local/sse-ok"));
    const body = await readResponseStream(response);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(body).toContain('"event":"metadata"');
    expect(body).toContain('"event":"message_delta"');
    expect(body).toContain('"event":"end"');
  });

  test("catches buildUpstreamRequest errors and returns SSE error events", async () => {
    const handler = createOryxSSEProxyHandler({
      buildUpstreamRequest: async () => {
        throw new Error("Configuration error");
      },
    });

    const response = await handler(new Request("https://proxy.local/test"));
    const events = parseEvents(await readResponseStream(response));
    const errorEvent = events.find((event) => event.event === "error");

    expect(response.status).toBe(200);
    expect(errorEvent?.data).toMatchObject({
      status: 500,
      message: "Configuration error",
    });
  });
});

describe("createOryxSSEProxy", () => {
  test("transforms URL and extends headers", async () => {
    const handler = createOryxSSEProxy({
      baseUrl,
      transform: (request) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        return { url: `/sse-ok?transformed=${id}` };
      },
      extendHeaders: () => ({ "x-custom": "oryx" }),
    });

    const response = await handler(
      new Request("https://app.local/path?id=123"),
    );
    const body = await readResponseStream(response);

    expect(response.status).toBe(200);
    expect(body).toContain('"event":"message_delta"');
  });

  test("validates requests via transform errors", async () => {
    const handler = createOryxSSEProxy({
      baseUrl,
      transform: () => {
        throw new Error("Validation failed");
      },
    });

    const response = await handler(new Request("https://proxy.local/test"));
    const events = parseEvents(await readResponseStream(response));

    expect(events.find((e) => e.event === "error")?.data).toMatchObject({
      status: 500,
      message: "Validation failed",
    });
  });

  test("method override works", async () => {
    const handler = createOryxSSEProxy({
      baseUrl,
      method: "GET",
    });

    const response = await handler(
      new Request("https://app.local/sse-ok", { method: "POST" }),
    );

    expect(response.status).toBe(200);
  });

  test("rejects invalid JSON in request body", async () => {
    const handler = createOryxSSEProxy({
      baseUrl,
    });

    const response = await handler(
      new Request("https://app.local/sse-ok", {
        method: "POST",
        body: "not valid json{",
        headers: { "Content-Type": "application/json" },
      }),
    );
    const events = parseEvents(await readResponseStream(response));

    expect(response.status).toBe(200);
    expect(events.find((e) => e.event === "error")?.data).toMatchObject({
      status: 500,
      message: "Invalid JSON in request body",
    });
  });
});

describe("Error handling", () => {
  test("converts upstream JSON errors to SSE error events", async () => {
    const handler = createOryxSSEProxyHandler({
      buildUpstreamRequest: async () => ({
        url: `${baseUrl}/sse-error-json`,
        method: "GET",
      }),
    });

    const response = await handler(
      new Request("https://proxy.local/fail-json"),
    );
    const events = parseEvents(await readResponseStream(response));

    expect(events[0]?.event).toBe("metadata");
    expect(events[1]?.data).toMatchObject({
      status: 400,
      message: "Bad request body.",
      error_code: "BAD_REQUEST",
    });
  });

  test("converts upstream text errors to SSE error events", async () => {
    const handler = createOryxSSEProxyHandler({
      buildUpstreamRequest: async () => ({
        url: `${baseUrl}/sse-error-text`,
        method: "GET",
      }),
    });

    const response = await handler(
      new Request("https://proxy.local/fail-text"),
    );
    const events = parseEvents(await readResponseStream(response));

    expect(events.find((e) => e.event === "error")?.data).toMatchObject({
      status: 500,
      message: expect.stringContaining("Internal failure"),
    });
  });

  test("handles network failures as SSE error events", async () => {
    const handler = createOryxSSEProxyHandler({
      buildUpstreamRequest: async () => ({
        url: "http://127.0.0.1:9/unreachable",
        method: "GET",
      }),
    });

    const response = await handler(
      new Request("https://proxy.local/network-error"),
    );
    const events = parseEvents(await readResponseStream(response));

    expect(response.status).toBe(200);
    expect(events.find((e) => e.event === "error")?.data).toMatchObject({
      status: 500,
      message: expect.any(String),
    });
  });

  test("mapErrorBody customizes error format", async () => {
    const handler = createOryxSSEProxyHandler({
      buildUpstreamRequest: async () => ({
        url: `${baseUrl}/sse-error-json`,
        method: "GET",
      }),
      mapErrorBody: (rawBody, status) => ({
        status,
        message: "Custom error message",
        error_code: "CUSTOM_CODE",
      }),
    });

    const response = await handler(new Request("https://proxy.local/fail"));
    const events = parseEvents(await readResponseStream(response));

    expect(events.find((e) => e.event === "error")?.data).toMatchObject({
      message: "Custom error message",
      error_code: "CUSTOM_CODE",
    });
  });
});

function isParsedEvent(value: unknown): value is ParsedEvent {
  return (
    isRecord(value) &&
    typeof value.event === "string" &&
    Object.prototype.hasOwnProperty.call(value, "data")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
