export type WebSocketMessage = {
  source: "react" | "wpf";
  command: "nextnode" | "start" | "pause" | "resume" | "abort";
  data?: string;
};
