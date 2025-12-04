import { ZodError } from "zod";

import { OryxStaticErrorSchema } from "../core/protocol";
import { OryxError } from "../core/types";

// ========== Axios Support ==========

type AxiosLikeError = {
  isAxiosError: true;
  response?: { data?: unknown; status?: number };
};

/**
 * Type guard for axios-like error objects.
 * Uses duck typing to detect axios errors without requiring axios as a dependency.
 */
function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    error.isAxiosError === true
  );
}

// ========== Error Extraction ==========

/**
 * Extracts a normalized OryxError from various error types.
 * Handles ZodError, axios-like errors, and generic Error instances.
 */
export function extractOryxError(error: unknown): OryxError {
  // If it is zod validation error, return the error.
  if (error instanceof ZodError) {
    return {
      status: 400,
      detail: error.errors.map((e) => e.message).join(", "),
    };
  }

  if (isAxiosLikeError(error)) {
    const responseData = error.response?.data;
    const parseResult = OryxStaticErrorSchema.safeParse(responseData);

    if (parseResult.success) {
      return {
        status: error.response?.status ?? 500,
        detail: parseResult.data.detail,
        error_code: parseResult.data.error_code,
      };
    }
  }

  return {
    status: 500,
    detail:
      error instanceof Error ? error.message : "An unknown error occurred",
  };
}
