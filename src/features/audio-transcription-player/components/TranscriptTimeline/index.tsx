import { isBefore, isEqual, parse } from "date-fns";
import { Volume2Icon } from "lucide-react";
import { useEffect, useRef } from "react";

import { timelineData } from "../../constants/transcript-timeline";
import { useAudioPlayerStore } from "../../stores/audio-transcription-player-store";

const TranscriptTimeline = () => {
  const { currentTimeStamp } = useAudioPlayerStore();

  const parseTime = (time: string) => parse(time, "mm:ss", new Date(0));
  const currentTime = parseTime(currentTimeStamp || "");

  // Calculate active index based on current time
  const activeIndex = timelineData.reduce((acc, item, index) => {
    const itemTime = parseTime(item.time);
    return isBefore(itemTime, currentTime) || isEqual(itemTime, currentTime)
      ? index
      : acc;
  }, -1);

  // Refs for each timeline item
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to active transcript block
  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "center", // or "center" if you prefer
      });
    }
  }, [activeIndex]);

  return (
    <div className="relative ">
      <h1 className="text-lg mb-5 ml-2">Transcription</h1>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-input"></div>

        {timelineData.map((item, index) => (
          <div
            key={index}
            ref={(el) => (itemRefs.current[index] = el)} // Attach ref
            className="relative flex items-start mb-6"
          >
            {/* Horizontal connector */}
            {index > 0 && (
              <div
                className={`absolute left-3 w-6 h-0.5 mt-3 ${index === activeIndex ? "bg-muted-foreground" : "bg-input"}`}
              ></div>
            )}

            <div
              className={`absolute ${index === 0 ? "left-[0.593rem] mt-0" : "left-8 mt-[0.58rem]"} w-2 h-2 rounded-full ${index === activeIndex ? "bg-muted-foreground" : "bg-input"}`}
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
              <p className={`mt-1 text-muted-foreground text-md ml-11 pr-4`}>
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
