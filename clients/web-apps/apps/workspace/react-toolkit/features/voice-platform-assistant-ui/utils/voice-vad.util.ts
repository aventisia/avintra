import { VOICE_VAD_DEFAULTS } from "./voice-session.util";

export type VoiceUtterance = {
  /** Mono float samples, including the configured pre-roll. */
  samples: Float32Array;
  /** Capture sample rate of `samples`. */
  sampleRate: number;
  /** Speech duration in milliseconds (pre-roll excluded from the onset guard). */
  durationMs: number;
};

export type VoiceActivityCallbacks = {
  /** Fires once when speech has been sustained for the onset window. */
  onSpeechStart?: () => void;
  /** Fires when an utterance ends by silence or the max-utterance guard. */
  onSpeechEnd: (utterance: VoiceUtterance) => void;
  /** Receives every captured frame for streaming engines. */
  onFrame?: (samples: Float32Array, sampleRate: number) => void;
};

const concatFrames = (frames: Float32Array[]): Float32Array => {
  const total = frames.reduce((length, frame) => length + frame.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  frames.forEach((frame) => {
    merged.set(frame, offset);
    offset += frame.length;
  });
  return merged;
};

const trimPreRoll = (frames: Float32Array[], maxSamples: number): Float32Array[] => {
  let total = frames.reduce((length, frame) => length + frame.length, 0);
  while (total > maxSamples && frames.length > 1) {
    total -= (frames.shift() as Float32Array).length;
  }
  return frames;
};

const frameLevelDb = (samples: Float32Array): number => {
  let sum = 0;
  for (let index = 0; index < samples.length; index += 1) sum += samples[index] * samples[index];
  const rms = Math.sqrt(sum / Math.max(1, samples.length));
  return rms === 0 ? -Infinity : 20 * Math.log10(rms);
};

/** Browser-side voice activity detector that emits utterances and streams frames. */
export class VoiceActivityCapture {
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sink: GainNode | null = null;
  private callbacks: VoiceActivityCallbacks | null = null;
  private preRoll: Float32Array[] = [];
  private speechFrames: Float32Array[] = [];
  private isInSpeech = false;
  private onsetMs = 0;
  private silenceMs = 0;
  private voicedMs = 0;

  start(stream: MediaStream, callbacks: VoiceActivityCallbacks): void {
    this.stop();
    this.callbacks = callbacks;

    const context = new AudioContext();
    this.context = context;
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    const sink = context.createGain();
    sink.gain.value = 0;
    this.source = source;
    this.processor = processor;
    this.sink = sink;

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer;
      const frame = new Float32Array(input.length);
      for (let channel = 0; channel < input.numberOfChannels; channel += 1) {
        const data = input.getChannelData(channel);
        for (let index = 0; index < data.length; index += 1) {
          frame[index] += data[index] / input.numberOfChannels;
        }
      }
      this.handleFrame(frame, context.sampleRate);
    };

    source.connect(processor);
    processor.connect(sink);
    sink.connect(context.destination);
    void context.resume();
  }

  stop(): void {
    if (this.processor) {
      this.processor.onaudioprocess = null;
      this.processor.disconnect();
    }
    this.source?.disconnect();
    this.sink?.disconnect();
    if (this.context && this.context.state !== "closed") void this.context.close();
    this.context = null;
    this.source = null;
    this.processor = null;
    this.sink = null;
    this.callbacks = null;
    this.preRoll = [];
    this.speechFrames = [];
    this.isInSpeech = false;
    this.onsetMs = 0;
    this.silenceMs = 0;
    this.voicedMs = 0;
  }

  private handleFrame(frame: Float32Array, sampleRate: number): void {
    const callbacks = this.callbacks;
    if (!callbacks) return;
    callbacks.onFrame?.(frame, sampleRate);

    const frameMs = (frame.length / sampleRate) * 1000;
    const isSpeech = frameLevelDb(frame) >= VOICE_VAD_DEFAULTS.thresholdDb;

    if (!this.isInSpeech) {
      this.preRoll.push(frame);
      const preRollSamples = (sampleRate * VOICE_VAD_DEFAULTS.preRollMs) / 1000;
      this.preRoll = trimPreRoll(this.preRoll, preRollSamples);
      this.onsetMs = isSpeech ? this.onsetMs + frameMs : 0;
      if (this.onsetMs >= VOICE_VAD_DEFAULTS.onsetMs) {
        this.isInSpeech = true;
        this.speechFrames = [...this.preRoll];
        this.preRoll = [];
        this.silenceMs = 0;
        this.voicedMs = this.onsetMs;
        callbacks.onSpeechStart?.();
      }
      return;
    }

    this.speechFrames.push(frame);
    this.silenceMs = isSpeech ? 0 : this.silenceMs + frameMs;
    if (isSpeech) this.voicedMs += frameMs;
    const speechMs = this.speechFrames.reduce(
      (total, captured) => total + (captured.length / sampleRate) * 1000,
      0,
    );
    const silenceToCommitMs = Math.max(VOICE_VAD_DEFAULTS.silenceMs, VOICE_VAD_DEFAULTS.hangoverMs);

    if (this.silenceMs < silenceToCommitMs && speechMs < VOICE_VAD_DEFAULTS.maxUtteranceMs) return;

    const samples = concatFrames(this.speechFrames);
    const durationMs = this.voicedMs;
    this.isInSpeech = false;
    this.speechFrames = [];
    this.onsetMs = 0;
    this.silenceMs = 0;
    this.voicedMs = 0;
    callbacks.onSpeechEnd({ samples, sampleRate, durationMs });
  }
}
