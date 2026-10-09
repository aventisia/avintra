import { create } from "zustand";

/** MIME type assumed for synthesized clips without an explicit data URL. */
const DEFAULT_AUDIO_MIME_TYPE = "audio/mpeg";

/** localStorage key for the opt-in "Speak replies" preference. */
const SPEAK_REPLIES_STORAGE_KEY = "studio.chatAgent.speakReplies";

/** Playback key reserved for the live reply stream (never a persisted message). */
export const LIVE_SPEECH_KEY = "live";

/** A single synthesized audio clip ready for playback. */
export type VoiceAudioClip = {
  /** Stable id, used to cache the resolved object URL. */
  id: string;
  /** Raw base64 payload, or a full data/blob/http URL. */
  audio: string;
  /** MIME type used to decode raw base64 into a Blob. */
  mimeType: string;
};

/** A queued clip tagged with the message/stream it belongs to. */
type QueuedClip = VoiceAudioClip & { key: string };

/** Reads the persisted "Speak replies" preference (off by default). */
const readSpeakRepliesPreference = (): boolean => {
  try {
    return localStorage.getItem(SPEAK_REPLIES_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

/** Persists the "Speak replies" preference; storage failures are ignored. */
const writeSpeakRepliesPreference = (value: boolean): void => {
  try {
    localStorage.setItem(SPEAK_REPLIES_STORAGE_KEY, String(value));
  } catch {
    // Private mode / storage disabled: the toggle still works in memory.
  }
};

// ─── Module-level player state ───────────────────────────────────────────────
// Kept outside the store so audio element lifecycle never triggers re-renders.
let audioElement: HTMLAudioElement | null = null;
let queue: QueuedClip[] = [];
let current: QueuedClip | null = null;
const resolvedUrls = new Map<string, string>();

/** Lazily creates the single audio element shared by every clip. */
const getAudioElement = (onEnded: () => void): HTMLAudioElement => {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.addEventListener("ended", onEnded);
  }
  return audioElement;
};

/**
 * Resolves a clip to a playable URL. Data/blob/http payloads pass through;
 * raw base64 is wrapped in a Blob so the audio element can stream it.
 */
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

/** Releases every cached object URL (non-blob payloads are skipped). */
const releaseResolvedUrls = (): void => {
  resolvedUrls.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
  resolvedUrls.clear();
};

/** Revokes and forgets the object URL for a single clip. */
const releaseClipUrl = (clip: VoiceAudioClip): void => {
  const url = resolvedUrls.get(clip.id);
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  resolvedUrls.delete(clip.id);
};

/** Collects the keys that currently own a clip (playing or queued). */
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
  /** Whether a Text-to-Speech request is currently in flight. */
  isSynthesizing: boolean;
  /** Playback key of the clip currently playing (null when idle). */
  activeKey: string | null;
  /** Clips waiting behind the one currently playing. */
  queueSize: number;
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
  /** Advances to the next queued clip, settling to idle when drained. */
  const playNext = (): void => {
    if (queue.length === 0) {
      current = null;
      set({ isPlaying: false, activeKey: null, queueSize: 0, activeKeys: [] });
      return;
    }

    const next = queue.shift() as QueuedClip;
    current = next;
    set({
      isPlaying: true,
      activeKey: next.key,
      queueSize: queue.length,
      activeKeys: collectActiveKeys(),
    });

    const element = getAudioElement(playNext);
    element.src = resolveClipUrl(next);
    element.play().catch(() => {
      // Autoplay may be blocked without a prior user gesture.
      set({ isPlaying: false });
    });
  };

  return {
    speakReplies: readSpeakRepliesPreference(),
    isPlaying: false,
    isSynthesizing: false,
    activeKey: null,
    queueSize: 0,
    activeKeys: [],
    synthesizingKeys: [],
    clipCache: {},

    setSpeakReplies: (value) => {
      writeSpeakRepliesPreference(value);
      set({ speakReplies: value });
      // Disabling is a mute, not an abort: stop audio but leave the run alone.
      if (!value) get().stop();
    },

    markSynthesizing: (key, value) =>
      set((state) => {
        const synthesizingKeys = value
          ? state.synthesizingKeys.includes(key)
            ? state.synthesizingKeys
            : [...state.synthesizingKeys, key]
          : state.synthesizingKeys.filter((existing) => existing !== key);
        return { synthesizingKeys, isSynthesizing: synthesizingKeys.length > 0 };
      }),

    enqueue: (key, clips) => {
      if (clips.length === 0) return;
      // Live replies must never (re)start playback while muted; a synthesis
      // task that resolves just after a mute would otherwise resume the audio.
      // Other keys are explicit per-message playback and stay allowed.
      if (key === LIVE_SPEECH_KEY && !get().speakReplies) return;
      queue.push(...clips.map((clip) => ({ ...clip, key })));
      set({ queueSize: queue.length, activeKeys: collectActiveKeys() });
      // Only auto-start when idle; a paused player waits for an explicit resume.
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
      set({ isPlaying: false, activeKey: null, queueSize: 0, activeKeys: [] });
    },

    reset: () => {
      get().stop();
      set({ isSynthesizing: false, synthesizingKeys: [] });
    },

    stopKey: (key) => {
      const removed = queue.filter((clip) => clip.key === key);
      queue = queue.filter((clip) => clip.key !== key);

      // If the stopped key owns the audio element, halt it and release its URLs.
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

      // Nothing was playing for this key: just resync the derived state.
      if (current === null && queue.length === 0) {
        set({ isPlaying: false, activeKey: null, queueSize: 0, activeKeys: [] });
        return;
      }
      // Continue with whatever other keys still have clips queued.
      if (current === null) {
        playNext();
        return;
      }
      set({ queueSize: queue.length, activeKeys: collectActiveKeys() });
    },

    cacheClips: (key, clips) => {
      if (clips.length === 0) return;
      set((state) => ({ clipCache: { ...state.clipCache, [key]: clips } }));
    },

    getCachedClips: (key) => get().clipCache[key],
  };
});
