import { timelineData } from "../../constants/transcript-timeline";

const TranscriptTimeline = () => {
  return (
    <div className="relative ">
      <h1 className="text-lg mb-5 ml-2">Transcription</h1>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted-foreground"></div>
        {timelineData.map((item, index) => (
          <div key={index} className="relative flex items-start mb-6">
            {/* Circle marker on the vertical line */}
            {/* Horizontal line connecting the dot to the content */}
            {index > 0 && (
              <div className="absolute left-3 w-6 h-0.5 bg-muted-foreground mt-3"></div>
            )}
            {/* Small dot at the end of the horizontal line (left side) */}
            {index === 0 ? (
              <div className="absolute left-[0.593rem] w-2 h-2 rounded-full bg-muted-foreground"></div>
            ) : (
              <div className="absolute left-8 w-2 h-2 rounded-full bg-muted-foreground mt-[0.58rem]"></div>
            )}
            {/* Content */}
            <div className="ml-10">
              <div className="flex items-center ml-2">
                <span
                  className={`w-7 h-7 rounded-full text-sm flex items-center justify-center text-white ${item.speaker === "AV" ? "bg-primary" : "bg-warning-foreground"}`}
                >
                  {item.speaker}
                </span>
                <span className="ml-2 text-md text-accent-foreground">
                  {item.name}
                </span>
                <span className="ml-2 text-md text-accent-foreground">
                  • {item.time}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground text-md ml-11 pr-4">
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
