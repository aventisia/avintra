// Events to track user is inactive
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

// Time to logout session if user inactive
const IDLE_TIMEOUT_MINUTES = 15 * 60 * 1000; //15 min

export { ACTIVITY_EVENTS, IDLE_TIMEOUT_MINUTES };
