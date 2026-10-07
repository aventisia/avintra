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
  /** Per-message clip cache so replays skip synthesis. */
  clipCache: Record<string, VoiceAudioClip[]>;

  setSpeakReplies: (value: boolean) => void;
  setSynthesizing: (value: boolean) => void;
  /** Appends clips to the FIFO queue; playback starts when idle. */
  enqueue: (key: string, clips: VoiceAudioClip[]) => void;
  /** Pauses/resumes `key` when it owns playback, otherwise enqueues it. */
  togglePauseResume: (key: string, clips: VoiceAudioClip[]) => void;
  pause: () => void;
  resume: () => void;
  /** Stops playback and drops the queue without aborting the run. */
  stop: () => void;
  cacheClips: (key: string, clips: VoiceAudioClip[]) => void;
  getCachedClips: (key: string) => VoiceAudioClip[] | undefined;
};

export const useVoicePlaybackStore = create<VoicePlaybackState>((set, get) => {
  /** Advances to the next queued clip, settling to idle when drained. */
  const playNext = (): void => {
    if (queue.length === 0) {
      current = null;
      set({ isPlaying: false, activeKey: null, queueSize: 0 });
      return;
    }

    const next = queue.shift() as QueuedClip;
    current = next;
    set({ isPlaying: true, activeKey: next.key, queueSize: queue.length });

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
    clipCache: {},

    setSpeakReplies: (value) => {
      writeSpeakRepliesPreference(value);
      set({ speakReplies: value });
      // Disabling is a mute, not an abort: stop audio but leave the run alone.
      if (!value) get().stop();
    },

    setSynthesizing: (value) => set({ isSynthesizing: value }),

    enqueue: (key, clips) => {
      if (clips.length === 0) return;
      queue.push(...clips.map((clip) => ({ ...clip, key })));
      set({ queueSize: queue.length });
      // Only auto-start when idle; a paused player waits for an explicit resume.
      if (current === null) playNext();
    },

    togglePauseResume: (key, clips) => {
      if (current && current.key === key) {
        if (get().isPlaying) get().pause();
        else get().resume();
        return;
      }
      get().enqueue(key, clips);
    },

    pause: () => {
      audioElement?.pause();
      set({ isPlaying: false });
    },

    resume: () => {
      if (!audioElement || !current) return;
      set({ isPlaying: true });
      audioElement.play().catch(() => set({ isPlaying: false }));
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
      set({ isPlaying: false, activeKey: null, queueSize: 0 });
    },

    cacheClips: (key, clips) => {
      if (clips.length === 0) return;
      set((state) => ({ clipCache: { ...state.clipCache, [key]: clips } }));
    },

    getCachedClips: (key) => get().clipCache[key],
  };
});
