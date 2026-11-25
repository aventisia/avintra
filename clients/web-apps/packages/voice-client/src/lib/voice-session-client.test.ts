import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { VoiceCallSnapshot, VoiceSessionResponse } from "../types/voice-session.type";
import { VoiceSessionClient } from "./voice-session-client";

const { FakeRoom, fakeRooms, connectControl } = vi.hoisted(() => {
  type Listener = (...args: unknown[]) => void;
  type FakeMicrophoneTrack = { stop: () => void };

  class FakeRoom {
    readonly listeners = new Map<string, Listener[]>();
    readonly remoteParticipants = new Map<string, unknown>();
    disconnected = false;
    readonly localParticipant = {
      isMicrophoneEnabled: false,
      microphoneTrack: null as FakeMicrophoneTrack | null,
      setMicrophoneEnabled: vi.fn(async (enabled: boolean) => {
        this.localParticipant.isMicrophoneEnabled = enabled;
        if (enabled && !this.localParticipant.microphoneTrack) {
          this.localParticipant.microphoneTrack = { stop: vi.fn() };
        }
      }),
      getTrackPublication: vi.fn((source: string) =>
        source === "microphone" && this.localParticipant.microphoneTrack
          ? { track: this.localParticipant.microphoneTrack }
          : undefined,
      ),
    };
    canPlaybackAudio = true;
    readonly connect = vi.fn(() => connectControl.promise ?? Promise.resolve());
    readonly disconnect = vi.fn(async () => {
      this.disconnected = true;
      this.localParticipant.isMicrophoneEnabled = false;
    });
    readonly startAudio = vi.fn(async () => undefined);

    on(event: string, listener: Listener): this {
      this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
      return this;
    }

    emit(event: string, ...args: unknown[]): void {
      for (const listener of this.listeners.get(event) ?? []) listener(...args);
    }
  }

  return {
    FakeRoom,
    fakeRooms: [] as FakeRoom[],
    connectControl: { promise: null as Promise<void> | null },
  };
});

vi.mock("livekit-client", () => ({
  Room: class extends FakeRoom {
    constructor() {
      super();
      fakeRooms.push(this);
    }
  },
  RoomEvent: {
    TrackSubscribed: "trackSubscribed",
    TrackUnsubscribed: "trackUnsubscribed",
    DataReceived: "dataReceived",
    Disconnected: "disconnected",
    AudioPlaybackStatusChanged: "audioPlaybackStatusChanged",
  },
  Track: { Kind: { Audio: "audio" }, Source: { Microphone: "microphone" } },
}));

const SESSION = {
  roomName: "room",
  serverUrl: "ws://localhost:7880",
  clientToken: "token",
  expiresIn: 60,
  conversationId: "conversation-1",
  agentName: "voice-agent",
  mode: "test",
  noiseCancellation: "auto",
} as const;

const RESUME_DELAY_MS = 300;
const START_TIMEOUT_MS = 45_000;
const ROOM_LEAVE_TIMEOUT_MS = 5_000;

const emitState = (room: (typeof fakeRooms)[number], state: string): void => {
  const event = new TextEncoder().encode(
    JSON.stringify({ type: "session.state", conversationId: SESSION.conversationId, state }),
  );
  room.emit("dataReceived", event, undefined, undefined, "avintra.voice");
};

const emitData = (room: (typeof fakeRooms)[number], payload: Record<string, unknown>): void => {
  const event = new TextEncoder().encode(
    JSON.stringify({ conversationId: SESSION.conversationId, ...payload }),
  );
  room.emit("dataReceived", event, undefined, undefined, "avintra.voice");
};

const startCall = async () => {
  const client = new VoiceSessionClient({
    createSession: async () => ({ ...SESSION }),
    onSnapshot: () => undefined,
  });
  await client.start({ flowVersionId: "version-1", mode: "test" });
  return { client, room: fakeRooms[0] };
};

beforeEach(() => {
  vi.useFakeTimers();
  fakeRooms.length = 0;
  connectControl.promise = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("VoiceSessionClient turn times", () => {
  it("stamps each turn when it first appears and keeps that time as it grows", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    const client = new VoiceSessionClient({
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });
    await client.start({ flowVersionId: "version-1", mode: "test" });
    const room = fakeRooms[0];

    emitData(room, { type: "transcript.interim", role: "user", text: "bo" });
    const interimTime = snapshots.at(-1)?.turns[0]?.createdAt;
    expect(interimTime && Date.parse(interimTime)).toBeTruthy();

    emitData(room, { type: "transcript.interim", role: "user", text: "book" });
    expect(snapshots.at(-1)?.turns[0]?.createdAt).toBe(interimTime);

    emitData(room, { type: "transcript.final", role: "user", text: "book" });
    expect(snapshots.at(-1)?.turns[0]?.createdAt).toBe(interimTime);

    emitData(room, { type: "tool.call", tool: { name: "search" }, turnId: 1 });
    expect(snapshots.at(-1)?.turns[1]?.createdAt).toBeTruthy();

    await client.end();
  });
});

describe("VoiceSessionClient call timer", () => {
  it("starts counting when connecting begins, after the draft save", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    let finishPrepare = () => {};
    const client = new VoiceSessionClient({
      prepare: () =>
        new Promise((resolve) => {
          finishPrepare = () => resolve();
        }),
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    const starting = client.start({ flowVersionId: "version-1", mode: "test" });
    await vi.advanceTimersByTimeAsync(5_000);
    expect(snapshots.at(-1)?.callMs).toBe(0);

    finishPrepare();
    await starting;
    await vi.advanceTimersByTimeAsync(5_000);
    expect(snapshots.at(-1)?.callMs).toBe(5_000);

    emitState(fakeRooms[0], "listening");
    await vi.advanceTimersByTimeAsync(1_000);
    expect(snapshots.at(-1)?.callMs).toBe(6_000);

    await client.end();
  });

  it("keeps the timer at zero when the call is rejected before it goes live", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    const client = new VoiceSessionClient({
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    await client.start({ flowVersionId: "version-1", mode: "test" });
    emitData(fakeRooms[0], { type: "session.closed", code: 4000 });
    await vi.advanceTimersByTimeAsync(2_000);

    expect(snapshots.at(-1)?.state).toBe("error");
    expect(snapshots.at(-1)?.callMs).toBe(0);

    await client.end();
  });
});

describe("VoiceSessionClient start timeout", () => {
  it("fails a call that never reaches the worker", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    const client = new VoiceSessionClient({
      createSession: () => new Promise(() => {}),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    void client.start({ flowVersionId: "version-1", mode: "test" });
    await vi.advanceTimersByTimeAsync(START_TIMEOUT_MS);

    expect(snapshots.at(-1)?.state).toBe("error");
    expect(snapshots.at(-1)?.isActive).toBe(false);
    expect(snapshots.at(-1)?.error?.message).toBe("The voice session did not start.");
  });

  it("ignores a session that arrives after the start timeout", async () => {
    let resolveSession: (session: VoiceSessionResponse) => void = () => {};
    const client = new VoiceSessionClient({
      createSession: () =>
        new Promise<VoiceSessionResponse>((resolve) => {
          resolveSession = resolve;
        }),
      onSnapshot: () => undefined,
    });

    void client.start({ flowVersionId: "version-1", mode: "test" });
    await vi.advanceTimersByTimeAsync(START_TIMEOUT_MS);
    resolveSession({ ...SESSION });
    await vi.advanceTimersByTimeAsync(0);

    expect(fakeRooms).toHaveLength(0);
  });

  it("keeps a call that reached the worker before the deadline", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    const client = new VoiceSessionClient({
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    await client.start({ flowVersionId: "version-1", mode: "test" });
    emitState(fakeRooms[0], "listening");
    await vi.advanceTimersByTimeAsync(START_TIMEOUT_MS);

    expect(snapshots.at(-1)?.state).toBe("listening");
    expect(snapshots.at(-1)?.isActive).toBe(true);

    await client.end();
  });
});

describe("VoiceSessionClient lifecycle races", () => {
  it("aborts the pending session request when the call ends", async () => {
    let signal: AbortSignal | undefined;
    let finishSession: (session: VoiceSessionResponse) => void = () => {};
    const client = new VoiceSessionClient({
      createSession: (_request, requestSignal) => {
        signal = requestSignal;
        return new Promise((resolve) => {
          finishSession = resolve;
        });
      },
      onSnapshot: () => undefined,
    });

    void client.start({ flowVersionId: "version-1", mode: "test" });
    await vi.advanceTimersByTimeAsync(0);

    expect(signal).toBeDefined();
    const ending = client.end();
    expect(signal?.aborted).toBe(true);

    finishSession({ ...SESSION });
    await ending;
    await vi.advanceTimersByTimeAsync(0);

    expect(fakeRooms).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not start a call when end arrives during the draft save", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    let startedPrepare = false;
    let finishPrepare: () => void = () => {};
    const client = new VoiceSessionClient({
      prepare: () => {
        startedPrepare = true;
        return new Promise((resolve) => {
          finishPrepare = resolve;
        });
      },
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    const starting = client.start({ flowVersionId: "version-1", mode: "test" });
    await vi.advanceTimersByTimeAsync(0);
    expect(startedPrepare).toBe(true);

    const ending = client.end();
    finishPrepare();
    await Promise.all([starting, ending]);

    expect(fakeRooms).toHaveLength(0);
    expect(snapshots.at(-1)?.state).toBe("ended");
    expect(snapshots.at(-1)?.isActive).toBe(false);
  });

  it("stops a microphone track published after the call ended", async () => {
    let finishConnect: () => void = () => {};
    connectControl.promise = new Promise<void>((resolve) => {
      finishConnect = resolve;
    });

    const client = new VoiceSessionClient({
      createSession: async () => ({ ...SESSION }),
      onSnapshot: () => undefined,
    });

    const starting = client.start({ flowVersionId: "version-1", mode: "test" });
    await vi.advanceTimersByTimeAsync(0);

    const room = fakeRooms[0];
    let finishPublish: () => void = () => {};
    room.localParticipant.setMicrophoneEnabled = vi.fn(async (enabled: boolean) => {
      if (!enabled) return;
      await new Promise<void>((resolve) => {
        finishPublish = resolve;
      });
      room.localParticipant.microphoneTrack = { stop: vi.fn() };
      room.localParticipant.isMicrophoneEnabled = true;
    });

    finishConnect();
    await vi.advanceTimersByTimeAsync(0);
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenCalledWith(
      true,
      expect.anything(),
    );

    await client.end();
    expect(room.disconnected).toBe(true);

    finishPublish();
    await starting;

    expect(room.localParticipant.microphoneTrack?.stop).toHaveBeenCalled();
  });

  it("stops a microphone track published after the worker closed the call", async () => {
    let finishConnect: () => void = () => {};
    connectControl.promise = new Promise<void>((resolve) => {
      finishConnect = resolve;
    });

    const snapshots: VoiceCallSnapshot[] = [];
    const client = new VoiceSessionClient({
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    const starting = client.start({ flowVersionId: "version-1", mode: "test" });
    await vi.advanceTimersByTimeAsync(0);

    const room = fakeRooms[0];
    let finishPublish: () => void = () => {};
    room.localParticipant.setMicrophoneEnabled = vi.fn(async (enabled: boolean) => {
      if (!enabled) return;
      await new Promise<void>((resolve) => {
        finishPublish = resolve;
      });
      room.localParticipant.microphoneTrack = { stop: vi.fn() };
      room.localParticipant.isMicrophoneEnabled = true;
    });

    finishConnect();
    await vi.advanceTimersByTimeAsync(0);
    emitData(room, { type: "session.closed", code: 1000 });
    await vi.advanceTimersByTimeAsync(0);

    expect(snapshots.at(-1)?.state).toBe("ended");
    expect(room.disconnected).toBe(true);

    finishPublish();
    await starting;

    expect(room.localParticipant.microphoneTrack?.stop).toHaveBeenCalled();
  });

  it("does not let a stalled leave block the next call", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    const client = new VoiceSessionClient({
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    await client.start({ flowVersionId: "version-1", mode: "test" });
    const first = fakeRooms[0];
    first.disconnect.mockImplementation(() => new Promise<void>(() => {}));

    const ending = client.end();
    const starting = client.start({ flowVersionId: "version-1", mode: "test" });
    await starting;

    expect(fakeRooms).toHaveLength(2);
    const second = fakeRooms[1];
    emitState(second, "listening");
    expect(snapshots.at(-1)?.state).toBe("listening");

    await client.end();
    await vi.advanceTimersByTimeAsync(ROOM_LEAVE_TIMEOUT_MS);
    await ending;

    expect(first.disconnect).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("runs rapid overlapping start/end cycles without leftover rooms or timers", async () => {
    const snapshots: VoiceCallSnapshot[] = [];
    const client = new VoiceSessionClient({
      createSession: async () => ({ ...SESSION }),
      onSnapshot: (snapshot) => snapshots.push(snapshot),
    });

    await client.start({ flowVersionId: "version-1", mode: "test" });

    for (let cycle = 0; cycle < 12; cycle += 1) {
      const room = fakeRooms.at(-1);
      if (!room) throw new Error("cycle did not create a room");

      emitState(room, "listening");
      emitState(room, "speaking");

      const ending = client.end();
      const starting = client.start({ flowVersionId: "version-1", mode: "test" });
      await Promise.all([ending, starting]);
    }
    await client.end();

    expect(fakeRooms).toHaveLength(13);
    for (const room of fakeRooms) {
      expect(room.disconnect).toHaveBeenCalled();
      expect(room.localParticipant.microphoneTrack?.stop).toHaveBeenCalled();
    }
    expect(snapshots.at(-1)?.state).toBe("ended");
    expect(snapshots.at(-1)?.isActive).toBe(false);
    expect(vi.getTimerCount()).toBe(0);

    const emitted = snapshots.length;
    await vi.advanceTimersByTimeAsync(ROOM_LEAVE_TIMEOUT_MS);
    expect(snapshots.length).toBe(emitted);
  });
});

describe("VoiceSessionClient speech gate", () => {
  it("mutes the microphone while the worker speaks and resumes after the playback tail", async () => {
    const { client, room } = await startCall();
    expect(room.localParticipant.isMicrophoneEnabled).toBe(true);

    emitState(room, "speaking");
    expect(room.localParticipant.isMicrophoneEnabled).toBe(false);

    emitState(room, "listening");
    await vi.advanceTimersByTimeAsync(RESUME_DELAY_MS - 1);
    expect(room.localParticipant.isMicrophoneEnabled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(room.localParticipant.isMicrophoneEnabled).toBe(true);

    await client.end();
  });

  it("keeps a manual mute across an agent turn", async () => {
    const { client, room } = await startCall();
    await client.toggleMute();
    expect(room.localParticipant.isMicrophoneEnabled).toBe(false);

    emitState(room, "speaking");
    emitState(room, "listening");
    await vi.advanceTimersByTimeAsync(RESUME_DELAY_MS);
    expect(room.localParticipant.isMicrophoneEnabled).toBe(false);

    await client.toggleMute();
    expect(room.localParticipant.isMicrophoneEnabled).toBe(true);

    await client.end();
  });

  it("stays muted when a new turn starts during the resume delay", async () => {
    const { client, room } = await startCall();

    emitState(room, "speaking");
    emitState(room, "listening");
    emitState(room, "speaking");
    await vi.advanceTimersByTimeAsync(RESUME_DELAY_MS);
    expect(room.localParticipant.isMicrophoneEnabled).toBe(false);

    emitState(room, "listening");
    await vi.advanceTimersByTimeAsync(RESUME_DELAY_MS);
    expect(room.localParticipant.isMicrophoneEnabled).toBe(true);

    await client.end();
  });
});
