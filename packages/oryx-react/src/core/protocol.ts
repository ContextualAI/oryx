"use client";

import { z } from "zod";

// ========== Stream Event Types ==========

/**
 * Stream event types supported by Oryx.
 */
export enum OryxStreamEventType {
  RETRIEVALS = "retrievals",
  MESSAGE_DELTA = "message_delta",
  MESSAGE_COMPLETE = "message_complete",
  ERROR = "error",
  END = "end",
  METADATA = "metadata",
  REQUEST_ID = "request_id",
}

export const OryxStreamEventTypeSchema = z.nativeEnum(OryxStreamEventType);

// ========== Streaming Error Schemas ==========

/**
 * Shape of an error payload emitted through the streaming channel.
 */
export const OryxStreamingErrorEventSchema = z.object({
  status: z.number(),
  message: z.string(),
  error_code: z.string().optional(),
  trace_stack: z.string().optional(),
});

// ========== Static Error Schemas ==========

export const OryxStaticErrorSchema = z.object({
  /**
   * Error detail message.
   */
  detail: z.string(),
  /**
   * Optional error code identifier.
   */
  error_code: z.string().optional(),
});

// ========== Retrieval Content Types ==========

/**
 * Metadata schema for retrieval contents.
 */
const MetadataValueSchema = z
  .union([z.string(), z.number(), z.boolean()])
  .nullable()
  .optional();

const ContextualMetadataSchema = z
  .object({
    document_title: z.string().optional().nullable(),
    section_title: z.string().optional().nullable(),
    is_figure: z.boolean().optional().nullable(),
    file_name: z.string().optional().nullable(),
    chunk_size: z.number().optional().nullable(),
    file_format: z.string().optional().nullable(),
    page: z.number().optional().nullable(),
    chunk_id: z.string().optional().nullable(),
    date_created: z.string().optional().nullable(),
    section_id: z.string().optional().nullable(),
  })
  .catchall(MetadataValueSchema);

/**
 * Retrieval content payload emitted from the streaming endpoint.
 */
export const OryxRetrievalContentEventSchema = z.object({
  number: z.number(),
  type: z.literal("file"),
  format: z.string(),
  content_id: z.string(),
  datastore_id: z.string().optional().nullable(),
  content_text: z.string().optional().nullable(),
  doc_id: z.string(),
  doc_name: z.string(),
  page: z.number().optional().nullable(),
  url: z.string().optional().nullable(),
  custom_metadata: z.record(MetadataValueSchema).optional().nullable(),
  contextual_metadata: ContextualMetadataSchema.optional().nullable(),
});

// ========== Metadata Event Schemas ==========

/**
 * Schema for metadata event payload.
 */
export const OryxMetadataEventSchema = z.object({
  conversation_id: z.string(),
  request_id: z.string(),
  message_id: z.string(),
});

/**
 * Schema for request_id event payload.
 */
export const OryxRequestIdEventSchema = z.object({
  request_id: z.string(),
});

// ========== Stream Payload Schemas ==========

/**
 * Schema for validating message delta event payloads.
 */
export const OryxMessageDeltaEventSchema = z.object({
  delta: z.string(),
});

/**
 * Schema for validating message complete event payloads.
 */
export const OryxMessageCompleteEventSchema = z.object({
  final_message: z.string(),
});

/**
 * Schema for validating retrieval event payloads.
 */
export const OryxRetrievalEventSchema = z.object({
  contents: z.unknown(),
});

// ========== Retrieval Preview Schemas ==========

/**
 * Zod schema for unstructured content metadata returned by the retrieval preview API.
 * Use this schema for runtime validation of backend responses.
 */
export const OryxRetrievalPreviewMetadataSchema = z.object({
  /**
   * Page number of the content.
   */
  page: z.number().int(),
  /**
   * Image of the page on which the content occurs.
   */
  page_img: z.string(),
  /**
   * The content ID.
   */
  content_id: z.string().uuid(),
  /**
   * The document ID which the content belongs to.
   */
  document_id: z.string().uuid(),
  /**
   * Type of content. Currently only supporting "unstructured",
   * but allow any string to pass validation to be future-proof.
   */
  content_type: z.literal("unstructured").or(z.string()),
  /**
   * Text of the content.
   */
  content_text: z.string(),
});
