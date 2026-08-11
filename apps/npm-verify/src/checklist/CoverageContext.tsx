import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { CheckStatus } from "./coverage";

interface CoverageContextValue {
  statuses: Record<string, CheckStatus>;
  report: (id: string, status: CheckStatus) => void;
}

const CoverageContext = createContext<CoverageContextValue | null>(null);

export function CoverageProvider({ children }: { children: ReactNode }): ReactElement {
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>({});

  const report = useCallback((id: string, status: CheckStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const value = useMemo(() => ({ statuses, report }), [statuses, report]);

  return <CoverageContext.Provider value={value}>{children}</CoverageContext.Provider>;
}

export function useCoverage(): CoverageContextValue {
  const ctx = useContext(CoverageContext);
  if (!ctx) throw new Error("useCoverage must be used within a CoverageProvider");
  return ctx;
}
