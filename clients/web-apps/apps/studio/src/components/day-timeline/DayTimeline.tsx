import { Accordion } from "@avplatform/ui/accordion";
import { useEffect, useRef, useState } from "react";

type DayTimelineDay = {
  date: string;
  entries: { id: string }[];
};

type DayTimelineProps = {
  /** Days, newest first. */
  days: DayTimelineDay[];
  /** Selected entry; its day is opened without closing other days. */
  selectedId?: string;
  children: React.ReactNode;
};

/**
 * Accordion of days on a shared timeline rail. The newest day starts open; days the user opens
 * stay open until the user collapses them.
 */
export const DayTimeline = ({ days, selectedId, children }: DayTimelineProps) => {
  const [openDays, setOpenDays] = useState<string[]>([]);
  const hasOpenedNewestDay = useRef(false);
  const newestDay = days[0]?.date;
  const selectedDay = days.find((day) =>
    day.entries.some((entry) => entry.id === selectedId),
  )?.date;

  useEffect(() => {
    if (!newestDay || hasOpenedNewestDay.current) return;
    hasOpenedNewestDay.current = true;
    setOpenDays((open) => (open.includes(newestDay) ? open : [...open, newestDay]));
  }, [newestDay]);

  useEffect(() => {
    if (!selectedDay) return;
    setOpenDays((open) => (open.includes(selectedDay) ? open : [...open, selectedDay]));
  }, [selectedDay]);

  return (
    <Accordion type="multiple" className="relative" value={openDays} onValueChange={setOpenDays}>
      {children}
    </Accordion>
  );
};
