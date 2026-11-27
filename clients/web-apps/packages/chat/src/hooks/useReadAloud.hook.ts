import { useEffect, useRef, useState } from "react";

const MAX_CHUNK_LENGTH = 220;

const isSpeechAvailable = () => typeof window !== "undefined" && "speechSynthesis" in window;

// IMPORTANT NOTE: Chrome stops a single long utterance after about 15 seconds, so text is queued in short chunks.
const toChunks = (text: string) => {
  const chunks: string[] = [];
  for (const sentence of text.split(/(?<=[.!?])\s+|\n+/)) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    const last = chunks.at(-1);
    if (last && last.length + trimmed.length < MAX_CHUNK_LENGTH)
      chunks[chunks.length - 1] = `${last} ${trimmed}`;
    else chunks.push(trimmed);
  }
  return chunks;
};

type Reading = { reset: () => void };

let activeReading: Reading | null = null;

// IMPORTANT NOTE: Safari does not reliably fire end or error after speechSynthesis.cancel(), so the reading resets its own state instead of waiting for the browser.
const cancelActiveReading = () => {
  const reading = activeReading;
  activeReading = null;
  reading?.reset();
  window.speechSynthesis.cancel();
};

/** Reads text aloud with the browser's speech synthesis; starting one reading stops any other. */
export const useReadAloud = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const readingRef = useRef<Reading | null>(null);

  useEffect(
    () => () => {
      if (readingRef.current) cancelActiveReading();
    },
    [],
  );

  const stop = () => {
    if (readingRef.current) cancelActiveReading();
  };

  const speak = (text: string) => {
    cancelActiveReading();
    const utterances = toChunks(text).map((chunk) => new SpeechSynthesisUtterance(chunk));
    const last = utterances.at(-1);
    if (!last) return;
    const reading: Reading = {
      reset: () => {
        if (readingRef.current !== reading) return;
        readingRef.current = null;
        setIsSpeaking(false);
      },
    };
    const finish = () => {
      if (activeReading === reading) cancelActiveReading();
    };
    for (const utterance of utterances) utterance.onerror = finish;
    last.onend = finish;
    activeReading = reading;
    readingRef.current = reading;
    setIsSpeaking(true);
    for (const utterance of utterances) window.speechSynthesis.speak(utterance);
  };

  return {
    isAvailable: isSpeechAvailable(),
    isSpeaking,
    toggle: (text: string) => (isSpeaking ? stop() : speak(text)),
  };
};
