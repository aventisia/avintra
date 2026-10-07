import { toast } from "@avplatform/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";

import { STTRequestDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { ModelConfigType } from "@/types/model-config-type";

import { transcribeSpeechToText } from "../apis/voice-apis";

/** Preferred recorder MIME types, in priority order. */
const PREFERRED_RECORDER_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

/** Returns the first recorder MIME type the current browser supports. */
const resolveRecorderMimeType = (): string | undefined => {
  if (typeof MediaRecorder === "undefined") return undefined;
  return PREFERRED_RECORDER_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
};

/** Reads a Blob into a base64 data URL, as required by the STT request. */
const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read the recording."));
    reader.readAsDataURL(blob);
  });

type UseVoiceRecorderParams = {
  /** STT model config; recording is unavailable without it. */
  sttConfig: ModelConfigType | null;
  /** Envelope fields shared with the chat execution request. */
  refId: string;
  refName: string;
  agentName?: string | null;
  /** Language hint forwarded to the STT provider (BCP-47), if any. */
  language?: string | null;
  /** Receives the final transcript when transcription succeeds. */
  onTranscript: (text: string) => void;
};

/**
 * Records microphone audio with MediaRecorder, transcribes it through the
 * llmpipeline STT endpoint, and hands the transcript back to the caller.
 * Failures (permission denied, unsupported browser, STT error) are surfaced via
 * toast and leave the rest of the chat untouched.
 */
export const useVoiceRecorder = ({
  sttConfig,
  refId,
  refName,
  agentName,
  language,
  onTranscript,
}: UseVoiceRecorderParams) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  /** Elapsed recording time in whole seconds, shown next to the mic while recording. */
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isMountedRef = useRef(true);

  // Keep the latest transcript handler without re-creating the recorder.
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const isSupported =
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

  const transcribe = useCallback(
    async (blob: Blob) => {
      if (!sttConfig?.model) return;
      setIsTranscribing(true);
      try {
        const dataUrl = await blobToDataUrl(blob);
        const requestDto: STTRequestDto = {
          input: dataUrl,
          input_mode: "file",
          provider: sttConfig.provider,
          model: sttConfig.model,
          audio_format: blob.type || "audio/webm",
          language: language ?? null,
          stream: false,
          credential_name: sttConfig.credential_name || null,
          is_byok_enabled: sttConfig.is_byok_enabled ?? false,
          ref_type: "Agent",
          ref_id: refId,
          ref_name: refName,
          action: "AgentExecution",
          agent_name: agentName ?? null,
        };
        const response = await transcribeSpeechToText(requestDto);
        const transcript = response.output?.trim();
        if (transcript) onTranscriptRef.current(transcript);
        else toast.error(response.error ?? "No speech was detected.");
      } catch (error) {
        console.error("Speech transcription failed:", error);
        toast.error("Could not transcribe the recording.");
      } finally {
        if (isMountedRef.current) setIsTranscribing(false);
      }
    },
    [sttConfig, refId, refName, agentName, language],
  );

  // Keep the recorder's onstop handler pointing at the latest transcribe callback.
  const transcribeRef = useRef(transcribe);
  transcribeRef.current = transcribe;

  const startRecording = useCallback(async () => {
    if (!sttConfig?.model) {
      toast.error("Select a Speech to Text model first.");
      return;
    }
    if (sttConfig.is_byok_enabled && !sttConfig.credential_name?.trim()) {
      toast.error("Select a credential for Speech to Text first.");
      return;
    }
    if (!isSupported) {
      toast.error("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = resolveRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (!isMountedRef.current) return;

        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        chunksRef.current = [];
        if (blob.size > 0) void transcribeRef.current(blob);
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access failed:", error);
      toast.error("Microphone access was denied or unavailable.");
    }
  }, [isSupported, sttConfig]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  // Tick an elapsed-time counter while recording (400 ms keeps the seconds
  // boundary close without re-rendering every frame).
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const startedAt = Date.now();
    setRecordingSeconds(0);
    const interval = window.setInterval(() => {
      setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 400);
    return () => window.clearInterval(interval);
  }, [isRecording]);

  // Derive the mic control's tooltip and disabled state from the required
  // configuration: a model is always needed; a credential only when the agent
  // runs BYOK (the ChatAgent voice config does).
  const missingModel = !sttConfig?.model?.trim();
  const missingCredential =
    Boolean(sttConfig?.is_byok_enabled) && !sttConfig?.credential_name?.trim();

  const disabledReason = !isSupported
    ? "Microphone recording is not supported in this browser."
    : missingModel && missingCredential
      ? "Select a Speech to Text model and credential to start recording."
      : missingModel
        ? "Select a Speech to Text model to start recording."
        : missingCredential
          ? "Select a credential for Speech to Text to start recording."
          : isTranscribing
            ? "Transcribing your recording\u2026"
            : null;

  const isMicDisabled = disabledReason !== null;
  const micTooltip = isMicDisabled
    ? disabledReason
    : isRecording
      ? "Stop recording"
      : "Start voice recording";

  const toggleRecording = useCallback(() => {
    // Refuse while unconfigured or transcribing; the tooltip explains why.
    if (isMicDisabled) return;
    if (isRecording) stopRecording();
    else void startRecording();
  }, [isMicDisabled, isRecording, startRecording, stopRecording]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Release the mic and discard any in-flight recording on unmount.
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recorderRef.current = null;
      streamRef.current = null;
    };
  }, []);

  return {
    isSupported,
    isRecording,
    isTranscribing,
    recordingSeconds,
    isMicDisabled,
    micTooltip,
    toggleRecording,
  };
};
