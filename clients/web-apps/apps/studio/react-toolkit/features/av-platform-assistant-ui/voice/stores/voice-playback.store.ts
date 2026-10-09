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

const collectActiveKeys = (): string[] => {
  const keys = new Set<string>();
  if (current) keys.add(current.key);
  queue.forEach((clip) => keys.add(clip.key));
  return [...keys];
};

type VoicePlaybackState = {
  /** Whether streamed replies are spoken aloud (persisted). */
  speakReplies: boolean;
  /** Whether the player is actively producing audio. */
  isPlaying: boolean;
  /** Keys with a clip currently playing or waiting in the queue. */
  activeKeys: string[];
  /** Keys with an in-flight Text-to-Speech request. */
  synthesizingKeys: string[];
  /** Per-message clip cache so replays skip synthesis. */
  clipCache: Record<string, VoiceAudioClip[]>;

  setSpeakReplies: (value: boolean) => void;
  /** Marks a key as synthesizing (or done) for the per-message Stop control. */
  markSynthesizing: (key: string, value: boolean) => void;
  /** Appends clips to the FIFO queue; playback starts when idle. */
  enqueue: (key: string, clips: VoiceAudioClip[]) => void;
  /** Stops playback and drops the queue without aborting the run. */
  stop: () => void;
  /** Stops playback and clears all synthesis bookkeeping (used on teardown). */
  reset: () => void;
  /** Stops and drops only `key`'s clips, leaving other keys playing. */
  stopKey: (key: string) => void;
  cacheClips: (key: string, clips: VoiceAudioClip[]) => void;
  getCachedClips: (key: string) => VoiceAudioClip[] | undefined;
};

export const useVoicePlaybackStore = create<VoicePlaybackState>((set, get) => {
  const playNext = (): void => {
    if (queue.length === 0) {
      current = null;
      set({ isPlaying: false, activeKeys: [] });
      return;
    }

    const next = queue.shift() as QueuedClip;
    current = next;
    set({ isPlaying: true, activeKeys: collectActiveKeys() });

    const element = getAudioElement(playNext);
    element.src = resolveClipUrl(next);
    element.play().catch(() => {
      // IMPORTANT NOTE: browsers block autoplay without a prior user gesture; drop the
      // clip and advance instead of wedging the queue behind audio that cannot start.
      releaseClipUrl(next);
      current = null;
      set({ isPlaying: false, activeKeys: collectActiveKeys() });
      playNext();
    });
  };

  return {
    speakReplies: readSpeakRepliesPreference(),
    isPlaying: false,
    activeKeys: [],
    synthesizingKeys: [],
    clipCache: {},

    setSpeakReplies: (value) => {
      writeSpeakRepliesPreference(value);
      set({ speakReplies: value });
      if (!value) get().stop();
    },

    markSynthesizing: (key, value) =>
      set((state) => ({
        synthesizingKeys: value
          ? state.synthesizingKeys.includes(key)
            ? state.synthesizingKeys
            : [...state.synthesizingKeys, key]
          : state.synthesizingKeys.filter((existing) => existing !== key),
      })),

    enqueue: (key, clips) => {
      if (clips.length === 0) return;
      // IMPORTANT NOTE: a live synthesis task can resolve just after a mute, so live
      // clips must never (re)start playback unless replies are still unmuted.
      if (key === LIVE_SPEECH_KEY && !get().speakReplies) return;
      queue.push(...clips.map((clip) => ({ ...clip, key })));
      set({ activeKeys: collectActiveKeys() });
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
      set({ isPlaying: false, activeKeys: [] });
    },

    reset: () => {
      get().stop();
      set({ synthesizingKeys: [] });
    },

    stopKey: (key) => {
      const removed = queue.filter((clip) => clip.key === key);
      queue = queue.filter((clip) => clip.key !== key);

      if (current && current.key === key) {
        removed.push(current);
        current = null;
        if (audioElement) {
          audioElement.pause();
          audioElement.removeAttribute("src");
          audioElement.load();
        }
      }
      removed.forEach(releaseClipUrl);

      if (current === null && queue.length === 0) {
        set({ isPlaying: false, activeKeys: [] });
        return;
      }
      if (current === null) {
        playNext();
        return;
      }
      set({ activeKeys: collectActiveKeys() });
    },

    cacheClips: (key, clips) => {
      if (clips.length === 0) return;
      set((state) => ({ clipCache: { ...state.clipCache, [key]: clips } }));
    },

    getCachedClips: (key) => get().clipCache[key],
  };
});
