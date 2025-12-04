import type { AxiosRequestConfig } from "axios";

/**
 * Shape of the SSE error event that downstream clients receive.
 */
export type SSEErrorEventPayload = {
  status: number;
  message: string;
  error_code?: string;
  trace_stack?: string;
};

/**
 * Function signature responsible for translating the inbound Request
 * into an Axios request configuration used for the upstream call.
 */
export type UpstreamConfigBuilder = (
  request: Request,
) => Promise<AxiosRequestConfig> | AxiosRequestConfig;

/**
 * Optional hook that allows applications to customize how upstream
 * error bodies are translated into SSE error payloads.
 */
export type ErrorBodyMapper = (
  rawBody: string | unknown,
  status: number,
) => SSEErrorEventPayload;

/**
 * Configuration accepted by createOryxSSEProxyHandler.
 */
export type SSEProxyOptions = {
  buildUpstreamRequest: UpstreamConfigBuilder;
  mapErrorBody?: ErrorBodyMapper;
};

/**
 * Result of the transform function.
 * Currently supports URL transformation, expandable for future needs.
 */
export type TransformResult = {
  /**
   * The target URL path (e.g., "/v1/agents/123/query").
   */
  url: string;
};

/**
 * Function that transforms the incoming request.
 * Return an object with transformation results.
 */
export type RequestTransformer = (
  request: Request,
) => TransformResult | Promise<TransformResult>;

/**
 * Options accepted by createOryxSSEProxy helper.
 */
export type OryxProxyFactoryOptions = {
  baseUrl: string;
  /**
   * Optional function to transform the request before proxying.
   * Return an object with `url` field containing the target path.
   * If not provided, preserves the original path and query string.
   */
  transform?: RequestTransformer;
  /**
   * Optional HTTP method override.
   * If not provided, uses the incoming request method.
   */
  method?: string | ((request: Request) => string);
  /**
   * Optional hook for mutating outgoing headers before the upstream call.
   */
  extendHeaders?: (
    request: Request,
  ) => Promise<HeadersInit | undefined> | HeadersInit | undefined;
  mapErrorBody?: ErrorBodyMapper;
};
