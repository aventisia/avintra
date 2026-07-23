import { WebSocketCommandType } from "..";

export type WebSocketMessageType = {
  source: "react" | "wpf";
  command: WebSocketCommandType;
  data?: string;
};
