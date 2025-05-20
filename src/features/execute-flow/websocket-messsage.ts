export type WebSocketMessage = {
  source: "react" | "wpf";
  command: "pause" | "resume" | "abort";
};
