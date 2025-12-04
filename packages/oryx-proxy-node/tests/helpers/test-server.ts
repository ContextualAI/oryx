import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";

type TestServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

/**
 * Spin up a lightweight HTTP server that mimics upstream SSE behavior.
 */
export async function startTestServer(): Promise<TestServer> {
  const server = createServer(handleRequest);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to determine server address.");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

function handleRequest(request: IncomingMessage, response: ServerResponse) {
  const url = request.url ?? "/";
  if (url.startsWith("/sse-ok")) {
    sendStreamingResponse(response);
    return;
  }
  if (url.startsWith("/sse-error-json")) {
    sendJsonError(response);
    return;
  }
  if (url.startsWith("/sse-error-text")) {
    sendTextError(response);
    return;
  }
  response.statusCode = 404;
  response.end();
}

function sendStreamingResponse(response: ServerResponse) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");

  response.write(
    `data: ${JSON.stringify({
      event: "metadata",
      data: { conversation_id: "conv", request_id: "req", message_id: "msg" },
    })}\n\n`,
  );
  response.write(
    `data: ${JSON.stringify({
      event: "message_delta",
      data: { delta: "hello" },
    })}\n\n`,
  );
  response.end(
    `data: ${JSON.stringify({
      event: "end",
      data: {},
    })}\n\n`,
  );
}

function sendJsonError(response: ServerResponse) {
  response.statusCode = 400;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("x-request-id", "json-error");
  response.end(
    JSON.stringify({
      detail: "Bad request body.",
      error_code: "BAD_REQUEST",
      trace_stack: "stack",
    }),
  );
}

function sendTextError(response: ServerResponse) {
  response.statusCode = 500;
  response.setHeader("Content-Type", "text/plain");
  response.end("Internal failure.");
}
