import type { ComponentType } from "react";

/** The tool the landing chat calls to offer the user a page. */
export const NAVIGATE_TOOL_NAME = "workspace_navigate";

/** A page the chat may send the user to. */
export type ChatDestinationOption = {
  route: string;
  label: string;
  /** The area the page belongs to, such as "Configure". */
  section: string;
  icon?: ComponentType<{ className?: string }>;
};

/** A plan the chat proposes before building anything. */
export type ChatBlueprint = {
  title: string;
  summary?: string;
  steps: { title: string; detail?: string }[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/** Finds the page a navigate call names; routes the user can't open are ignored. */
export const findDestination = (args: unknown, destinations: readonly ChatDestinationOption[]) => {
  const route = isRecord(args) ? args.route : undefined;
  return destinations.find((destination) => destination.route === route) ?? null;
};

/** Reads a blueprint data part, dropping malformed steps; null when nothing usable remains. */
export const parseBlueprint = (data: unknown): ChatBlueprint | null => {
  if (!isRecord(data) || !Array.isArray(data.steps)) return null;
  const title = readText(data.title);
  const steps = data.steps.flatMap((step) => {
    const stepTitle = isRecord(step) ? readText(step.title) : undefined;
    return stepTitle && isRecord(step) ? [{ title: stepTitle, detail: readText(step.detail) }] : [];
  });
  if (!title || steps.length === 0) return null;
  return { title, summary: readText(data.summary), steps };
};

/** Keeps the starter prompts whose page the user can open. */
export const pickReachablePrompts = (
  candidates: readonly { prompt: string; route: string }[],
  destinations: readonly ChatDestinationOption[],
) => {
  const routes = new Set(destinations.map((destination) => destination.route));
  return candidates.filter((candidate) => routes.has(candidate.route)).map(({ prompt }) => prompt);
};
