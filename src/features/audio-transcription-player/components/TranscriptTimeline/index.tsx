import { isBefore, isEqual, parse } from "date-fns";
import { Volume2Icon } from "lucide-react";
import { useEffect, useRef } from "react";

import { timelineData } from "../../constants/transcript-timeline";
import { useAudioPlayerStore } from "../../stores/audio-transcription-player-store";

const TranscriptTimeline = () => {
  const { currentTimeStamp } = useAudioPlayerStore();

  const parseTime = (time: string) => {
    if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return null;
    return parse(time, "mm:ss", new Date(0));
  };

  const currentTime = parseTime(currentTimeStamp || "");
  const maxTimelineTime = parseTime(timelineData[timelineData.length - 1].time);

  // Clamp time if it's invalid or after the last timeline item
  const safeCurrentTime =
    currentTime && maxTimelineTime && isBefore(currentTime, maxTimelineTime)
      ? currentTime
      : maxTimelineTime;

  console.log("UAT DEBUG - currentTimeStamp", currentTimeStamp);
  console.log("UAT DEBUG - parsed currentTime", currentTime);
  console.log("UAT DEBUG - clamped safeCurrentTime", safeCurrentTime);

  // Calculate active index based on current time
  const activeIndex =
    safeCurrentTime !== null
      ? timelineData.reduce((acc, item, index) => {
          const itemTime = parseTime(item.time);
          return itemTime &&
            (isBefore(itemTime, safeCurrentTime) ||
              isEqual(itemTime, safeCurrentTime))
            ? index
            : acc;
        }, -1)
      : -1;

  // Refs for each timeline item
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to active transcript block
  useEffect(() => {
    if (
      !currentTimeStamp ||
      currentTimeStamp === "" ||
      currentTime === null ||
      activeIndex === -1
    ) {
      return;
    }

    const activeItem = itemRefs.current[activeIndex];
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, currentTimeStamp]);

  return (
    <div className="relative">
      <h1 className="text-lg mb-5 ml-2">Transcription</h1>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        {timelineData.map((item, index) => (
          <div
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            className="relative flex items-start mb-6"
          >
            {/* Horizontal connector */}
            {index > 0 && (
              <div
                className={`absolute left-3 w-6 h-0.5 mt-3 ${
                  index === activeIndex ? "bg-slate-400" : "bg-slate-200"
                }`}
              ></div>
            )}

            <div
              className={`absolute ${
                index === 0 ? "left-[0.593rem] mt-0" : "left-8 mt-[0.58rem]"
              } w-2 h-2 rounded-full ${
                index === activeIndex ? "bg-slate-400" : "bg-slate-200"
              }`}
            ></div>

            {/* Content */}
            <div className="ml-10">
              <div className="flex items-center ml-2">
                <span
                  className={`w-7 h-7 rounded-full text-sm flex items-center justify-center text-white ${
                    item.speaker === "AV"
                      ? "bg-primary"
                      : "bg-warning-foreground"
                  }`}
                >
                  {item.speaker}
                </span>
                <span className="ml-2 text-md text-accent-foreground">
                  {item.name}
                </span>
                <span className="ml-2 text-md text-accent-foreground">
                  • {item.time}
                </span>
                {index === activeIndex && (
                  <Volume2Icon className="text-primary ml-2" size={20} />
                )}
              </div>
              <p
                className={`mt-1 ${
                  index === activeIndex ? "text-slate-500" : "text-slate-400"
                }  text-md ml-11 pr-4`}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptTimeline;
