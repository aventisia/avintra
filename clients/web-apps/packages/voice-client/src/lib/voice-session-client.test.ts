import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VoiceSessionClient } from "./voice-session-client";

const { FakeRoom, fakeRooms } = vi.hoisted(() => {
  type Listener = (...args: unknown[]) => void;

  class FakeRoom {
    readonly listeners = new Map<string, Listener[]>();
    readonly remoteParticipants = new Map<string, unknown>();
    readonly localParticipant = {
      isMicrophoneEnabled: false,
      setMicrophoneEnabled: vi.fn(async (enabled: boolean) => {
        this.localParticipant.isMicrophoneEnabled = enabled;
      }),
    };
    canPlaybackAudio = true;
    readonly connect = vi.fn(async () => undefined);
    readonly disconnect = vi.fn(async () => undefined);
    readonly startAudio = vi.fn(async () => undefined);

    on(event: string, listener: Listener): this {
      this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
      return this;
    }

    emit(event: string, ...args: unknown[]): void {
      for (const listener of this.listeners.get(event) ?? []) listener(...args);
    }
  }

  return { FakeRoom, fakeRooms: [] as FakeRoom[] };
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
  Track: { Kind: { Audio: "audio" } },
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

const emitState = (room: (typeof fakeRooms)[number], state: string): void => {
  const event = new TextEncoder().encode(
    JSON.stringify({ type: "session.state", conversationId: SESSION.conversationId, state }),
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
});

afterEach(() => {
  vi.useRealTimers();
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
