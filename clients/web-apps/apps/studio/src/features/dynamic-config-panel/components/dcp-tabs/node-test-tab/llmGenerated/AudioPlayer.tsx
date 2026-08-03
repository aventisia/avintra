import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { FileAudio, Pause, Play, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface AudioPlayerProps {
  src: File | string | null | undefined;
  title?: string;
  subtitle?: string;
  format?: string;
  autoPlay?: boolean;
  onRemove?: () => void;
  /**
   * When true, renders a single-line compact variant suitable for file lists.
   * All controls (icon, name, meta, play/pause, scrubber, time, remove) are
   * packed into one horizontal row instead of the default card layout.
   */
  compact?: boolean;
}

const AudioPlayer = ({
  src,
  title = "Generated Audio",
  subtitle,
  format = "audio/mpeg",
  autoPlay = false,
  onRemove,
  compact = false,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ─── 1. Source Processing (Base64, File, URL) ───────────────────────────
  useEffect(() => {
    if (!src) {
      setAudioUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    try {
      if (src instanceof File) {
        objectUrl = URL.createObjectURL(src);
        setAudioUrl(objectUrl);
        setError(null);
      } else if (typeof src === "string") {
        if (src.startsWith("http") || src.startsWith("blob:")) {
          setAudioUrl(src);
        } else {
          const cleanBase64 = src.includes("base64,") ? src.split("base64,")[1] : src;
          const byteCharacters = atob(cleanBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: format });
          objectUrl = URL.createObjectURL(blob);
          setAudioUrl(objectUrl);
        }
        setError(null);
      }
    } catch (err) {
      console.error("Failed to process audio source:", err);
      setError("Failed to load audio.");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, format]);

  // ─── 2. Audio Control Logic ──────────────────────────────────────────────
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setCurrentTime(current);
    setProgress((current / total) * 100 || 0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error)
    return <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>;
  if (!audioUrl) return null;

  const isFile = src instanceof File;

  // Shared hidden <audio> element — identical in both modes
  const audioElement = (
    <audio
      ref={audioRef}
      src={audioUrl}
      autoPlay={autoPlay}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnded={() => setIsPlaying(false)}
      className="hidden"
    />
  );

  // ─── Compact Mode: everything in one horizontal row ──────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
        {audioElement}

        {/* File-type icon */}
        <div className="shrink-0 text-primary">
          {isFile ? <FileAudio className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </div>

        {/* Name + size — takes flexible space before the controls */}
        <div className="flex min-w-0 w-40 flex-col leading-tight">
          <span className="truncate text-xs font-medium text-foreground">
            {isFile ? src.name : title}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {subtitle ??
              (isFile
                ? `${(src.size / 1024 / 1024).toFixed(2)} MB`
                : format.replace("audio/", "").toUpperCase())}
          </span>
        </div>

        {/* Play / Pause */}
        <button
          onClick={togglePlayPause}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3 fill-current" />
          ) : (
            <Play className="h-3 w-3 fill-current pl-px" />
          )}
        </button>

        {/* Scrubber track — flex-1 so it fills all remaining space */}
        <div
          className="group/compact-scrubber relative flex h-5 flex-1 cursor-pointer items-center"
          onClick={handleSeek}
        >
          <div className="absolute h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Thumb — appears on hover */}
          <div
            className="absolute h-2.5 w-2.5 -ml-1 rounded-full bg-primary shadow opacity-0 scale-50 transition-all group-hover/compact-scrubber:opacity-100 group-hover/compact-scrubber:scale-100"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Current / Total time */}
        <span className="shrink-0 font-mono text-[10px] leading-tight mt-0.5 text-muted-foreground">
          {formatTime(currentTime)}&thinsp;/&thinsp;{formatTime(duration)}
        </span>

        {/* Remove button */}
        {onRemove && (
          <Button onClick={onRemove} variant={"caution"} size={"icon7"} aria-label="Remove audio">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // ─── Full Mode: original card layout ────────────────────────────────────
  return (
    <div className="group relative flex w-full flex-col gap-4 rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md hover:bg-background/80">
      {audioElement}

      {/* Header: Icon, Title, and Remove Button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner">
            {isFile ? <FileAudio className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <p className="truncate text-sm font-semibold text-foreground">
              {isFile ? src.name : title}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {subtitle ??
                (isFile
                  ? `${(src.size / 1024 / 1024).toFixed(2)} MB`
                  : format.replace("audio/", ""))}
            </p>
          </div>
        </div>

        {onRemove && (
          <Button variant={"caution"} onClick={onRemove} size={"icon7"}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Controls: Play Button & Scrubber */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current pl-0.5" />
          )}
        </button>

        {/* Scrubber Area */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div
            className="group/scrubber relative flex h-6 cursor-pointer items-center"
            onClick={handleSeek}
          >
            <div className="absolute w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div
              className="absolute h-3 w-3 -ml-1.5 rounded-full bg-primary shadow opacity-0 scale-50 transition-all group-hover/scrubber:opacity-100 group-hover/scrubber:scale-100"
              style={{ left: `${progress}%` }}
            />
          </div>

          {/* Time & Equalizer */}
          <div className="flex items-center justify-between px-0.5 text-[11px] font-medium text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>

            {/* Animated Equalizer */}
            <div className="flex items-end gap-[2px] h-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-0.5 rounded-sm bg-primary/60 transition-all",
                    isPlaying ? "animate-pulse" : "h-[2px]",
                  )}
                  style={{
                    height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : "2px",
                    animationDuration: `${0.5 + i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
