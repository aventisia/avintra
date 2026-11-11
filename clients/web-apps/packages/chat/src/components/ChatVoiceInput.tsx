import { useAui } from "@assistant-ui/react";
import { toast } from "@avplatform/ui/sonner";
import { CircleNotchIcon, MicrophoneIcon, StopIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { ChatIconButton } from "./ChatIconButton";

// IMPORTANT NOTE: the recording is sent base64-encoded, so it stops at five minutes to stay within the nginx body limit.
const MAX_RECORDING_SECONDS = 300;

const RECORDER_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

const isRecordingSupported = () =>
  typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

const formatSeconds = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

type ChatVoiceInputProps = {
  /** Turns a recording into text; an empty result means no speech was heard. */
  transcribe: (audio: Blob) => Promise<string>;
};

/** Microphone button for the composer: records, transcribes and adds the text to the message. */
export const ChatVoiceInput = ({ transcribe }: ChatVoiceInputProps) => {
  const aui = useAui();
  const [status, setStatus] = useState<"idle" | "recording" | "transcribing">("idle");
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const isMountedRef = useRef(true);
  const transcribeRef = useRef(transcribe);
  transcribeRef.current = transcribe;

  const addTranscript = async (audio: Blob) => {
    setStatus("transcribing");
    try {
      const text = (await transcribeRef.current(audio)).trim();
      if (!isMountedRef.current) return;
      if (!text) {
        toast.error("No speech was detected.");
        return;
      }
      const current = aui.composer.getState().text.trimEnd();
      aui.composer.setText(current ? `${current} ${text}` : text);
    } catch {
      toast.error("Couldn't transcribe the recording.");
    } finally {
      if (isMountedRef.current) setStatus("idle");
    }
  };

  const start = async () => {
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = RECORDER_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        if (!isMountedRef.current) return;
        const audio = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (audio.size > 0) void addTranscript(audio);
        else setStatus("idle");
      };
      if (!isMountedRef.current) throw new Error("Unmounted");
      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setStatus("recording");
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      if (isMountedRef.current) toast.error("Microphone access was denied or unavailable.");
    }
  };

  const stop = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  useEffect(() => {
    if (status !== "recording") return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(elapsed);
      if (elapsed >= MAX_RECORDING_SECONDS) stop();
    }, 400);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, []);

  if (!isRecordingSupported()) return null;

  if (status === "recording")
    return (
      <ChatIconButton
        label="Stop recording"
        onClick={stop}
        className="w-auto gap-1.5 rounded-full bg-bad/10 px-3 text-bad hover:bg-bad/15 hover:text-bad"
      >
        <StopIcon weight="fill" />
        <span className="text-xs tabular-nums">{formatSeconds(seconds)}</span>
      </ChatIconButton>
    );

  return (
    <ChatIconButton
      label={status === "transcribing" ? "Transcribing…" : "Dictate"}
      disabled={status === "transcribing"}
      onClick={() => void start()}
      className="size-9 rounded-full"
    >
      {status === "transcribing" ? (
        <CircleNotchIcon className="animate-spin" />
      ) : (
        <MicrophoneIcon />
      )}
    </ChatIconButton>
  );
};
