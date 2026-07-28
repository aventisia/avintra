import { useRef, useState } from "react";
import { Participant } from "../constants/types";

export function useTooltipController() {
  const [tooltipData, setTooltipData] = useState<Participant | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltipFor = (info: Participant) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setTooltipData(info);
    setIsTooltipVisible(true);
  };

  const hideTooltipWithDelay = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
      setTooltipData(null);
    }, 200);
  };

  const cancelHideTooltip = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  return {
    tooltipData,
    isTooltipVisible,
    showTooltipFor,
    hideTooltipWithDelay,
    cancelHideTooltip,
  };
}
