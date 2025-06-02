import { ExecutionStateType, WebSocketCommandType } from "..";

export const getExecutionState = (
  command: WebSocketCommandType,
): ExecutionStateType => {
  switch (command) {
    case "pause":
      return "paused";
    case "abort":
      return "stopped";
    default:
      return "executing";
  }
};
