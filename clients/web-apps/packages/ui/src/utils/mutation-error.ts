/**
 * Extracts a readable error message from a thrown mutation error.
 *
 * Our backend controllers use `ResultHelper<T>`, which on failure returns a
 * plain text response (`text/plain`) with the error message rather than a JSON
 * body. When the frontend fetch/axios wrapper throws, the message lives in the
 * response body. This helper safely extracts it.
 *
 * @param error The error thrown by the mutation function.
 * @returns A user-friendly error message string.
 */
export const getMutationErrorMessage = (error: unknown): string => {
  // Errors originating from HTTP clients (axios, fetch, etc.) expose the
  // response body as `error.response.data`. For our backend the body is plain
  // text; treat it as the message when present.
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const responseData = (error.response as { data: unknown }).data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData;
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim().length > 0
    ) {
      return responseData.message;
    }
  }

  // Generic Error fallback
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for non-Error values
  return typeof error === "string" ? error : "Something went wrong";
};
