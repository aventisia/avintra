// The abort job execution endpoint is not available in the current backend.
// This hook is intentionally left as a no-op stub.
export const useAbortJobExecutionMutation = () => {
  return { abortJobMutation: undefined, isPending: false };
};
