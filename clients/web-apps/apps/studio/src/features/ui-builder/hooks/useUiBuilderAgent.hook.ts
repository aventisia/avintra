import { stripUiBuilderRuntime } from "@avplatform/ui/ui-builder-host";

import {
  buildUiBuilderEditContent,
  buildUiBuilderEditFixContent,
  buildUiBuilderEditRetryContent,
} from "../constants/ui-builder-edit.constant";
import {
  UI_BUILDER_ARCHETYPE_SKILL_NAME,
  UI_BUILDER_DATA_VIZ_SKILL_NAME,
  UI_BUILDER_FRAMEWORK_SELECTION_NOTE,
  UI_BUILDER_FRAMEWORK_SKILL_NAMES,
  type UiBuilderContentFormat,
  buildUiBuilderConversionContent,
  buildUiBuilderFixPrompt,
  buildUiBuilderFrameworkSystemPrompt,
  buildUiBuilderFrameworkUserContent,
} from "../constants/ui-builder-framework.constant";
import {
  UI_BUILDER_DISCUSS_SYSTEM_PROMPT,
  UI_BUILDER_PLAN_SYSTEM_PROMPT,
  UI_BUILDER_SMALL_CALL_OUTPUT_TOKENS,
  UI_BUILDER_SUGGEST_SYSTEM_PROMPT,
  buildUiBuilderDiscussContent,
  buildUiBuilderMemoryPrompt,
  buildUiBuilderPlanContent,
  buildUiBuilderReferenceImageNote,
  buildUiBuilderSuggestContent,
  formatUiBuilderPlan,
  normalizeUiBuilderPlan,
  normalizeUiBuilderSuggestions,
} from "../constants/ui-builder-planning.constant";
import {
  UI_BUILDER_SYSTEM_PROMPT,
  buildUiBuilderHtmlFixPrompt,
  buildUiBuilderUserContent,
} from "../constants/ui-builder-system-prompt.constant";
import {
  UI_BUILDER_DEFAULT_THEME,
  describeUiBuilderTheme,
} from "../constants/ui-builder-theme.constant";
import {
  UI_BUILDER_VISUAL_REVIEW_OUTPUT_TOKENS,
  UI_BUILDER_VISUAL_REVIEW_SKILL_NAME,
  UI_BUILDER_VISUAL_REVIEW_SYSTEM_PROMPT,
  type UiBuilderVisualIssue,
  type UiBuilderVisualReview,
  buildUiBuilderVisualReviewContent,
  describeUiBuilderVisualIssue,
  normalizeUiBuilderVisualReview,
} from "../constants/ui-builder-visual-review.constant";
import { type CreateUiBuilderVersionPayload, type UiBuilderThemeDto } from "../dtos/ui-builder-dto";
import { type UiBuilderChatStep } from "../types/ui-builder-chat.type";
import { stripUiBuilderBridge } from "../utils/ui-builder-bridge.util";
import {
  applyUiBuilderEditBlocks,
  hasUiBuilderEditBlocks,
  parseUiBuilderEditBlocks,
} from "../utils/ui-builder-edit-blocks.util";
import {
  type UiBuilderBuildDiagnostic,
  buildUiBuilderFrameworkDocument,
} from "../utils/ui-builder-framework-build.util";
import {
  type UiBuilderFrameworkViolation,
  checkUiBuilderRenderedOutput,
  validateUiBuilderFrameworkSource,
  validateUiBuilderHtmlSource,
} from "../utils/ui-builder-framework-validate.util";
import { extractUiBuilderOutline } from "../utils/ui-builder-outline.util";
import {
  type UiBuilderProbeScreenshots,
  probeUiBuilderDocument,
} from "../utils/ui-builder-probe.util";
import { useUiBuilderGeneration } from "./useUiBuilderGeneration.hook";
import { type UiBuilderModelState } from "./useUiBuilderModels.hook";

/** Inputs for one builder turn. */
export type UiBuilderAgentTurn = {
  projectId: string;
  projectName: string;
  model: UiBuilderModelState;
  format: UiBuilderContentFormat;
  headFormat: UiBuilderContentFormat | null;
  prompt: string;
  selectionBlock: string;
  currentHtml: string;
  currentSource: string;
  dataPrompt: string;
  dataSummary: string;
  instructions: string;
  recentPrompts: string[];
  theme: UiBuilderThemeDto | null;
  visualReview: boolean;
  images: string[];
  assets: Record<string, string>;
  assetPrompt: string;
  signal: AbortSignal;
  onSteps: (steps: UiBuilderChatStep[]) => void;
};

/** Inputs for the follow-up suggestion call made after a saved turn. */
export type UiBuilderSuggestRequest = {
  projectId: string;
  projectName: string;
  model: UiBuilderModelState;
  prompt: string;
  outline: string;
};

/** Inputs for a plan-mode reply that discusses the interface without changing it. */
export type UiBuilderDiscussRequest = {
  projectId: string;
  projectName: string;
  model: UiBuilderModelState;
  message: string;
  source: string;
  outline: string;
  dataPrompt: string;
  instructions: string;
  recentPrompts: string[];
  images: string[];
  signal: AbortSignal;
  onText: (text: string) => void;
};

/** Outcome of a builder turn: a payload ready to save, or the reason nothing was saved. */
export type UiBuilderAgentResult =
  | {
      ok: true;
      payload: CreateUiBuilderVersionPayload;
      warnings: UiBuilderFrameworkViolation[];
      outline: string;
    }
  | { ok: false; reason: string };

type UiBuilderArtifact = { source: string; html: string; diagnostics: UiBuilderBuildDiagnostic[] };

const CODE_FENCE_PATTERN = /^\s*```[a-zA-Z]*\s*\n([\s\S]*?)\n?```\s*$/;

const unwrapCodeFence = (output: string) => {
  const match = CODE_FENCE_PATTERN.exec(output);
  return (match ? match[1] : output).trim();
};

const FULL_OUTPUT_CHARACTER_CAP = 200000;
const MAX_REPAIR_PASSES = 2;
const EDIT_OUTPUT_MIN_CHARACTER_CAP = 20000;
const STREAM_IDLE_TIMEOUT_MS = 90000;

const FULL_FRAMEWORK_PATTERN = /export\s+default\s+function/;
const FULL_HTML_PATTERN = /<!doctype html|<html[\s>]/i;

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

const summarizeViolations = (violations: UiBuilderFrameworkViolation[]) => {
  const codes = [...new Set(violations.map((violation) => violation.code))].join(", ");
  return `${violations.length} issue${violations.length === 1 ? "" : "s"} (${codes})`;
};

/**
 * Runs one agentic builder turn: draft, check (static rules plus a live render in an
 * off-screen sandbox), one repair pass when the check fails, and a ready-to-save payload.
 */
export const useUiBuilderAgent = () => {
  const { generateSource, generateJson } = useUiBuilderGeneration();

  const run = async (turn: UiBuilderAgentTurn): Promise<UiBuilderAgentResult> => {
    const isFramework = turn.format === "framework";
    const isConversion = turn.headFormat !== null && turn.headFormat !== turn.format;
    const baseCode = isFramework
      ? turn.currentSource
      : stripUiBuilderRuntime(stripUiBuilderBridge(turn.currentHtml));
    const isEdit = !isConversion && baseCode.trim().length > 0;
    const isNewPage = !isEdit && !isConversion;
    const referenceFiles = turn.images.length > 0 ? turn.images : undefined;
    const imageNote = buildUiBuilderReferenceImageNote(turn.images.length);
    const steps: UiBuilderChatStep[] = [
      ...(isNewPage
        ? [{ id: "plan", label: "Planning the layout", status: "running" as const }]
        : []),
      {
        id: "draft",
        label: isFramework ? "Drafting React component" : "Drafting HTML page",
        status: isNewPage ? "pending" : "running",
      },
      { id: "check", label: "Checking quality in a sandbox", status: "pending" },
      { id: "fix", label: "Repairing issues", status: "pending" },
      ...(turn.visualReview && isFramework
        ? [{ id: "review", label: "Reviewing the design visually", status: "pending" as const }]
        : []),
      { id: "save", label: "Saving version", status: "pending" },
    ];
    const update = (id: string, patch: Partial<UiBuilderChatStep>) => {
      const index = steps.findIndex((step) => step.id === id);
      if (index < 0) return;
      steps[index] = { ...steps[index], ...patch };
      turn.onSteps([...steps]);
    };
    turn.onSteps([...steps]);

    const frameworkSystemPrompt = buildUiBuilderFrameworkSystemPrompt(
      describeUiBuilderTheme(turn.theme ?? UI_BUILDER_DEFAULT_THEME),
    );
    const systemPrompt = `${isFramework ? frameworkSystemPrompt : UI_BUILDER_SYSTEM_PROMPT}${turn.dataPrompt}${turn.assetPrompt}${buildUiBuilderMemoryPrompt(turn.instructions, turn.recentPrompts)}`;
    const passSkillNames = isFramework
      ? [
          ...UI_BUILDER_FRAMEWORK_SKILL_NAMES,
          ...(turn.dataPrompt ? [UI_BUILDER_DATA_VIZ_SKILL_NAME] : []),
        ]
      : undefined;
    const callBase = {
      projectId: turn.projectId,
      projectName: turn.projectName,
      model: turn.model,
      systemPrompt,
      skillNames: passSkillNames,
      signal: turn.signal,
    };

    const stream = async (
      stepId: string,
      userContent: string,
      characterCap: number,
      skillNames: string[] | undefined = passSkillNames,
      files: string[] | undefined = undefined,
    ) => {
      const controller = new AbortController();
      let stopReason: string | null = null;
      const stop = (reason: string) => {
        stopReason = reason;
        controller.abort();
      };
      const forwardAbort = () => controller.abort();
      turn.signal.addEventListener("abort", forwardAbort);

      let idleTimer = 0;
      const armIdleTimer = () => {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(
          () => stop("The model stopped responding, so the turn was ended. Nothing was saved."),
          STREAM_IDLE_TIMEOUT_MS,
        );
      };

      let characters = 0;
      armIdleTimer();
      try {
        const output = await generateSource({
          ...callBase,
          skillNames,
          files,
          signal: controller.signal,
          userContent,
          onDelta: (delta) => {
            armIdleTimer();
            characters += delta.length;
            update(stepId, { detail: `${characters.toLocaleString()} characters` });
            if (characters > characterCap) {
              stop(
                `The model kept writing past ${characterCap.toLocaleString()} characters, so it was stopped. Nothing was saved. Try a more specific request or another model.`,
              );
            }
          },
        });
        return unwrapCodeFence(output);
      } catch (error) {
        if (stopReason && !turn.signal.aborted) throw new Error(stopReason);
        throw error;
      } finally {
        window.clearTimeout(idleTimer);
        turn.signal.removeEventListener("abort", forwardAbort);
      }
    };

    const codeLabel = isFramework ? "JSX source" : "HTML document";
    const editCharacterCap = (code: string) => Math.max(EDIT_OUTPUT_MIN_CHARACTER_CAP, code.length);
    const isFullCode = (output: string) =>
      (isFramework ? FULL_FRAMEWORK_PATTERN : FULL_HTML_PATTERN).test(output);

    const streamEdit = async (
      stepId: string,
      code: string,
      request: string,
      content: string,
      files?: string[],
    ): Promise<{ code: string; detail: string }> => {
      const output = await stream(stepId, content, editCharacterCap(code), passSkillNames, files);
      if (!hasUiBuilderEditBlocks(output)) {
        if (isFullCode(output)) return { code: output, detail: "Rewrote the full page" };
        throw new Error(
          "The model replied without any edits. Nothing was saved — rephrase the request and send again.",
        );
      }

      const first = applyUiBuilderEditBlocks(code, parseUiBuilderEditBlocks(output));
      if (first.failures.length === 0) {
        return { code: first.code, detail: `${plural(first.applied, "edit")} applied` };
      }

      update(stepId, { detail: `Retrying ${plural(first.failures.length, "unmatched edit")}` });
      const retryOutput = await stream(
        stepId,
        buildUiBuilderEditRetryContent(codeLabel, code, request, first.failures),
        editCharacterCap(code),
      );
      const retry = applyUiBuilderEditBlocks(code, parseUiBuilderEditBlocks(retryOutput));
      if (retry.applied === 0 || retry.failures.length > 0) {
        throw new Error(
          `The model's edits did not match the current page (${(retry.failures[0] ?? first.failures[0]).slice(0, 160)}). Nothing was saved — try again or describe the change more specifically.`,
        );
      }
      return { code: retry.code, detail: `${plural(retry.applied, "edit")} applied` };
    };

    const toArtifact = async (output: string): Promise<UiBuilderArtifact> => {
      if (!isFramework) {
        const html = stripUiBuilderRuntime(stripUiBuilderBridge(output));
        return { source: html, html, diagnostics: [] };
      }
      try {
        const built = await buildUiBuilderFrameworkDocument(output, turn.theme);
        return { source: output, html: built.html, diagnostics: built.diagnostics };
      } catch {
        return { source: output, html: "", diagnostics: [] };
      }
    };

    let renderedMarkup = "";
    let lastScreenshots: UiBuilderProbeScreenshots = {};
    const check = async (artifact: UiBuilderArtifact, capture = false) => {
      const staticResult = isFramework
        ? validateUiBuilderFrameworkSource(artifact.source)
        : validateUiBuilderHtmlSource(artifact.source);
      const toViolation = ({ code, detail }: UiBuilderBuildDiagnostic) => ({ code, detail });
      const buildViolations = artifact.diagnostics
        .filter((entry) => entry.blocking)
        .map(toViolation);
      const warnings = [
        ...staticResult.warnings,
        ...artifact.diagnostics.filter((entry) => !entry.blocking).map(toViolation),
      ];
      const violations = [...staticResult.violations, ...buildViolations];
      if (violations.length > 0 || !artifact.html) return { violations, warnings };

      const probe = await probeUiBuilderDocument(artifact.html, { capture, assets: turn.assets });
      renderedMarkup = probe.markup;
      lastScreenshots = probe.screenshots;
      const rendered = checkUiBuilderRenderedOutput(probe);
      return { violations: rendered.violations, warnings };
    };

    const reviewVisually = async (
      reviewedArtifact: UiBuilderArtifact,
      screenshots: UiBuilderProbeScreenshots,
      warnings: UiBuilderFrameworkViolation[],
    ): Promise<{ artifact: UiBuilderArtifact; warnings: UiBuilderFrameworkViolation[] }> => {
      const images = [screenshots.desktop, screenshots.mobile].filter((image): image is string =>
        Boolean(image),
      );
      if (images.length === 0) {
        update("review", { status: "skipped", detail: "The page could not be captured" });
        return { artifact: reviewedArtifact, warnings };
      }

      update("review", { status: "running", detail: undefined });
      let review: UiBuilderVisualReview | null = null;
      try {
        review = normalizeUiBuilderVisualReview(
          await generateJson<unknown>({
            ...callBase,
            systemPrompt: UI_BUILDER_VISUAL_REVIEW_SYSTEM_PROMPT,
            userContent: buildUiBuilderVisualReviewContent(
              turn.prompt,
              extractUiBuilderOutline(renderedMarkup),
            ),
            skillNames: [UI_BUILDER_VISUAL_REVIEW_SKILL_NAME],
            files: images,
            maxOutputTokens: UI_BUILDER_VISUAL_REVIEW_OUTPUT_TOKENS,
          }),
        );
      } catch (error) {
        if (turn.signal.aborted) throw error;
      }
      if (!review) {
        update("review", {
          status: "skipped",
          detail: "This model could not review screenshots",
        });
        return { artifact: reviewedArtifact, warnings };
      }

      const toWarning = (issue: UiBuilderVisualIssue) => ({
        code: "V14",
        detail: describeUiBuilderVisualIssue(issue),
      });
      const blocking = review.issues.filter((issue) => issue.severity === "high");
      const advisory = review.issues.filter((issue) => issue.severity === "medium").map(toWarning);
      if (blocking.length === 0) {
        update("review", {
          status: "done",
          detail: `Score ${review.score}/10${advisory.length > 0 ? ` · ${plural(advisory.length, "suggestion")}` : ""}`,
        });
        return { artifact: reviewedArtifact, warnings: [...warnings, ...advisory] };
      }

      update("review", {
        status: "running",
        detail: `Score ${review.score}/10 · fixing ${plural(blocking.length, "visual issue")}`,
      });
      try {
        const candidate = await repair(blocking.map(toWarning), "review");
        const candidateResult = await check(candidate);
        if (candidateResult.violations.length === 0) {
          update("review", {
            status: "done",
            detail: `Score ${review.score}/10 · fixed ${plural(blocking.length, "visual issue")}`,
          });
          return { artifact: candidate, warnings: [...candidateResult.warnings, ...advisory] };
        }
      } catch (error) {
        if (turn.signal.aborted) throw error;
      }
      update("review", {
        status: "done",
        detail: `Score ${review.score}/10 · visual fixes did not pass the checks, kept the checked version`,
      });
      return {
        artifact: reviewedArtifact,
        warnings: [...warnings, ...blocking.map(toWarning), ...advisory],
      };
    };

    const planDraft = async () => {
      try {
        const plan = normalizeUiBuilderPlan(
          await generateJson<unknown>({
            ...callBase,
            systemPrompt: `${UI_BUILDER_PLAN_SYSTEM_PROMPT}${buildUiBuilderMemoryPrompt(turn.instructions, [])}`,
            userContent: `${buildUiBuilderPlanContent(turn.prompt, turn.dataSummary)}${imageNote}`,
            files: referenceFiles,
            skillNames: undefined,
            maxOutputTokens: UI_BUILDER_SMALL_CALL_OUTPUT_TOKENS,
          }),
        );
        if (!plan) {
          update("plan", { status: "skipped", detail: "No usable plan; drafting directly" });
          return "";
        }
        update("plan", {
          status: "done",
          detail: `${plan.archetype} · ${plan.sections.map((section) => section.name).join(", ")}`,
        });
        return `\n\n${formatUiBuilderPlan(plan)}`;
      } catch (error) {
        if (turn.signal.aborted) throw error;
        update("plan", { status: "skipped", detail: "Planning unavailable; drafting directly" });
        return "";
      }
    };
    const editRequest = turn.selectionBlock
      ? `${turn.prompt}\n\n${turn.selectionBlock}${isFramework ? `\n\n${UI_BUILDER_FRAMEWORK_SELECTION_NOTE}` : ""}`
      : turn.prompt;
    const draftContent = isConversion
      ? buildUiBuilderConversionContent(
          turn.format,
          turn.headFormat === "framework" ? turn.currentSource : turn.currentHtml,
          turn.prompt,
        )
      : isFramework
        ? buildUiBuilderFrameworkUserContent(
            turn.currentSource,
            turn.prompt,
            turn.selectionBlock
              ? `${turn.selectionBlock}\n\n${UI_BUILDER_FRAMEWORK_SELECTION_NOTE}`
              : "",
          )
        : buildUiBuilderUserContent(
            turn.currentHtml,
            turn.selectionBlock ? `${turn.prompt}\n\n${turn.selectionBlock}` : turn.prompt,
          );

    let artifact: UiBuilderArtifact;
    if (isEdit) {
      update("draft", { label: isFramework ? "Editing React component" : "Editing HTML page" });
      const edited = await streamEdit(
        "draft",
        baseCode,
        editRequest,
        `${buildUiBuilderEditContent(codeLabel, baseCode, editRequest)}${imageNote}`,
        referenceFiles,
      );
      if (edited.code.trim() === baseCode.trim()) {
        update("draft", { status: "error", detail: "No changes" });
        update("check", { status: "skipped" });
        update("fix", { status: "skipped" });
        update("save", { status: "skipped" });
        return { ok: false, reason: "The model made no changes, so nothing was saved." };
      }
      artifact = await toArtifact(edited.code);
      update("draft", { status: "done", detail: edited.detail });
    } else {
      const planBlock = isNewPage ? await planDraft() : "";
      update("draft", { status: "running" });
      artifact = await toArtifact(
        await stream(
          "draft",
          `${draftContent}${planBlock}${imageNote}`,
          FULL_OUTPUT_CHARACTER_CAP,
          isNewPage && passSkillNames
            ? [...passSkillNames, UI_BUILDER_ARCHETYPE_SKILL_NAME]
            : passSkillNames,
          referenceFiles,
        ),
      );
      update("draft", { status: "done" });
    }

    const repair = async (problems: UiBuilderFrameworkViolation[], stepId = "fix") => {
      if (isEdit) {
        const fixed = await streamEdit(
          stepId,
          artifact.source,
          turn.prompt,
          buildUiBuilderEditFixContent(codeLabel, artifact.source, turn.prompt, problems),
        );
        return toArtifact(fixed.code);
      }
      const fixContent = isFramework
        ? buildUiBuilderFixPrompt(turn.prompt, artifact.source, problems)
        : buildUiBuilderHtmlFixPrompt(turn.prompt, artifact.source, problems);
      return toArtifact(await stream(stepId, fixContent, FULL_OUTPUT_CHARACTER_CAP));
    };

    const wantsCapture = turn.visualReview && isFramework;
    update("check", { status: "running", detail: undefined });
    let result = await check(artifact, wantsCapture);
    if (turn.signal.aborted) throw new DOMException("Aborted", "AbortError");

    if (result.violations.length > 0) {
      update("check", { status: "error", detail: summarizeViolations(result.violations) });
      for (let pass = 1; pass <= MAX_REPAIR_PASSES && result.violations.length > 0; pass += 1) {
        update("fix", {
          status: "running",
          detail: pass > 1 ? `Pass ${pass}: ${summarizeViolations(result.violations)}` : undefined,
        });
        artifact = await repair(result.violations);
        result = await check(artifact, wantsCapture);
        if (turn.signal.aborted) throw new DOMException("Aborted", "AbortError");
      }

      if (result.violations.length > 0) {
        update("fix", {
          status: "error",
          detail: `Still ${summarizeViolations(result.violations)}`,
        });
        update("review", { status: "skipped" });
        update("save", { status: "skipped" });
        const details = result.violations
          .slice(0, 3)
          .map((violation) => violation.detail)
          .join(" ");
        return {
          ok: false,
          reason: `Quality check failed after ${plural(MAX_REPAIR_PASSES, "repair")}: ${details} Nothing was saved — adjust the prompt and send again.`,
        };
      }
      update("fix", { status: "done", detail: "All issues resolved" });
    } else {
      update("check", {
        status: "done",
        detail:
          result.warnings.length > 0 ? `Passed with ${result.warnings.length} note(s)` : "Passed",
      });
      update("fix", { status: "skipped" });
    }

    if (wantsCapture) {
      const reviewed = await reviewVisually(artifact, lastScreenshots, result.warnings);
      artifact = reviewed.artifact;
      result = { violations: [], warnings: reviewed.warnings };
    }

    update("save", { status: "running" });
    return {
      ok: true,
      warnings: result.warnings,
      outline: extractUiBuilderOutline(renderedMarkup),
      payload: {
        promptText: turn.prompt,
        generatedHtml: artifact.html,
        contentFormat: turn.format,
        sourceArtifact: isFramework ? artifact.source : null,
        provider: turn.model.provider,
        model: turn.model.modelId,
      },
    };
  };

  const suggest = async (request: UiBuilderSuggestRequest): Promise<string[]> => {
    try {
      return normalizeUiBuilderSuggestions(
        await generateJson<unknown>({
          projectId: request.projectId,
          projectName: request.projectName,
          model: request.model,
          systemPrompt: UI_BUILDER_SUGGEST_SYSTEM_PROMPT,
          userContent: buildUiBuilderSuggestContent(request.prompt, request.outline),
          maxOutputTokens: UI_BUILDER_SMALL_CALL_OUTPUT_TOKENS,
        }),
      );
    } catch {
      return [];
    }
  };

  const discuss = async (request: UiBuilderDiscussRequest) => {
    let text = "";
    const output = await generateSource({
      projectId: request.projectId,
      projectName: request.projectName,
      model: request.model,
      systemPrompt: `${UI_BUILDER_DISCUSS_SYSTEM_PROMPT}${request.dataPrompt}${buildUiBuilderMemoryPrompt(request.instructions, request.recentPrompts)}`,
      userContent: buildUiBuilderDiscussContent(request.source, request.outline, request.message),
      files: request.images.length > 0 ? request.images : undefined,
      signal: request.signal,
      onDelta: (delta) => {
        text += delta;
        request.onText(text);
      },
    });
    return output || text;
  };

  return { run, suggest, discuss };
};
