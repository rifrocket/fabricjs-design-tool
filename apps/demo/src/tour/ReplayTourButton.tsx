import type { ReactElement } from "react";
import { HelpCircle } from "lucide-react";
import { ICON_BUTTON_CLASS } from "../shell/Header";
import { useTourContext } from "./TourContext";

export function ReplayTourButton({ pagesMode }: { pagesMode: boolean }): ReactElement {
  const { replayCoreTour, replayPagesTour } = useTourContext();
  return (
    <button
      type="button"
      onClick={pagesMode ? replayPagesTour : replayCoreTour}
      title={pagesMode ? "Replay pages tour" : "Replay tour"}
      className={ICON_BUTTON_CLASS}
    >
      <HelpCircle size={16} strokeWidth={2} />
    </button>
  );
}
