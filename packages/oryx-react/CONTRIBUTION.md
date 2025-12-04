# Project Oryx Technical Documentation

## State Management

- We use `OryxAction` with a reducer to aggregate streaming events into reproducible states. `OryxAction` is a discriminated union with `type`, which determines the expected `payload` shape with type narrowing.

## Typing

- `core/protocol.ts` stores Zod schemas that match API service, so we can validate the shape before passing into components.
- `core/types.ts` stores static TypeScript types for Oryx components, which we don't need runtime validation.
