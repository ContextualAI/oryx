import type { Readable } from "node:stream";

/**
 * Convert a Node.js Readable into a Web ReadableStream so it can be returned
 * through the standard Fetch Response constructor.
 */
export function nodeReadableToWebReadable(
  source: Readable,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  /**
   * Removes all attached event listeners from the source stream.
   * Hoisted to be accessible from both `start` and `cancel`.
   */
  let cleanup: () => void;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const handleData = (chunk: Buffer | string) => {
        if (typeof chunk === "string") {
          controller.enqueue(encoder.encode(chunk));
          return;
        }
        controller.enqueue(new Uint8Array(chunk));
      };

      const handleEnd = () => {
        cleanup();
        controller.close();
      };

      const handleError = (error: unknown) => {
        cleanup();
        controller.error(error);
      };

      cleanup = () => {
        source.off("data", handleData);
        source.off("end", handleEnd);
        source.off("error", handleError);
      };

      source.on("data", handleData);
      source.once("end", handleEnd);
      source.once("error", handleError);
    },
    cancel() {
      cleanup();
      source.destroy();
    },
  });
}
