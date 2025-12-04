"use client";

import React, {
  createContext,
  HTMLAttributes,
  useContext,
  useState,
} from "react";

import {
  OryxRetrievalItemProvider,
  useOryxRetrievalItemContext,
} from "../context";
import { OryxRetrieval, OryxRetrievalKind } from "../core/types";
import { useOryxRetrievals } from "../hooks";

// ========== Raw List Components ==========

type OryxRetrievalsRawListViewProps = {
  render: (retrieval: OryxRetrieval) => React.ReactNode | null;
};

/**
 * Escape hatch for rendering all retrievals via a render prop.
 * Each retrieval is wrapped in context so leaf components can access it.
 * The render function receives the full array, and each retrieval's context
 * is available to leaf components used within the render function.
 */
export function OryxRetrievalsRawListView({
  render,
}: OryxRetrievalsRawListViewProps): JSX.Element | null {
  const { retrievals } = useOryxRetrievals();
  if (!retrievals.length) return null;
  return (
    <>
      {retrievals.map((retrieval, index) => {
        return (
          <OryxRetrievalItemProvider
            key={`${retrieval.number}-${index}`}
            payload={{ retrieval }}
          >
            {render(retrieval)}
          </OryxRetrievalItemProvider>
        );
      })}
    </>
  );
}

// ========== List Components ==========

type OryxRetrievalsListViewProps = {
  children?: React.ReactNode;
};

/**
 * Radix-style list that implicitly loops through retrievals and establishes per-item context.
 */
export function OryxRetrievalsListView({
  children,
}: OryxRetrievalsListViewProps): JSX.Element | null {
  if (!children) return null;
  return <OryxRetrievalsRawListView render={() => children} />;
}

// ========== Leaf Component: Retrievals Section ==========

type RetrievalsSectionContextPayload = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
};

const RetrievalsSectionContext =
  createContext<RetrievalsSectionContextPayload | null>(null);

type OryxRetrievalsSectionViewProps = {
  children?: React.ReactNode;
  render?: (retrievals: OryxRetrieval[]) => React.ReactNode;
};

/**
 * This section will be entirely hidden if there are no retrievals.
 */
export function OryxRetrievalsSectionView({
  children,
  render = () => children,
}: OryxRetrievalsSectionViewProps): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const { retrievals } = useOryxRetrievals();
  if (!retrievals.length) return null;
  return (
    <RetrievalsSectionContext.Provider
      value={{ open, onOpenChange: setOpen, count: retrievals.length }}
    >
      {render(retrievals)}
    </RetrievalsSectionContext.Provider>
  );
}

// ========== Leaf Component: Retrievals Section Trigger ==========

type OryxRetrievalsSectionTriggerViewProps =
  | {
      render: (context: RetrievalsSectionContextPayload) => React.ReactNode;
      children?: never;
      onClick?: never;
    }
  | (HTMLAttributes<HTMLButtonElement> & {
      children?: React.ReactNode;
      render?: never;
    });

/**
 * Leaf primitive that renders the section trigger.
 */
export function OryxRetrievalsSectionTriggerView({
  render,
  children,
  ...props
}: OryxRetrievalsSectionTriggerViewProps): JSX.Element | null {
  const context = useContext(RetrievalsSectionContext);
  if (!context) {
    console.warn(
      "Oryx.Retrievals.SectionTrigger must be used inside Oryx.Retrievals.Section",
    );
    return null;
  }
  if (render) return <>{render(context)}</>;
  return (
    <button
      type={"button"}
      {...props}
      onClick={(event) => {
        if (render) return;
        props.onClick?.(event);
        context.onOpenChange(!context.open);
      }}
    >
      {children}
    </button>
  );
}

// ========== Leaf Component: Retrievals Documents Count ==========

type OryxRetrievalsDocumentsCountViewProps = {
  render?: (count: number) => React.ReactNode;
};

/**
 * Leaf primitive that renders the documents count.
 */
export function OryxRetrievalsDocumentsCountView({
  render = (count: number) => <>{count}</>,
}: OryxRetrievalsDocumentsCountViewProps): JSX.Element {
  const context = useContext(RetrievalsSectionContext);
  return <>{render(context?.count ?? 0)}</>;
}

// ========== Leaf Component: Retrievals Section Content ==========

type OryxRetrievalsSectionContentViewProps =
  | {
      render: (open: boolean) => React.ReactNode;
      children?: never;
    }
  | ({
      render?: never;
      children?: React.ReactNode;
    } & HTMLAttributes<HTMLDivElement>);

/**
 * Leaf primitive that renders the section content.
 */
export function OryxRetrievalsSectionContentView({
  render,
  children,
  ...props
}: OryxRetrievalsSectionContentViewProps): JSX.Element | null {
  const context = useContext(RetrievalsSectionContext);
  const open = context?.open ?? true;
  if (render) return <>{render(open)}</>;

  // When the view is not customized, we use conditional rendering to fold/expand the section.
  if (!open) return null;
  return <div {...props}>{children ?? null}</div>;
}

// ========== Leaf Component: Retrieval Item ==========

type OryxRetrievalItemViewProps = {
  render: (retrieval: OryxRetrieval) => React.ReactNode;
};

/**
 * Leaf primitive that renders the entire retrieval object.
 * Requires a render function that receives the full OryxRetrieval.
 */
export function OryxRetrievalItemView({
  render,
}: OryxRetrievalItemViewProps): JSX.Element {
  const { retrieval } = useOryxRetrievalItemContext("Oryx.Retrieval.Item");
  return <>{render(retrieval)}</>;
}

// ========== Leaf Component: Retrieval Type ==========

type OryxRetrievalTypeViewProps = {
  render?: (type: OryxRetrievalKind) => React.ReactNode;
};

/**
 * Leaf primitive that renders the retrieval type.
 */
export function OryxRetrievalTypeView({
  render = (type: OryxRetrievalKind) => <>{type}</>,
}: OryxRetrievalTypeViewProps): JSX.Element {
  const { retrieval } = useOryxRetrievalItemContext("Oryx.Retrieval.Type");
  return <>{render(retrieval.type)}</>;
}

// ========== Leaf Component: Document Name ==========

type OryxRetrievalDocumentNameViewProps = {
  render?: (name: string) => React.ReactNode;
};

/**
 * Leaf primitive that renders the retrieval document name.
 */
export function OryxRetrievalDocumentNameView({
  render = (name: string) => <>{name}</>,
}: OryxRetrievalDocumentNameViewProps): JSX.Element {
  const { retrieval } = useOryxRetrievalItemContext(
    "Oryx.Retrieval.DocumentName",
  );
  return <>{render(retrieval.name)}</>;
}

// ========== Leaf Component: Retrieval Number ==========

type OryxRetrievalNumberViewProps = {
  render?: (number: number) => React.ReactNode;
};

/**
 * Leaf primitive that renders the retrieval number.
 */
export function OryxRetrievalNumberView({
  render = (number: number) => <>{number}</>,
}: OryxRetrievalNumberViewProps): JSX.Element {
  const { retrieval } = useOryxRetrievalItemContext("Oryx.Retrieval.Number");
  return <>{render(retrieval.number)}</>;
}
