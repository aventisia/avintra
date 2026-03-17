const NODE_HEIGHT = 64; // px
const NODE_WIDTH = 64; // px
const START_END_NODE_HEIGHT = 36; // px
const START_END_NODE_WIDTH = 64; // px
const EDGE_BORDER_RADIUS = 20; // px
const ZOOM_ANIMATION_DURATION = 200; // ms
const AUTO_LAYOUT_ANIMATION_DURATION = 200; // ms
const DEBOUNCE_SAVE_DELAY = 3000; // ms
const STROKE_DASHARRAY = "5,5"; // FOR CUSTOM DOTTED EDGE
const STROKE_WIDTH = 1; // FOR CUSTOM EDGE
const MARKER_ARROW_PREFIX = "markerArrow_";

/**
 * Indicates whether the application is running in a Tauri environment.
 *
 * This constant checks if the `window` object contains the `isTauri` property,
 * which is typically injected by Tauri. It can be used to conditionally execute
 * code specific to Tauri or web environments.
 */
const IS_TAURI = "isTauri" in window;

export {
  NODE_HEIGHT,
  NODE_WIDTH,
  EDGE_BORDER_RADIUS,
  ZOOM_ANIMATION_DURATION,
  AUTO_LAYOUT_ANIMATION_DURATION,
  DEBOUNCE_SAVE_DELAY,
  STROKE_DASHARRAY,
  MARKER_ARROW_PREFIX,
  STROKE_WIDTH,
  START_END_NODE_WIDTH,
  START_END_NODE_HEIGHT,
  IS_TAURI,
};
