import { Volume2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface AIAudioPlayerProps {
  /** Raw base64 string OR a full data URL ("data:audio/...;base64,..."). */
  base64Data: string;
  /**
   * Audio MIME type used when constructing the data URL.
   * Defaults to "audio/mpeg" which covers mp3 output from ElevenLabs.
   * Pass the actual MIME from TTSResponseDto if available.
   */
  format?: string;
}

/**
 * Renders a native <audio> player for TTS output received as base64.
 *
 * Handles two input shapes:
 *   1. Already a data URL  → used as-is (avoids double-encoding)
 *   2. Raw base64 string   → prefixed with the correct data URL scheme
 *
 * Auto-plays on mount since the user just hit Execute and expects to hear output.
 * A visual "Now playing" badge makes the auto-play obvious.
 */
const AIAudioPlayer = ({
  base64Data,
  format = "audio/mpeg",
}: AIAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioSrc = useMemo(() => {
    if (!base64Data) return "";
    // If the API already returned a full data URL, use it directly
    if (base64Data.startsWith("data:audio")) return base64Data;
    return `data:${format};base64,${base64Data}`;
  }, [base64Data, format]);

  if (!audioSrc) return null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border bg-muted/20 p-3">
      {/* ── Header row ── */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Volume2 className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Audio output</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {format.replace("audio/", "")}
          </p>
        </div>

        {/* "Now playing" badge — only visible while audio is playing */}
        {isPlaying && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {/* Simple animated bars to indicate playback */}
            <span className="flex items-end gap-px h-3">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-sm bg-primary animate-bounce"
                  style={{
                    height: `${[60, 100, 75][i - 1]}%`,
                    animationDelay: `${(i - 1) * 0.15}s`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </span>
            Playing
          </span>
        )}
      </div>

      {/* ── Native audio player ── */}
      <audio
        ref={audioRef}
        controls
        src={audioSrc}
        // Auto-play: user just executed a TTS request and expects to hear output
        // autoPlay
        className="h-10 w-full rounded"
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* ── Download shortcut ── */}
      {/* <a
        href={audioSrc}
        download={`tts-output.${format.split("/")[1] ?? "mp3"}`}
        className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors"
      >
        Download audio
      </a> */}
    </div>
  );
};

export default AIAudioPlayer;
