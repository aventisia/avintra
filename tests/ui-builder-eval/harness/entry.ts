import { buildUiBuilderFrameworkDocument } from "../../../clients/web-apps/apps/studio/src/features/ui-builder/utils/ui-builder-framework-build.util";
import {
  checkUiBuilderRenderedOutput,
  validateUiBuilderFrameworkSource,
} from "../../../clients/web-apps/apps/studio/src/features/ui-builder/utils/ui-builder-framework-validate.util";
import { probeUiBuilderDocument } from "../../../clients/web-apps/apps/studio/src/features/ui-builder/utils/ui-builder-probe.util";

type EvalWindow = Window & { evaluateSource: (source: string) => Promise<unknown> };

(window as unknown as EvalWindow).evaluateSource = async (source: string) => {
  const started = performance.now();
  const staticResult = validateUiBuilderFrameworkSource(source);
  let built: Awaited<ReturnType<typeof buildUiBuilderFrameworkDocument>> | null = null;
  try {
    built = await buildUiBuilderFrameworkDocument(source, null);
  } catch (error) {
    return { buildError: String(error), staticResult };
  }
  const probe = await probeUiBuilderDocument(built.html, { capture: true });
  const rendered = checkUiBuilderRenderedOutput(probe);
  return {
    staticResult,
    diagnostics: built.diagnostics,
    rendered,
    runtimeErrors: probe.errors,
    timedOut: probe.timedOut,
    builtBytes: built.html.length,
    screenshots: probe.screenshots,
    milliseconds: Math.round(performance.now() - started),
  };
};
