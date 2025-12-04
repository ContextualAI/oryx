import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { Buffer } from "node:buffer";
import type { Readable } from "node:stream";

import { nodeReadableToWebReadable } from "./internal/node-stream";
import type {
  ErrorBodyMapper,
  OryxProxyFactoryOptions,
  SSEErrorEventPayload,
  SSEProxyOptions,
} from "./types";

// ========== Constants ==========

const SSE_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

// ========== Public API ==========

/**
 * Create a handler that proxies SSE traffic from an upstream axios request.
 */
export function createOryxSSEProxyHandler(options: SSEProxyOptions) {
  return async (request: Request): Promise<Response> => {
    try {
      const upstreamConfig = await options.buildUpstreamRequest(request);

      const axiosConfig: AxiosRequestConfig = {
        ...upstreamConfig,
        responseType: "stream",
        validateStatus: () => true,
      };

      const response = await axios.request<Readable>(axiosConfig);
      const requestId = extractRequestId(response.headers);

      if (response.status >= 200 && response.status < 300) {
        return createSuccessResponse(response.data);
      }

      const errorBody = await readNodeStream(response.data).catch(() => "");
      return createErrorResponse({
        status: response.status,
        requestId,
        errorBody,
        mapErrorBody: options.mapErrorBody,
      });
    } catch (unknownError) {
      if (unknownError instanceof AxiosError) {
        return handleAxiosError(unknownError, options.mapErrorBody);
      }
      return createErrorResponse({
        status: 500,
        requestId: null,
        errorBody:
          unknownError instanceof Error
            ? unknownError.message
            : "Unknown error",
        mapErrorBody: options.mapErrorBody,
      });
    }
  };
}

/**
 * Convenience helper tailored for Contextual upstream APIs.
 * Automatically forwards request body, applies transformations, and extends headers.
 */
export function createOryxSSEProxy(options: OryxProxyFactoryOptions) {
  const normalizedBaseUrl = options.baseUrl.endsWith("/")
    ? options.baseUrl.slice(0, -1)
    : options.baseUrl;

  return async (request: Request): Promise<Response> => {
    const method = options.method
      ? typeof options.method === "function"
        ? options.method(request)
        : options.method
      : request.method;

    let requestBodyData: any = null;
    if (method !== "GET" && method !== "HEAD") {
      const text = await request.text();
      if (text.length > 0) {
        try {
          requestBodyData = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON in request body");
        }
      }
    }

    const handler = createOryxSSEProxyHandler({
      mapErrorBody: options.mapErrorBody,
      buildUpstreamRequest: async (incomingRequest) => {
        const currentUrl = new URL(incomingRequest.url);

        let targetPath: string;
        if (options.transform) {
          const transformResult = await options.transform(incomingRequest);
          targetPath = transformResult.url;
          if (!targetPath.startsWith("/")) {
            targetPath = `/${targetPath}`;
          }
        } else {
          targetPath = `${currentUrl.pathname}${currentUrl.search}`;
        }

        const targetUrl = `${normalizedBaseUrl}${targetPath}`;

        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "text/event-stream");

        const extendedHeaders = await options.extendHeaders?.(incomingRequest);
        if (extendedHeaders) {
          const merged = new Headers(extendedHeaders);
          merged.forEach((value, key) => {
            headers.set(key, value);
          });
        }

        return {
          url: targetUrl,
          method,
          headers: Object.fromEntries(headers.entries()),
          data: requestBodyData,
        };
      },
    });

    return handler(request);
  };
}

// ========== Response Helpers ==========

function createSuccessResponse(stream: Readable): Response {
  const body = nodeReadableToWebReadable(stream);
  return new Response(body, {
    status: 200,
    headers: SSE_HEADERS,
  });
}

async function handleAxiosError(
  error: AxiosError<Readable>,
  mapErrorBody?: ErrorBodyMapper,
): Promise<Response> {
  if (error.response) {
    const requestId = extractRequestId(error.response.headers);
    const errorBody = await readNodeStream(error.response.data).catch(
      () => error.message,
    );
    return createErrorResponse({
      status: error.response.status,
      requestId,
      errorBody,
      mapErrorBody,
    });
  }
  const fallbackPayload =
    mapErrorBody?.(error.message, 500) ??
    defaultMapErrorBody(error.message, 500);
  return respondWithError(fallbackPayload);
}

// ========== Axios Utilities ==========

function extractRequestId(headers: RawAxiosResponseHeaders): string | null {
  const candidate = headers["x-request-id"];
  if (Array.isArray(candidate)) {
    return candidate[0] ?? null;
  }
  if (typeof candidate === "string") {
    return candidate;
  }
  return null;
}

// ========== SSE Error Construction ==========

function createErrorResponse(params: {
  status: number;
  requestId: string | null;
  errorBody: string;
  mapErrorBody?: ErrorBodyMapper;
}): Response {
  const payload =
    params.mapErrorBody?.(params.errorBody, params.status) ??
    defaultMapErrorBody(params.errorBody, params.status);
  return respondWithError(payload, params.requestId);
}

function respondWithError(
  payload: SSEErrorEventPayload,
  requestId: string | null = null,
): Response {
  const chunks: string[] = [];
  if (requestId) {
    chunks.push(
      formatSseEvent("metadata", {
        conversation_id: "",
        request_id: requestId,
        message_id: "",
      }),
    );
  }
  chunks.push(formatSseEvent("error", payload));
  return new Response(chunks.join(""), {
    status: 200,
    headers: SSE_HEADERS,
  });
}

function formatSseEvent(event: string, data: unknown): string {
  return `data: ${JSON.stringify({ event, data })}\n\n`;
}

// ========== Stream Reading ==========

async function readNodeStream(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    let result = "";

    const cleanup = () => {
      stream.removeListener("data", onData);
      stream.removeListener("end", onEnd);
      stream.removeListener("error", onError);
    };

    const onData = (chunk: Buffer | string) => {
      result += typeof chunk === "string" ? chunk : chunk.toString("utf8");
    };

    const onEnd = () => {
      cleanup();
      resolve(result);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    stream.on("data", onData);
    stream.on("end", onEnd);
    stream.on("error", onError);
  });
}

// ========== Error Mapping ==========

function defaultMapErrorBody(
  rawBody: string | unknown,
  status: number,
): SSEErrorEventPayload {
  const parsed = maybeParseJson(rawBody);
  const message =
    extractDetail(parsed) ??
    (typeof rawBody === "string" && rawBody.trim().length > 0
      ? rawBody
      : `Request failed with status ${status}`);

  return {
    status,
    message,
    error_code: extractStringField(parsed, "error_code"),
    trace_stack: extractStringField(parsed, "trace_stack"),
  };
}

function maybeParseJson(raw: string | unknown): unknown {
  if (typeof raw !== "string") {
    return raw;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function extractDetail(candidate: unknown): string | null {
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }
  if (isRecord(candidate)) {
    if ("detail" in candidate) {
      const detailValue = candidate.detail;
      if (typeof detailValue === "string") {
        return detailValue;
      }
      return stringifyUnknown(detailValue);
    }
    if ("message" in candidate) {
      const messageValue = candidate.message;
      if (typeof messageValue === "string") {
        return messageValue;
      }
      return stringifyUnknown(messageValue);
    }
  }
  return null;
}

function extractStringField(
  candidate: unknown,
  field: string,
): string | undefined {
  if (isRecord(candidate) && field in candidate) {
    const value = candidate[field];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringifyUnknown(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return null;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
