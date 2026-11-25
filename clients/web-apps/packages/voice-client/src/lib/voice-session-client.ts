import { type AudioCaptureOptions, type RemoteTrack, Room, RoomEvent, Track } from "livekit-client";

import type {
  VoiceCallSnapshot,
  VoiceCaptionTurn,
  VoiceSessionRequest,
  VoiceSessionResponse,
} from "../types/voice-session.type";
import { captureOptionsFor } from "./voice-capture.util";
import { applyVoiceEvent, parseVoiceEvent } from "./voice-events";

const TIMER_INTERVAL_MS = 500;

// IMPORTANT NOTE: a worker that never joins leaves the caller in `connecting`
// with no feedback, so the client gives up on its own.
const SESSION_START_TIMEOUT_MS = 45_000;

// IMPORTANT NOTE: a half-open signaling socket can keep `disconnect()` waiting;
// the next call must not be blocked by a teardown that will never finish.
const ROOM_LEAVE_TIMEOUT_MS = 5_000;

// IMPORTANT NOTE: the browser can still play buffered agent audio after the worker reports `listening`.
const MIC_RESUME_DELAY_MS = 300;

const ignoreRejections = (promise: Promise<unknown>): Promise<void> =>
  promise.then(
    () => undefined,
    () => undefined,
  );

const withTimeout = async (promise: Promise<void>, timeoutMs: number): Promise<void> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  try {
    await Promise.race([promise, timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
};

export const toErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (error.message) return error.message;
  }
  return fallback;
};

export const createVoiceCallSnapshot = (): VoiceCallSnapshot => ({
  state: "idle",
  isActive: false,
  turns: [],
  callMs: 0,
  isMuted: false,
  error: null,
  conversationId: null,
  needsAudioResume: false,
});

const stampTurnTimes = (turns: VoiceCaptionTurn[]): VoiceCaptionTurn[] => {
  if (turns.every((turn) => turn.createdAt)) return turns;
  const now = new Date().toISOString();
  return turns.map((turn) => (turn.createdAt ? turn : { ...turn, createdAt: now }));
};

export type VoiceSessionClientOptions = {
  prepare?: () => Promise<void>;
  createSession: (
    request: VoiceSessionRequest,
    signal: AbortSignal,
  ) => Promise<VoiceSessionResponse>;
  onSnapshot: (snapshot: VoiceCallSnapshot) => void;
};

/**
 * Headless browser client for one voice session: joins the room, plays remote
 * audio, and turns worker events into snapshots. The host app supplies the
 * authenticated session bootstrap.
 */
export class VoiceSessionClient {
  private _snapshot = createVoiceCallSnapshot();
  private _room: Room | null = null;
  private _audioTracks = new Set<RemoteTrack>();
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _micResumeTimer: ReturnType<typeof setTimeout> | null = null;
  private _micGated = false;
  private _generation = 0;
  private _sessionAbort: AbortController | null = null;
  private _startedAt = 0;
  private _workerStarted = false;
  private _captureOptions: AudioCaptureOptions = captureOptionsFor("none");
  private _disposed = false;
  private readonly _prepare: VoiceSessionClientOptions["prepare"];
  private readonly _createSession: VoiceSessionClientOptions["createSession"];
  private readonly _onSnapshot: VoiceSessionClientOptions["onSnapshot"];

  constructor(options: VoiceSessionClientOptions) {
    this._prepare = options.prepare;
    this._createSession = options.createSession;
    this._onSnapshot = options.onSnapshot;
  }

  async start(request: VoiceSessionRequest): Promise<void> {
    if (this._disposed) return;

    const generation = ++this._generation;
    this._abortSession();
    await this._releaseRoom();
    if (generation !== this._generation) return;

    this._workerStarted = false;
    this._setSnapshot(createVoiceCallSnapshot());

    try {
      await this._prepare?.();
    } catch (error) {
      if (generation === this._generation) this._fail(error);
      return;
    }

    if (generation !== this._generation) return;

    // IMPORTANT NOTE: the call clock starts with the connecting phase, so the
    // timer the caller sees always matches the wait, and never covers the save.
    this._startedAt = Date.now();
    this._startTimer();
    this._setSnapshot({ ...createVoiceCallSnapshot(), state: "connecting", isActive: true });

    const abort = new AbortController();
    this._sessionAbort = abort;

    let session: VoiceSessionResponse;
    try {
      session = await this._createSession(request, abort.signal);
    } catch (error) {
      this._clearSessionAbort(abort);
      if (generation === this._generation) this._fail(error);
      return;
    }

    this._clearSessionAbort(abort);
    if (generation !== this._generation) return;
    if (!session.serverUrl || !session.clientToken || !session.conversationId) {
      this._fail(new Error("The voice session response is missing its room details."));
      return;
    }

    this._update({ conversationId: session.conversationId });
    this._captureOptions = captureOptionsFor(session.noiseCancellation ?? "none");

    const room = new Room();
    this._room = room;
    this._bindRoom(room);

    try {
      await room.connect(session.serverUrl, session.clientToken);
    } catch (error) {
      if (this._room === room) this._room = null;
      await this._disconnectRoom(room);
      if (generation === this._generation) this._fail(error);
      return;
    }

    if (generation !== this._generation) {
      if (this._room === room) this._room = null;
      await this._disconnectRoom(room);
      return;
    }

    this._attachExistingAudio(room);
    this._update({ needsAudioResume: !room.canPlaybackAudio });

    try {
      await room.localParticipant.setMicrophoneEnabled(true, this._captureOptions);
    } catch {
      if (generation === this._generation) {
        this._fail(
          new Error(
            "Microphone access is required for a call. Allow the microphone and try again.",
          ),
        );
        await this._releaseRoom();
      } else {
        await this._disconnectRoom(room);
      }
      return;
    }

    if (generation !== this._generation) {
      if (this._room === room) this._room = null;
      await this._disconnectRoom(room);
      return;
    }

    this._syncSpeechGate();
  }

  async end(): Promise<void> {
    if (this._disposed) return;
    ++this._generation;
    this._abortSession();
    // IMPORTANT NOTE: publish the terminal state before teardown so a slow leave
    // round-trip cannot leave the caller on a live-looking call screen.
    this._setSnapshot({
      ...this._snapshot,
      state: "ended",
      isActive: false,
      isMuted: false,
      needsAudioResume: false,
    });
    await this._releaseRoom();
  }

  async toggleMute(): Promise<void> {
    if (!this._room) return;

    const isMuted = !this._snapshot.isMuted;
    this._update({ isMuted });
    this._clearMicResumeTimer();

    if (isMuted) {
      this._micGated = false;
      await this._setMicEnabled(false);
      return;
    }

    if (this._snapshot.state === "speaking") {
      this._micGated = true;
      return;
    }

    this._micGated = false;
    await this._setMicEnabled(true);
  }

  async resumeAudio(): Promise<void> {
    const room = this._room;
    if (!room) return;

    await room.startAudio();
    this._update({ needsAudioResume: !room.canPlaybackAudio });
  }

  async dispose(): Promise<void> {
    if (this._disposed) return;
    this._disposed = true;
    ++this._generation;
    this._abortSession();
    await this._releaseRoom();
  }

  private _bindRoom(room: Room): void {
    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (this._room === room) this._attachAudio(track);
    });
    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      if (this._room === room) this._detachAudio(track);
    });
    room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
      if (this._room === room) this._handleData(payload, topic);
    });
    room.on(RoomEvent.Disconnected, () => {
      if (this._room === room) this._handleDisconnected();
    });
    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      if (this._room !== room) return;
      this._update({ needsAudioResume: this._snapshot.isActive && !room.canPlaybackAudio });
    });
  }

  private _handleData(payload: Uint8Array, topic?: string): void {
    const event = parseVoiceEvent(payload, topic);
    if (!event) return;

    this._workerStarted = true;
    this._setSnapshot(applyVoiceEvent(this._snapshot, event));
    if (event.type !== "session.closed") return;

    // IMPORTANT NOTE: a worker close can race the microphone publish, so cancel
    // the starting generation; otherwise the late publish leaves a live track.
    ++this._generation;
    this._abortSession();
    void this._releaseRoom();
  }

  private _handleDisconnected(): void {
    const wasActive = this._snapshot.isActive;
    ++this._generation;
    this._abortSession();
    void this._releaseRoom();
    if (!wasActive) return;

    this._setSnapshot({
      ...this._snapshot,
      state: "error",
      isActive: false,
      needsAudioResume: false,
      error: {
        code: "disconnected",
        message: "The call disconnected unexpectedly.",
        retryable: true,
      },
    });
  }

  private _attachExistingAudio(room: Room): void {
    for (const participant of room.remoteParticipants.values()) {
      for (const publication of participant.trackPublications.values()) {
        if (publication.track) this._attachAudio(publication.track);
      }
    }
  }

  private _attachAudio(track: RemoteTrack): void {
    if (track.kind !== Track.Kind.Audio || this._audioTracks.has(track)) return;
    if (typeof document === "undefined") return;

    const element = track.attach();
    element.autoplay = true;
    element.style.display = "none";
    document.body.appendChild(element);
    this._audioTracks.add(track);
  }

  private _detachAudio(track: RemoteTrack): void {
    if (!this._audioTracks.delete(track)) return;
    track.detach().forEach((element) => element.remove());
  }

  private _detachAudioTracks(): void {
    for (const track of this._audioTracks.values()) {
      track.detach().forEach((element) => element.remove());
    }
    this._audioTracks.clear();
  }

  private async _releaseRoom(): Promise<void> {
    const room = this._room;
    this._room = null;
    this._stopTimer();
    this._clearMicResumeTimer();
    this._micGated = false;
    this._detachAudioTracks();

    if (!room) return;

    await this._disconnectRoom(room);
  }

  private async _disconnectRoom(room: Room): Promise<void> {
    // IMPORTANT NOTE: `disconnect()` waits for the leave round-trip before it
    // stops capture, so stop the microphone first; a dead socket must not keep
    // the caller audible or the next call blocked.
    room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track?.stop();
    await withTimeout(ignoreRejections(room.disconnect()), ROOM_LEAVE_TIMEOUT_MS);
  }

  private _abortSession(): void {
    this._sessionAbort?.abort();
    this._sessionAbort = null;
  }

  private _clearSessionAbort(abort: AbortController): void {
    if (this._sessionAbort === abort) this._sessionAbort = null;
  }

  private _startTimer(): void {
    this._stopTimer();
    this._timer = setInterval(() => {
      if (!this._snapshot.isActive) return;

      const elapsed = Date.now() - this._startedAt;
      this._update({ callMs: elapsed });

      if (
        !this._workerStarted &&
        this._snapshot.state === "connecting" &&
        elapsed >= SESSION_START_TIMEOUT_MS
      ) {
        ++this._generation;
        this._abortSession();
        this._fail(new Error("The voice session did not start."));
        void this._releaseRoom();
      }
    }, TIMER_INTERVAL_MS);
  }

  private _stopTimer(): void {
    if (this._timer === null) return;
    clearInterval(this._timer);
    this._timer = null;
  }

  private _fail(error: unknown): void {
    this._stopTimer();
    this._setSnapshot({
      ...this._snapshot,
      state: "error",
      isActive: false,
      needsAudioResume: false,
      error: {
        code: "session_failed",
        message: toErrorMessage(error, "The voice call could not be started."),
        retryable: true,
      },
    });
  }

  private _update(patch: Partial<VoiceCallSnapshot>): void {
    this._setSnapshot({ ...this._snapshot, ...patch });
  }

  private _setSnapshot(snapshot: VoiceCallSnapshot): void {
    const previousState = this._snapshot.state;
    const turns = stampTurnTimes(snapshot.turns);
    this._snapshot = turns === snapshot.turns ? snapshot : { ...snapshot, turns };
    if (!this._disposed) this._onSnapshot(this._snapshot);
    if (previousState !== this._snapshot.state) this._syncSpeechGate();
  }

  private _syncSpeechGate(): void {
    this._clearMicResumeTimer();

    if (this._snapshot.state === "speaking") {
      if (this._micGated || !this._snapshot.isActive || this._snapshot.isMuted) return;
      const room = this._room;
      if (!room || !room.localParticipant.isMicrophoneEnabled) return;
      this._micGated = true;
      void ignoreRejections(this._setMicEnabled(false));
      return;
    }

    if (!this._micGated) return;

    if (!this._snapshot.isActive || this._snapshot.isMuted) {
      this._micGated = false;
      return;
    }

    this._micResumeTimer = setTimeout(() => {
      this._micResumeTimer = null;
      this._micGated = false;
      void ignoreRejections(this._setMicEnabled(true));
    }, MIC_RESUME_DELAY_MS);
  }

  private async _setMicEnabled(enabled: boolean): Promise<void> {
    const room = this._room;
    if (!room || room.localParticipant.isMicrophoneEnabled === enabled) return;
    await room.localParticipant.setMicrophoneEnabled(enabled, this._captureOptions);
  }

  private _clearMicResumeTimer(): void {
    if (this._micResumeTimer === null) return;
    clearTimeout(this._micResumeTimer);
    this._micResumeTimer = null;
  }
}
