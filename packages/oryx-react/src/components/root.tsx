"use client";

import { OryxContextPayload, OryxProvider } from "../context";

type OryxRootProps = {
  probe: OryxContextPayload;
  children?: React.ReactNode;
};

/**
 * Root provider component that wires the Oryx state into context.
 */
export function OryxRoot({ probe, children }: OryxRootProps): JSX.Element {
  return <OryxProvider payload={probe}>{children}</OryxProvider>;
}
