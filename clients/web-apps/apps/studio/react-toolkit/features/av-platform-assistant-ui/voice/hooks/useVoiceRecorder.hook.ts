import { toast } from "@avplatform/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";

import { STTRequestDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { fileToDataUrl } from "@/features/dynamic-config-panel/utils/file-to-data-url";
import { ModelConfigType } from "@/types/model-config-type";

import { transcribeSpeechToText } from "../apis/voice-apis";
import { resolveMissingSpeechConfigReason } from "../utils/voice-controls.util";

const PREFERRED_RECORDER_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

const MAX_RECORDING_SECONDS = 300;

const resolveRecorderMimeType = (): string | undefined => {
  if (typeof MediaRecorder === "undefined") return undefined;
  return PREFERRED_RECORDER_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
};

type UseVoiceRecorderParams = {
  sttConfig: ModelConfigType | null;
  refId: string;
  refName: string;
  agentName?: string | null;
  language?: string | null;
  onTranscript: (text: string) => void;
};

/**
 * Records microphone audio with MediaRecorder, transcribes it through the
 * llmpipeline STT endpoint, and hands the transcript back to the caller.
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
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isMountedRef = useRef(true);

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
        const dataUrl = await fileToDataUrl(blob);
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

  const transcribeRef = useRef(transcribe);
  transcribeRef.current = transcribe;

  const startRecording = useCallback(async () => {
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
      // IMPORTANT NOTE: getUserMedia can resolve before the recorder fails to construct
      // or start; stop the acquired tracks so the microphone does not stay live.
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      console.error("Microphone access failed:", error);
      toast.error("Microphone access was denied or unavailable.");
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  // IMPORTANT NOTE: 400 ms keeps the displayed seconds boundary close without
  // re-rendering every frame; recording stops at MAX_RECORDING_SECONDS so the base64
  // request payload stays within the nginx body limit.
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const startedAt = Date.now();
    setRecordingSeconds(0);
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRecordingSeconds(elapsed);
      if (elapsed >= MAX_RECORDING_SECONDS) stopRecording();
    }, 400);
    return () => window.clearInterval(interval);
  }, [isRecording, stopRecording]);

  const disabledReason = !isSupported
    ? "Microphone recording is not supported in this browser."
    : (resolveMissingSpeechConfigReason(sttConfig, "recording") ??
      (isTranscribing ? "Transcribing your recording\u2026" : null));

  const isMicDisabled = disabledReason !== null;
  const micTooltip = isMicDisabled
    ? disabledReason
    : isRecording
      ? "Stop recording"
      : "Start voice recording";

  const toggleRecording = useCallback(() => {
    if (isMicDisabled) return;
    if (isRecording) stopRecording();
    else void startRecording();
  }, [isMicDisabled, isRecording, startRecording, stopRecording]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
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
