import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useExecutionStore } from "../stores/execution-log-store";

/**
 * Query-param keys for the execution-log view state.
 *
 * - `li` — loop iterations, encoded as `loopId:index` pairs joined by `,` (e.g. `loopA:1,loopB:0`).
 *   A single param holds every loop so NESTED loops (a loop inside a loop) round-trip correctly;
 *   each loop keeps its own index and the parser resolves the nested pathKey from them.
 * - `it` — the active iteration index of the innermost loop, as a plain readable number (0, 1, 2…).
 *   Redundant with `li` but human-friendly when inspecting/sharing a URL.
 * - `ci` — the selected sub-flow caller node id (block/callAgent).
 *
 * All are optional and only written when applicable, so a plain top-level run keeps a clean URL.
 */
const LOOP_ITERATIONS_PARAM = "li";
const ITERATION_INDEX_PARAM = "it";
const CALLER_PARAM = "ci";

/** Parses `loopId:index,loopId:index` into a record, ignoring malformed entries. */
const parseLoopIterations = (raw: string | null): Record<string, number> => {
  if (!raw) return {};

  const result: Record<string, number> = {};
  raw.split(",").forEach((pair) => {
    const separatorIndex = pair.lastIndexOf(":");
    if (separatorIndex <= 0) return;

    const loopId = pair.slice(0, separatorIndex);
    const index = Number(pair.slice(separatorIndex + 1));
    if (!loopId || Number.isNaN(index) || index < 0) return;

    result[loopId] = index;
  });

  return result;
};

/** Serialises the iteration record back into `loopId:index,loopId:index`. */
const serialiseLoopIterations = (iterations: Record<string, number>): string =>
  Object.entries(iterations)
    .filter(([loopId, index]) => !!loopId && Number.isFinite(index) && index >= 0)
    .map(([loopId, index]) => `${loopId}:${index}`)
    .join(",");

/**
 * Finds the innermost (deepest-nested) loop id from the parent stacks. Used for the readable
 * `it` param: with nested loops the innermost one is the iteration the user is actually
 * stepping through, so it is the most meaningful single number to surface.
 */
const findInnermostLoopId = (nodeToParentStack: Record<string, string[]>): string | null => {
  let innermost: string | null = null;
  let maxDepth = 0;

  Object.values(nodeToParentStack).forEach((parents) => {
    if (parents.length > maxDepth) {
      maxDepth = parents.length;
      innermost = parents[parents.length - 1];
    }
  });

  return innermost;
};

/**
 * Keeps the execution-log view state (loop iterations + selected caller) in the URL so a page
 * refresh restores exactly the iteration/caller the user was inspecting.
 *
 * The store is the source of truth while the page is open; this hook hydrates it from the URL
 * on mount and mirrors every change back into the URL.
 */
export const useExecutionViewQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    activeIteration,
    activeCallerId,
    nodeToParentStack,
    loopRegistry,
    setIteration,
    setCaller,
  } = useExecutionStore(
    useShallow((state) => ({
      activeIteration: state.activeIteration,
      activeCallerId: state.activeCallerId,
      nodeToParentStack: state.nodeToParentStack,
      loopRegistry: state.loopRegistry,
      setIteration: state.setIteration,
      setCaller: state.setCaller,
    })),
  );

  // The mirror effect below must not run before hydration has applied the URL values,
  // otherwise it would immediately delete the very params we are restoring.
  const hydratedRef = useRef(false);

  // Hydrate the store from the URL once on mount. Runs before the logs are parsed, so the
  // parser's "preserve previous iteration" logic picks these values up.
  useEffect(() => {
    const fromUrl = parseLoopIterations(searchParams.get(LOOP_ITERATIONS_PARAM));
    Object.entries(fromUrl).forEach(([loopId, index]) => setIteration(loopId, index));

    const callerFromUrl = searchParams.get(CALLER_PARAM);
    if (callerFromUrl) setCaller(callerFromUrl);

    hydratedRef.current = true;
    // Intentionally mount-only: subsequent changes flow store → URL, not the other way round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the store in sync with the `ci` param. Entering a sub-flow sets `ci` directly on the
  // URL (from BlockNode/CallAgentNode), so without this the store would still hold `null` and
  // the mirror effect below would immediately delete the param again. Tracked against the last
  // value we synced so clearing the caller (leaving a sub-flow) is not undone here.
  const callerParam = searchParams.get(CALLER_PARAM);
  const lastSyncedCallerRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (callerParam === lastSyncedCallerRef.current) return;

    lastSyncedCallerRef.current = callerParam;
    if (callerParam !== activeCallerId) setCaller(callerParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callerParam]);

  // Mirror store changes back into the URL. `replace` keeps the back button clean.
  useEffect(() => {
    if (!hydratedRef.current) return;

    const params = new URLSearchParams(searchParams);

    const serialised = serialiseLoopIterations(activeIteration);
    if (serialised) {
      params.set(LOOP_ITERATIONS_PARAM, serialised);
    } else {
      params.delete(LOOP_ITERATIONS_PARAM);
    }

    // Readable copy of the innermost loop's index (0, 1, 2…). Falls back to the first known
    // loop when no node is nested inside one (e.g. an empty loop body), so the param still
    // reflects the iteration being viewed.
    const innermostLoopId =
      findInnermostLoopId(nodeToParentStack) ?? Object.keys(loopRegistry)[0] ?? null;
    const innermostIndex = innermostLoopId ? activeIteration[innermostLoopId] : undefined;
    if (typeof innermostIndex === "number" && innermostIndex >= 0) {
      params.set(ITERATION_INDEX_PARAM, String(innermostIndex));
    } else {
      params.delete(ITERATION_INDEX_PARAM);
    }

    if (activeCallerId) {
      params.set(CALLER_PARAM, activeCallerId);
    } else {
      params.delete(CALLER_PARAM);
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIteration, activeCallerId, nodeToParentStack, loopRegistry]);
};
