export type WebSocketCommandType =
  | "check-condition"
  | "check-loop-condition"
  | "setup-execution-context"
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
