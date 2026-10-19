/**
 * Extracts a display message from an API failure, preferring the backend message.
 */
export const getHttpErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  // IMPORTANT NOTE: the axios interceptor rejects 409s with the backend message as a plain string.
  if (typeof error === "string" && error.trim()) return error;
  const backendMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
    ?.message;
  if (typeof backendMessage === "string" && backendMessage.trim()) return backendMessage;
  return error instanceof Error && error.message ? error.message : fallback;
};
