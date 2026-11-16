/** Structured layout plan produced before a new interface is drafted. */
export type UiBuilderPlan = {
  title: string;
  summary: string;
  archetype: string;
  sections: { name: string; purpose: string }[];
  components: string[];
  states: string[];
};

/** Maximum number of earlier prompts carried into a turn as project memory. */
export const UI_BUILDER_MEMORY_PROMPT_COUNT = 5;

/** Maximum characters kept per remembered prompt. */
export const UI_BUILDER_MEMORY_PROMPT_CAP = 400;

/** Output cap for the small planning and suggestion calls. */
export const UI_BUILDER_SMALL_CALL_OUTPUT_TOKENS = 1200;

/** Number of follow-up prompts suggested after a saved turn. */
export const UI_BUILDER_SUGGESTION_COUNT = 3;

/** System prompt for the planning pass that runs before a new interface is drafted. */
export const UI_BUILDER_PLAN_SYSTEM_PROMPT = [
  "You are a senior product designer planning an internal business interface before it is built.",
  "Return only a JSON object with this exact shape and no prose:",
  '{"title": string, "summary": string, "archetype": "dashboard" | "work-list" | "detail" | "form" | "wizard" | "kanban" | "inbox" | "settings" | "landing" | "other", "sections": [{"name": string, "purpose": string}], "components": string[], "states": string[]}',
  "- title: the page's h1, specific to the request.",
  "- summary: one or two sentences on who uses the page and the main job it does.",
  "- sections: 3 to 7 sections in reading order; purpose says what the section shows or lets the user do.",
  "- components: the concrete UI pieces needed (for example KPI cards, filter bar, data table with sorting, detail drawer, status badges, bar chart, confirmation dialog).",
  "- states: the empty, loading, error, and success states the page must handle.",
  "Plan for a dense, practical layout that fits real operational use. Do not invent data sources beyond the ones described.",
].join("\n");

/** System prompt for the follow-up suggestion call. */
export const UI_BUILDER_SUGGEST_SYSTEM_PROMPT = [
  "You suggest the next improvements a user could ask for on an interface they are building.",
  `Return only a JSON object: {"suggestions": string[]} with exactly ${UI_BUILDER_SUGGESTION_COUNT} items.`,
  "- Each suggestion is one short imperative request (under 90 characters) the user can send as-is.",
  "- Make them specific to this page: missing states, useful filters, better data display, interactions, or accessibility.",
  "- Never repeat what was just done or suggest something already present.",
].join("\n");

/** Builds the planning request from the user's prompt and the bound data summary. */
export const buildUiBuilderPlanContent = (prompt: string, dataSummary: string) =>
  [
    "Plan an interface for this request:",
    prompt,
    dataSummary ? `\nBound data:\n${dataSummary}` : "",
  ].join("\n");

/** Renders a plan as the guidance block embedded in the draft request. */
export const formatUiBuilderPlan = (plan: UiBuilderPlan) =>
  [
    "Follow this plan:",
    `Title: ${plan.title}`,
    `Summary: ${plan.summary}`,
    `Archetype: ${plan.archetype}`,
    "Sections:",
    ...plan.sections.map((section, index) => `${index + 1}. ${section.name} — ${section.purpose}`),
    `Components: ${plan.components.join(", ")}`,
    `States: ${plan.states.join(", ")}`,
  ].join("\n");

/** Normalizes a model-produced plan, or returns null when it is unusable. */
export const normalizeUiBuilderPlan = (value: unknown): UiBuilderPlan | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const text = (input: unknown) => (typeof input === "string" ? input.trim() : "");
  const list = (input: unknown) =>
    Array.isArray(input) ? input.map(text).filter(Boolean).slice(0, 12) : [];
  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .map((section) => {
          const entry = (section ?? {}) as Record<string, unknown>;
          return { name: text(entry.name), purpose: text(entry.purpose) };
        })
        .filter((section) => section.name)
        .slice(0, 8)
    : [];
  if (!text(raw.title) || sections.length === 0) return null;

  return {
    title: text(raw.title),
    summary: text(raw.summary),
    archetype: text(raw.archetype) || "other",
    sections,
    components: list(raw.components),
    states: list(raw.states),
  };
};

/** Builds the project memory block appended to the system prompt. */
export const buildUiBuilderMemoryPrompt = (instructions: string, recentPrompts: string[]) => {
  const blocks: string[] = [];
  if (instructions.trim()) {
    blocks.push(
      "Project instructions from the owner (always follow them unless the request overrides them):",
      instructions.trim(),
    );
  }
  if (recentPrompts.length > 0) {
    blocks.push(
      "Earlier requests on this interface, oldest first (context only; do not redo them):",
      ...recentPrompts.map(
        (recent, index) => `${index + 1}. ${recent.slice(0, UI_BUILDER_MEMORY_PROMPT_CAP)}`,
      ),
    );
  }
  return blocks.length > 0 ? `\n\n${blocks.join("\n")}` : "";
};

/** Builds the suggestion request from the latest prompt and the rendered page outline. */
export const buildUiBuilderSuggestContent = (prompt: string, outline: string) =>
  [
    "The user just asked:",
    prompt.slice(0, 1000),
    "",
    "The page now has this outline:",
    outline || "(outline unavailable)",
  ].join("\n");

/** Normalizes the suggestion call output into a short list of prompts. */
export const normalizeUiBuilderSuggestions = (value: unknown): string[] => {
  const raw = (value ?? {}) as { suggestions?: unknown };
  if (!Array.isArray(raw.suggestions)) return [];
  return raw.suggestions
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry.length <= 160)
    .slice(0, UI_BUILDER_SUGGESTION_COUNT);
};

/** Instruction appended to a request that carries reference images. */
export const buildUiBuilderReferenceImageNote = (count: number) =>
  count === 0
    ? ""
    : `\n\n${count === 1 ? "A reference image is" : `${count} reference images are`} attached. Match their layout, hierarchy, sections, and content as closely as the request allows, rebuilt with the runtime kit. Keep the project theme's colors unless the request asks to copy the image's colors. Do not embed the image itself.`;

/** Maximum characters of the current source shared with the discussion mode. */
export const UI_BUILDER_DISCUSS_SOURCE_CAP = 40000;

/** System prompt for plan mode, where the agent discusses the interface without changing it. */
export const UI_BUILDER_DISCUSS_SYSTEM_PROMPT = [
  "You are a senior product designer pairing with a user who builds internal business interfaces in a UI builder.",
  "In this mode you only discuss: answer questions, critique the current interface, and propose concrete plans. Never write code and never claim to have changed anything.",
  "Be concise and specific. Use short paragraphs and '-' bullet lists. When you propose changes, end with a numbered plan the user can approve, each step one sentence naming the section and the change.",
  "Ground suggestions in the runtime kit's components (tables, sheets, dialogs, stats, charts, forms) and the connected data when it is described.",
].join("\n");

/** Builds the discussion request from the current interface and the user's message. */
export const buildUiBuilderDiscussContent = (source: string, outline: string, message: string) =>
  [
    source
      ? `Current interface source${source.length > UI_BUILDER_DISCUSS_SOURCE_CAP ? " (truncated)" : ""}:\n${source.slice(0, UI_BUILDER_DISCUSS_SOURCE_CAP)}`
      : "There is no interface yet.",
    outline ? `\nRendered outline:\n${outline}` : "",
    "",
    "User:",
    message,
  ].join("\n");

/** Builds the build prompt that implements a plan agreed in discussion mode. */
export const buildUiBuilderImplementPlanPrompt = (plan: string) =>
  `Implement this agreed plan:\n${plan.slice(0, 6000)}`;

/** Builds the system prompt block listing the project's uploaded images. */
export const buildUiBuilderAssetPrompt = (
  assets: ReadonlyArray<{ name: string; contentType: string }>,
  isFramework: boolean,
) =>
  assets.length === 0
    ? ""
    : [
        "",
        "",
        "Project images (uploaded by the user; use them where the request calls for a logo, avatar, illustration, or product image):",
        ...assets.map((asset) => `- "${asset.name}" (${asset.contentType})`),
        isFramework
          ? 'Reference an image only through the runtime: <img src={Avintra.asset("logo")} alt="Company logo" className="h-8 w-auto" />. Never inline image data or invent other image names.'
          : 'Reference an image only through the runtime: image.src = Avintra.asset("logo"). Never inline image data or invent other image names.',
      ].join("\n");
