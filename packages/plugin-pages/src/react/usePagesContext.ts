import { useContext } from "react";
import { PagesContext } from "./context";
import type { UsePagesResult } from "./usePages";

export function usePagesContext(): UsePagesResult {
  const pages = useContext(PagesContext);
  if (!pages) {
    throw new Error("usePagesContext() must be called within a <PagesProvider>");
  }
  return pages;
}
