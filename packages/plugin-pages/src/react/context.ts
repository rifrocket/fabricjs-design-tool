import { createContext } from "react";
import type { UsePagesResult } from "./usePages";

export const PagesContext = createContext<UsePagesResult | null>(null);
