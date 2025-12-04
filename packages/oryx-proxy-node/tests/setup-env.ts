import { TextDecoder, TextEncoder } from "node:util";

if (!globalThis.TextEncoder) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.TextDecoder = TextDecoder;
}
