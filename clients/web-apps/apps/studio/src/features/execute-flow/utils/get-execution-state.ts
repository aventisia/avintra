import { ExecutionStateType, WebSocketCommandType } from "..";

export const getExecutionState = (
  command: WebSocketCommandType,
): ExecutionStateType => {
  switch (command) {
    case "pause":
      return "paused";
    case "abort":
    case "error":
    case "complete":
      return "stopped";
    default:
      return "executing";
  }
};
