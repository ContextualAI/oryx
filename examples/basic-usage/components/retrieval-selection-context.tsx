"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Selection data for retrieval preview.
 */
export type RetrievalSelection = {
  contentId: string;
  messageId: string;
};

type RetrievalSelectionContextPayload = {
  /**
   * Currently selected retrieval for preview.
   */
  selection: RetrievalSelection | null;
  /**
   * Sets the currently selected retrieval.
   */
  setSelection: (selection: RetrievalSelection) => void;
};

const RetrievalSelectionContext =
  createContext<RetrievalSelectionContextPayload | null>(null);

type RetrievalSelectionProviderProps = {
  children: ReactNode;
  selection: RetrievalSelection | null;
  setSelection: (selection: RetrievalSelection) => void;
};

/**
 * Provider that exposes retrieval selection state to child components.
 */
export function RetrievalSelectionProvider({
  children,
  selection,
  setSelection,
}: RetrievalSelectionProviderProps) {
  return (
    <RetrievalSelectionContext.Provider value={{ selection, setSelection }}>
      {children}
    </RetrievalSelectionContext.Provider>
  );
}

/**
 * Hook to access retrieval selection state.
 * Returns null if used outside of RetrievalSelectionProvider.
 */
export function useRetrievalSelection() {
  const context = useContext(RetrievalSelectionContext);
  return context;
}
