export type WebSocketCommandType =
  | "check-condition"
  | "check-loop-condition"
  | "process-node"
  | "next-node"
  | "save-execution-log"
  | "start"
  | "pause"
  | "resume"
  | "abort";
