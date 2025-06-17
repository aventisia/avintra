import { useEffect, useRef, useState } from "react";
import {
  ReactMediaRecorder,
  ReactMediaRecorderRenderProps,
} from "react-media-recorder";

// Interface for VideoPreview props
interface VideoPreviewProps {
  stream: MediaStream | null;
}

// VideoPreview component
const VideoPreview = ({ stream }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full max-w-[32rem] rounded shadow-sm mb-4 video-element"
    />
  );
};

// Webcam component with mode toggle
export const MediaRecorder = () => {
  const [mode, setMode] = useState<"audio" | "video" | "both">("both");

  const audioProp = mode === "audio" || mode === "both";
  const videoProp = mode === "video" || mode === "both";

  return <>Audio/Video Media Recorder</>;

  return (
    <ReactMediaRecorder
      video={videoProp}
      audio={audioProp}
      askPermissionOnMount
      render={({
        // status,
        // startRecording,
        // stopRecording,
        // mediaBlobUrl,
        previewStream,
        // muteAudio,
        // unMuteAudio,
        // isAudioMuted,
        error,
      }: ReactMediaRecorderRenderProps) => (
        <div className="flex flex-col items-center">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {videoProp && <VideoPreview stream={previewStream} />}
        </div>
      )}
    />
  );

  return (
    <div className="flex flex-col items-center p-4">
      {/* Mode selection dropdown */}
      <div className="mb-4">
        <label className="mr-2">Recording Mode:</label>
        <select
          value={mode}
          onChange={(e) =>
            setMode(e.target.value as "audio" | "video" | "both")
          }
          className="p-2 rounded border border-gray-300"
        >
          <option value="audio">Audio Only</option>
          <option value="video">Video Only</option>
          <option value="both">Audio + Video</option>
        </select>
      </div>

      <ReactMediaRecorder
        video={videoProp}
        audio={audioProp}
        askPermissionOnMount
        render={({
          status,
          startRecording,
          stopRecording,
          mediaBlobUrl,
          previewStream,
          muteAudio,
          unMuteAudio,
          isAudioMuted,
          error,
        }: ReactMediaRecorderRenderProps) => (
          <div className="flex flex-col items-center">
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {videoProp && <VideoPreview stream={previewStream} />}

            <p className="mb-4">Status: {status}</p>

            <div className="flex gap-4 mb-4">
              <button
                onClick={startRecording}
                disabled={status === "recording"}
                className={`px-4 py-2 rounded text-white border-none ${
                  status === "recording"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 cursor-pointer"
                }`}
              >
                Start Recording
              </button>

              <button
                onClick={stopRecording}
                disabled={status !== "recording"}
                className={`px-4 py-2 rounded text-white border-none ${
                  status !== "recording"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 cursor-pointer"
                }`}
              >
                Stop Recording
              </button>

              {audioProp && (
                <button
                  onClick={isAudioMuted ? unMuteAudio : muteAudio}
                  className="px-4 py-2 rounded text-white border-none bg-blue-500 cursor-pointer"
                >
                  {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
                </button>
              )}
            </div>

            {mediaBlobUrl &&
              (mode === "audio" ? (
                <audio
                  src={mediaBlobUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full max-w-[32rem] mb-4"
                />
              ) : (
                <video
                  src={mediaBlobUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full max-w-[32rem] rounded shadow-sm"
                />
              ))}
          </div>
        )}
      />
    </div>
  );
};
