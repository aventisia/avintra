import { create } from "zustand";

const DEFAULT_AUDIO_MIME_TYPE = "audio/mpeg";

const SPEAK_REPLIES_STORAGE_KEY = "studio.chatAgent.speakReplies";

export const LIVE_SPEECH_KEY = "live";

export type VoiceAudioClip = {
  /** Stable id, used to cache the resolved object URL. */
  id: string;
  /** Raw base64 payload, or a full data/blob/http URL. */
  audio: string;
  /** MIME type used to decode raw base64 into a Blob. */
  mimeType: string;
};

type QueuedClip = VoiceAudioClip & { key: string };

const readSpeakRepliesPreference = (): boolean => {
  try {
    return localStorage.getItem(SPEAK_REPLIES_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const writeSpeakRepliesPreference = (value: boolean): void => {
  try {
    localStorage.setItem(SPEAK_REPLIES_STORAGE_KEY, String(value));
  } catch {
    // IMPORTANT NOTE: private mode or disabled storage rejects writes; the toggle still works in memory.
  }
};

let audioElement: HTMLAudioElement | null = null;
let queue: QueuedClip[] = [];
let current: QueuedClip | null = null;
const resolvedUrls = new Map<string, string>();

const getAudioElement = (onEnded: () => void): HTMLAudioElement => {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.addEventListener("ended", onEnded);
  }
  return audioElement;
};

const resolveClipUrl = (clip: VoiceAudioClip): string => {
  const cached = resolvedUrls.get(clip.id);
  if (cached) return cached;

  const { audio } = clip;
  if (audio.startsWith("http") || audio.startsWith("data:") || audio.startsWith("blob:")) {
    resolvedUrls.set(clip.id, audio);
    return audio;
  }

  const base64 = audio.includes("base64,") ? audio.split("base64,")[1] : audio;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const url = URL.createObjectURL(
    new Blob([bytes], { type: clip.mimeType || DEFAULT_AUDIO_MIME_TYPE }),
  );
  resolvedUrls.set(clip.id, url);
  return url;
};

const releaseResolvedUrls = (): void => {
  resolvedUrls.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
  resolvedUrls.clear();
};

const releaseClipUrl = (clip: VoiceAudioClip): void => {
  const url = resolvedUrls.get(clip.id);
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  resolvedUrls.delete(clip.id);
};

type VoicePlaybackState = {
  /** Whether streamed replies are spoken aloud (persisted). */
  speakReplies: boolean;
  /** Whether the player is actively producing audio. */
  isPlaying: boolean;

  setSpeakReplies: (value: boolean) => void;
  /** Appends clips to the FIFO queue; playback starts when the player is idle. */
  enqueue: (key: string, clips: VoiceAudioClip[]) => void;
  /** Stops playback and drops the queue without aborting the run. */
  stop: () => void;
};

export const useVoicePlaybackStore = create<VoicePlaybackState>((set, get) => {
  const playNext = (): void => {
    if (queue.length === 0) {
      current = null;
      set({ isPlaying: false });
      return;
    }

    const next = queue.shift() as QueuedClip;
    current = next;
    set({ isPlaying: true });

    const element = getAudioElement(playNext);
    element.src = resolveClipUrl(next);
    element.play().catch(() => {
      // IMPORTANT NOTE: browsers block autoplay without a prior user gesture; drop the
      // clip and advance instead of wedging the queue behind audio that cannot start.
      releaseClipUrl(next);
      current = null;
      set({ isPlaying: false });
      playNext();
    });
  };

  return {
    speakReplies: readSpeakRepliesPreference(),
    isPlaying: false,

    setSpeakReplies: (value) => {
      writeSpeakRepliesPreference(value);
      set({ speakReplies: value });
      if (!value) get().stop();
    },

    enqueue: (key, clips) => {
      if (clips.length === 0) return;
      // IMPORTANT NOTE: a live synthesis task can resolve just after a mute, so live
      // clips must never (re)start playback unless replies are still unmuted.
      if (key === LIVE_SPEECH_KEY && !get().speakReplies) return;
      queue.push(...clips.map((clip) => ({ ...clip, key })));
      if (current === null) playNext();
    },

    stop: () => {
      queue = [];
      current = null;
      if (audioElement) {
        audioElement.pause();
        audioElement.removeAttribute("src");
        audioElement.load();
      }
      releaseResolvedUrls();
      set({ isPlaying: false });
    },
  };
});
