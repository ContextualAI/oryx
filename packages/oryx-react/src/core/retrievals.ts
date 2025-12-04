import { z } from "zod";

import { OryxRetrievalContentEventSchema } from "./protocol";
import { OryxRetrieval } from "./types";

// ========== Public API ==========

/**
 * Normalize an unknown payload into a list of Oryx retrievals.
 */
export function mapRetrievalEventPayloadToOryxRetrievals(
  payload: unknown,
): OryxRetrieval[] {
  const parsed = z
    .object({
      contents: z.array(OryxRetrievalContentEventSchema),
    })
    .safeParse(payload);
  if (!parsed.success) {
    console.error("Failed to parse retrieval contents", parsed.error);
    return [];
  }
  return parsed.data.contents.map((content) => ({
    contentId: content.content_id,
    number: content.number,
    type: content.type,
    name: content.doc_name,
    snippet: content.content_text ?? undefined,
    extras: {
      datastoreId: content.datastore_id ?? undefined,
      documentId: content.doc_id,
      format: content.format,
      page: content.page ?? undefined,
      url: content.url ?? undefined,
      customMetadata: content.custom_metadata ?? undefined,
      contextualMetadata: content.contextual_metadata ?? undefined,
    },
  }));
}
