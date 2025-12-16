export type WebSocketCommandType =
  | "check-condition"
  | "check-loop-condition"
  | "process-node"
  | "next-node"
  | "save-execution-log"
  | "process-config-keys"
  | "start"
  | "pause"
  | "resume"
  | "error"
  | "abort"
  | "complete";
