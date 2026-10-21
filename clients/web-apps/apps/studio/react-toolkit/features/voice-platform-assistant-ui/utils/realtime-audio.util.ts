const WAV_HEADER_BYTES = 44;

const clampSample = (value: number): number => Math.max(-1, Math.min(1, value));

/** Resamples mono float samples with linear interpolation. */
export const resampleLinear = (
  samples: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array => {
  if (fromRate === toRate || samples.length === 0) return samples;
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.floor(samples.length / ratio));
  const output = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const position = index * ratio;
    const lower = Math.floor(position);
    const upper = Math.min(samples.length - 1, lower + 1);
    const fraction = position - lower;
    output[index] = samples[lower] + (samples[upper] - samples[lower]) * fraction;
  }
  return output;
};

/** Converts mono float samples to little-endian PCM16 bytes. */
export const encodePcm16 = (samples: Float32Array): Uint8Array => {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  samples.forEach((sample, index) => {
    view.setInt16(index * 2, Math.round(clampSample(sample) * 0x7fff), true);
  });
  return bytes;
};

/** Decodes little-endian PCM16 bytes to mono float samples. */
export const decodePcm16 = (bytes: Uint8Array): Float32Array => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples = new Float32Array(bytes.length / 2);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = view.getInt16(index * 2, true) / 0x8000;
  }
  return samples;
};

/** Encodes mono float samples as base64 PCM16, resampled to the realtime 16 kHz contract. */
export const encodePcm16Base64 = (samples: Float32Array, sampleRate: number): string => {
  const canonical = resampleLinear(samples, sampleRate, 16000);
  return bytesToBase64(encodePcm16(canonical));
};

/** Decodes base64 PCM16 from a provider audio chunk. */
export const decodePcm16Base64 = (audioBase64: string): Float32Array =>
  decodePcm16(base64ToBytes(audioBase64));

/** Encodes mono float samples as a base64 WAV payload. */
export const encodeWavBase64 = (samples: Float32Array, sampleRate: number): string =>
  bytesToBase64(encodeWav(samples, sampleRate));

/** Encodes mono float samples as a WAV blob. */
export const encodeWavBlob = (samples: Float32Array, sampleRate: number): Blob =>
  new Blob([encodeWav(samples, sampleRate).buffer as ArrayBuffer], { type: "audio/wav" });

const encodeWav = (samples: Float32Array, sampleRate: number): Uint8Array => {
  const pcm = encodePcm16(samples);
  const bytes = new Uint8Array(WAV_HEADER_BYTES + pcm.length);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + pcm.length, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, pcm.length, true);
  bytes.set(pcm, WAV_HEADER_BYTES);

  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};
