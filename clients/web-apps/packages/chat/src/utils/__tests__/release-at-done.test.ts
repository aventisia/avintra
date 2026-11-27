import { readFollowUps, untilDone } from "@avplatform/assistant-chat/release-at-done";
import { describe, expect, it, vi } from "vitest";

const frame = (type: string, output: unknown) => JSON.stringify({ type, output });

async function* framesOf(payloads: string[], error?: Error): AsyncGenerator<string> {
  for (const payload of payloads) yield payload;
  if (error) throw error;
}

const collect = async (frames: AsyncGenerator<string>) => {
  const seen: string[] = [];
  for await (const payload of frames) seen.push(payload);
  return seen;
};

describe("untilDone", () => {
  it("ends at the done frame and hands the rest of the stream on", async () => {
    const delta = frame("delta", "Hi");
    const done = frame("done", "Hi");
    const followup = frame("followup", ["A"]);
    let rest: AsyncGenerator<string> | undefined;

    const seen = await collect(
      untilDone(framesOf([delta, done, followup]), (remaining) => {
        rest = remaining;
      }),
    );

    expect(seen).toEqual([delta, done]);
    expect(rest).toBeDefined();
    expect(await collect(rest!)).toEqual([followup]);
  });

  it("never hands on a stream that ends without done", async () => {
    const onRest = vi.fn();
    const payloads = [frame("delta", "Hi"), frame("error", "boom")];

    expect(await collect(untilDone(framesOf(payloads), onRest))).toEqual(payloads);
    expect(onRest).not.toHaveBeenCalled();
  });

  it("passes an unparsable payload through and keeps scanning", async () => {
    const onRest = vi.fn();
    const done = frame("done", "");

    expect(await collect(untilDone(framesOf(["not json", done]), onRest))).toEqual([
      "not json",
      done,
    ]);
    expect(onRest).toHaveBeenCalledOnce();
  });
});

describe("readFollowUps", () => {
  it("returns the follow-up suggestions", async () => {
    expect(await readFollowUps(framesOf([frame("followup", ["A", "B"])]))).toEqual(["A", "B"]);
  });

  it("returns null when none arrive", async () => {
    expect(await readFollowUps(framesOf([]))).toBeNull();
  });

  it("returns null when reading fails", async () => {
    expect(await readFollowUps(framesOf([], new Error("aborted")))).toBeNull();
  });
});
