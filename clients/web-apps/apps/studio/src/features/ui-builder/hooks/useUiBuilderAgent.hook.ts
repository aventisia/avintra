import { stripUiBuilderRuntime } from "@avplatform/ui/ui-builder-host";

import {
  buildUiBuilderEditContent,
  buildUiBuilderEditFixContent,
  buildUiBuilderEditRetryContent,
} from "../constants/ui-builder-edit.constant";
import {
  UI_BUILDER_FRAMEWORK_SELECTION_NOTE,
  UI_BUILDER_FRAMEWORK_SKILL_NAMES,
  UI_BUILDER_FRAMEWORK_SYSTEM_PROMPT,
  type UiBuilderContentFormat,
  buildUiBuilderConversionContent,
  buildUiBuilderFixPrompt,
  buildUiBuilderFrameworkUserContent,
} from "../constants/ui-builder-framework.constant";
import {
  UI_BUILDER_SYSTEM_PROMPT,
  buildUiBuilderHtmlFixPrompt,
  buildUiBuilderUserContent,
} from "../constants/ui-builder-system-prompt.constant";
import { type CreateUiBuilderVersionPayload } from "../dtos/ui-builder-dto";
import { type UiBuilderChatStep } from "../types/ui-builder-chat.type";
import { stripUiBuilderBridge } from "../utils/ui-builder-bridge.util";
import {
  applyUiBuilderEditBlocks,
  hasUiBuilderEditBlocks,
  parseUiBuilderEditBlocks,
} from "../utils/ui-builder-edit-blocks.util";
import { buildUiBuilderFrameworkDocument } from "../utils/ui-builder-framework-build.util";
import {
  type UiBuilderFrameworkViolation,
  checkUiBuilderRenderedOutput,
  validateUiBuilderFrameworkSource,
  validateUiBuilderHtmlSource,
} from "../utils/ui-builder-framework-validate.util";
import { probeUiBuilderDocument } from "../utils/ui-builder-probe.util";
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
  signal: AbortSignal;
  onSteps: (steps: UiBuilderChatStep[]) => void;
};

/** Outcome of a builder turn: a payload ready to save, or the reason nothing was saved. */
export type UiBuilderAgentResult =
  | { ok: true; payload: CreateUiBuilderVersionPayload; warnings: UiBuilderFrameworkViolation[] }
  | { ok: false; reason: string };

type UiBuilderArtifact = { source: string; html: string };

const CODE_FENCE_PATTERN = /^\s*```[a-zA-Z]*\s*\n([\s\S]*?)\n?```\s*$/;

const unwrapCodeFence = (output: string) => {
  const match = CODE_FENCE_PATTERN.exec(output);
  return (match ? match[1] : output).trim();
};

const FULL_OUTPUT_CHARACTER_CAP = 200000;
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
  const { generateSource } = useUiBuilderGeneration();

  const run = async (turn: UiBuilderAgentTurn): Promise<UiBuilderAgentResult> => {
    const isFramework = turn.format === "framework";
    const steps: UiBuilderChatStep[] = [
      {
        id: "draft",
        label: isFramework ? "Drafting React component" : "Drafting HTML page",
        status: "running",
      },
      { id: "check", label: "Checking quality in a sandbox", status: "pending" },
      { id: "fix", label: "Repairing issues", status: "pending" },
      { id: "save", label: "Saving version", status: "pending" },
    ];
    const update = (id: string, patch: Partial<UiBuilderChatStep>) => {
      const index = steps.findIndex((step) => step.id === id);
      steps[index] = { ...steps[index], ...patch };
      turn.onSteps([...steps]);
    };
    turn.onSteps([...steps]);

    const systemPrompt = `${isFramework ? UI_BUILDER_FRAMEWORK_SYSTEM_PROMPT : UI_BUILDER_SYSTEM_PROMPT}${turn.dataPrompt}`;
    const callBase = {
      projectId: turn.projectId,
      projectName: turn.projectName,
      model: turn.model,
      systemPrompt,
      skillNames: isFramework ? [...UI_BUILDER_FRAMEWORK_SKILL_NAMES] : undefined,
      signal: turn.signal,
    };

    const stream = async (stepId: string, userContent: string, characterCap: number) => {
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
    ): Promise<{ code: string; detail: string }> => {
      const output = await stream(stepId, content, editCharacterCap(code));
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

    const toArtifact = (output: string): UiBuilderArtifact => {
      if (!isFramework) {
        const html = stripUiBuilderRuntime(stripUiBuilderBridge(output));
        return { source: html, html };
      }
      try {
        return { source: output, html: buildUiBuilderFrameworkDocument(output) };
      } catch {
        return { source: output, html: "" };
      }
    };

    const check = async (artifact: UiBuilderArtifact) => {
      const staticResult = isFramework
        ? validateUiBuilderFrameworkSource(artifact.source)
        : validateUiBuilderHtmlSource(artifact.source);
      if (staticResult.violations.length > 0 || !artifact.html) return staticResult;

      const rendered = checkUiBuilderRenderedOutput(await probeUiBuilderDocument(artifact.html));
      return { violations: rendered.violations, warnings: staticResult.warnings };
    };

    const isConversion = turn.headFormat !== null && turn.headFormat !== turn.format;
    const baseCode = isFramework
      ? turn.currentSource
      : stripUiBuilderRuntime(stripUiBuilderBridge(turn.currentHtml));
    const isEdit = !isConversion && baseCode.trim().length > 0;
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
        buildUiBuilderEditContent(codeLabel, baseCode, editRequest),
      );
      if (edited.code.trim() === baseCode.trim()) {
        update("draft", { status: "error", detail: "No changes" });
        update("check", { status: "skipped" });
        update("fix", { status: "skipped" });
        update("save", { status: "skipped" });
        return { ok: false, reason: "The model made no changes, so nothing was saved." };
      }
      artifact = toArtifact(edited.code);
      update("draft", { status: "done", detail: edited.detail });
    } else {
      artifact = toArtifact(await stream("draft", draftContent, FULL_OUTPUT_CHARACTER_CAP));
      update("draft", { status: "done" });
    }

    update("check", { status: "running", detail: undefined });
    let result = await check(artifact);
    if (turn.signal.aborted) throw new DOMException("Aborted", "AbortError");

    if (result.violations.length > 0) {
      update("check", { status: "error", detail: summarizeViolations(result.violations) });
      update("fix", { status: "running", detail: undefined });

      if (isEdit) {
        const fixed = await streamEdit(
          "fix",
          artifact.source,
          turn.prompt,
          buildUiBuilderEditFixContent(codeLabel, artifact.source, turn.prompt, result.violations),
        );
        artifact = toArtifact(fixed.code);
      } else {
        const fixContent = isFramework
          ? buildUiBuilderFixPrompt(turn.prompt, artifact.source, result.violations)
          : buildUiBuilderHtmlFixPrompt(turn.prompt, artifact.source, result.violations);
        artifact = toArtifact(await stream("fix", fixContent, FULL_OUTPUT_CHARACTER_CAP));
      }
      result = await check(artifact);

      if (result.violations.length > 0) {
        update("fix", {
          status: "error",
          detail: `Still ${summarizeViolations(result.violations)}`,
        });
        update("save", { status: "skipped" });
        const details = result.violations
          .slice(0, 3)
          .map((violation) => violation.detail)
          .join(" ");
        return {
          ok: false,
          reason: `Quality check failed after one repair: ${details} Nothing was saved — adjust the prompt and send again.`,
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

    update("save", { status: "running" });
    return {
      ok: true,
      warnings: result.warnings,
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

  return { run };
};
