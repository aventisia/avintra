// src/stores/tab-store.ts
import { create } from "zustand";

interface PlayerState {
    playbackRate: string;
    currentTimeStamp: string | null;
}

interface PlayerActions {
    setPlaybackRate: (tab: string) => void;
    setCurrentTimeStamp: (timeStamp: string) => void;
}

export const useAudioPlayerStore = create<PlayerState & PlayerActions>((set) => ({
    playbackRate: "1",
    currentTimeStamp: null,
    setPlaybackRate: (rate) => set({ playbackRate: rate }),
    setCurrentTimeStamp: (timeStamp) => set({ currentTimeStamp: timeStamp }),
}));
