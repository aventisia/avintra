import { POPULAR_TOOL_KEYS } from "../constants/popular-tools.constant";
import type { ToolDto } from "../dtos";

/** Strips casing and separators so seeded names ("Googlesheets") match plugin ids. */
const normalizeToolKey = (name?: string) => (name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const POPULAR_RANK = new Map(POPULAR_TOOL_KEYS.map((key, index) => [key, index]));

/** Returns true when the tool is one of the featured popular platform tools. */
export const isPopularTool = (tool: Pick<ToolDto, "name">): boolean =>
  POPULAR_RANK.has(normalizeToolKey(tool.name));

/** Orders popular tools first by curated rank, leaving the rest in incoming order. */
export const sortPopularToolsFirst = <T extends Pick<ToolDto, "name">>(tools: T[]): T[] =>
  [...tools].sort(
    (a, b) =>
      (POPULAR_RANK.get(normalizeToolKey(a.name)) ?? POPULAR_TOOL_KEYS.length) -
      (POPULAR_RANK.get(normalizeToolKey(b.name)) ?? POPULAR_TOOL_KEYS.length),
  );
