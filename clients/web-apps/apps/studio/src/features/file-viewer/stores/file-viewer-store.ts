import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

//  Constants

export const SCALE_MIN = 0.25;
export const SCALE_MAX = 3.0;
export const SCALE_STEP = 0.25;
export const SCALE_DEFAULT = 1.0;

//  Types

interface ViewerState {
  scale: number;
  rotate: number;
}

interface ViewerActions {
  setScale: (scale: number) => void;
  setRotate: (rotate: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  reset: () => void;
}

//  Store

const DEFAULT_STATE: ViewerState = {
  scale: SCALE_DEFAULT,
  rotate: 0,
};

export const useViewerStore = create<ViewerState & ViewerActions>((set, get) => ({
  ...DEFAULT_STATE,

  setScale: (scale) =>
    set({
      scale: Math.min(SCALE_MAX, Math.max(SCALE_MIN, +scale.toFixed(2))),
    }),

  setRotate: (rotate) => set({ rotate: ((rotate % 360) + 360) % 360 }),

  zoomIn: () => {
    const { scale, setScale } = get();
    setScale(scale + SCALE_STEP);
  },

  zoomOut: () => {
    const { scale, setScale } = get();
    setScale(scale - SCALE_STEP);
  },

  rotateLeft: () => {
    const { rotate, setRotate } = get();
    setRotate(rotate - 90);
  },

  rotateRight: () => {
    const { rotate, setRotate } = get();
    setRotate(rotate + 90);
  },

  reset: () => set(DEFAULT_STATE),
}));

//  Selectors

/** Convenience hook – returns only the values needed by zoom controls */
export const useZoomControls = () =>
  useViewerStore(
    useShallow((s) => ({
      scale: s.scale,
      zoomIn: s.zoomIn,
      zoomOut: s.zoomOut,
      canZoomIn: s.scale < SCALE_MAX,
      canZoomOut: s.scale > SCALE_MIN,
    })),
  );

/** Convenience hook – returns only the values needed by rotate controls */
export const useRotateControls = () =>
  useViewerStore(
    useShallow((s) => ({
      rotate: s.rotate,
      rotateLeft: s.rotateLeft,
      rotateRight: s.rotateRight,
    })),
  );
