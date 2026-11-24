const frameType = (payload: string): unknown => {
  try {
    return (JSON.parse(payload) as { type?: unknown } | null)?.type;
  } catch {
    return undefined;
  }
};

/** Yields frames through the first `done`, then hands the still-open stream to `onRest`. */
export async function* untilDone(
  frames: AsyncGenerator<string>,
  onRest: (rest: AsyncGenerator<string>) => void,
): AsyncGenerator<string> {
  // IMPORTANT NOTE: frames are pulled with next() by hand; leaving a for-await
  // early would close the stream before the follow-ups arrive.
  while (true) {
    const next = await frames.next();
    if (next.done) return;
    yield next.value;
    if (frameType(next.value) === "done") {
      onRest(frames);
      return;
    }
  }
}

/** The last follow-up suggestions on the stream, or null when none arrive or reading fails. */
export async function readFollowUps(rest: AsyncGenerator<string>): Promise<string[] | null> {
  let suggestions: string[] | null = null;
  try {
    for await (const payload of rest) {
      try {
        const frame = JSON.parse(payload) as { type?: unknown; output?: unknown } | null;
        if (frame?.type === "followup" && Array.isArray(frame.output)) {
          suggestions = frame.output.filter((item): item is string => typeof item === "string");
        }
      } catch {
        continue;
      }
    }
  } catch {
    return null;
  }
  return suggestions;
}
