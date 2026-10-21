import { transform } from "sucrase";
import { compile } from "tailwindcss-v4";
import reactRuntime from "virtual:ui-builder-runtime/react";
import reactDomRuntime from "virtual:ui-builder-runtime/react-dom";

import {
  UI_BUILDER_DEFAULT_THEME,
  buildUiBuilderThemeCss,
} from "../constants/ui-builder-theme.constant";
import { type UiBuilderThemeDto } from "../dtos/ui-builder-dto";
import { KIT_ICON_NAMES } from "../kit/icons";
import {
  UI_BUILDER_KIT_CHART_MEMBERS,
  UI_BUILDER_KIT_UI_MEMBERS,
  UI_BUILDER_KIT_VERSION,
} from "../kit/kit-manifest.constant";
import { instrumentUiBuilderSource } from "./ui-builder-source-map.util";

/** Marker stamped on built framework documents so hosts and tools can recognise them. */
export const UI_BUILDER_FRAMEWORK_DOCUMENT_MARKER = 'name="avintra-format" content="react"';

/** A problem found while building a framework document. */
export type UiBuilderBuildDiagnostic = { code: string; detail: string; blocking: boolean };

/** A built framework document with the problems found while building it. */
export type UiBuilderFrameworkBuild = { html: string; diagnostics: UiBuilderBuildDiagnostic[] };

type IconRegistry = { nodes: Record<string, unknown>; names: Record<string, string> };

const UNKNOWN_CLASS_BLOCKING_THRESHOLD = 3;
const MARKER_CLASSES = /^(group|peer)(\/[\w-]+)?$|^(dark|light|not-prose|prose)$/;
const SOURCE_TOKEN_PATTERN = /[A-Za-z0-9_:/.[\]%#()=,&>*+-]+/g;
const CLASS_NAME_LITERAL_PATTERN = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`$]*)`\s*\})/g;
const ICON_MEMBER_PATTERN = /\bIcons\.([A-Za-z][A-Za-z0-9]*)/g;
const ICON_PROP_PATTERN = /\bicon(?:Right)?\s*[=:]\s*\{?\s*["']([A-Z][A-Za-z0-9]*)["']/g;
const KIT_MEMBER_PATTERN = /\b(UI|Charts)\.([A-Za-z_$][\w$]*)/g;
const KIT_DESTRUCTURE_PATTERN = /\{([^{}]*)\}\s*=\s*(UI|Charts)\b/g;

const UI_MEMBERS = new Set<string>(UI_BUILDER_KIT_UI_MEMBERS);
const CHART_MEMBERS = new Set<string>(UI_BUILDER_KIT_CHART_MEMBERS);

const escapeInlineScript = (code: string) =>
  code.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");

let runtimePromise: Promise<{
  kit: string;
  kitCandidates: string[];
  icons: IconRegistry;
  tailwindCss: string;
  interFont: string;
}> | null = null;

const loadRuntime = () => {
  runtimePromise ??= Promise.all([
    import("virtual:ui-builder-runtime/kit"),
    import("virtual:ui-builder-runtime/icons"),
    import("virtual:ui-builder-runtime/tailwind-css"),
    import("virtual:ui-builder-runtime/inter-font"),
  ]).then(([kit, icons, tailwindCss, interFont]) => ({
    kit: kit.default,
    kitCandidates: kit.kitCandidates,
    icons: icons.default,
    tailwindCss: tailwindCss.default,
    interFont: interFont.default,
  }));
  return runtimePromise;
};

const normalizeIconName = (name: string) => name.replace(/^Lucide/, "").replace(/Icon$/, "");

const resolveIcon = (icons: IconRegistry, name: string) =>
  icons.names[name] ?? icons.names[normalizeIconName(name)];

const suggestIcons = (icons: IconRegistry, name: string) => {
  const needle = normalizeIconName(name).toLowerCase();
  const stem = needle.slice(0, Math.max(3, Math.ceil(needle.length / 2)));
  return Object.keys(icons.names)
    .filter((candidate) => candidate.toLowerCase().includes(stem))
    .slice(0, 5);
};

/** Lists the icon names a source refers to through `Icons.X` or an `icon="X"` prop. */
export const collectUiBuilderIconNames = (source: string) => {
  const names = new Set<string>();
  for (const match of source.matchAll(ICON_MEMBER_PATTERN)) names.add(match[1]);
  for (const match of source.matchAll(ICON_PROP_PATTERN)) names.add(match[1]);
  return [...names];
};

/** Lists the static utility classes a source writes in `className` literals. */
export const collectUiBuilderClassNames = (source: string) => {
  const names = new Set<string>();
  for (const match of source.matchAll(CLASS_NAME_LITERAL_PATTERN)) {
    for (const token of (match[1] ?? match[2] ?? match[3] ?? "").split(/\s+/)) {
      if (token) names.add(token);
    }
  }
  return [...names];
};

const collectKitMembers = (source: string) => {
  const used: { group: "UI" | "Charts"; name: string }[] = [];
  for (const match of source.matchAll(KIT_MEMBER_PATTERN)) {
    used.push({ group: match[1] as "UI" | "Charts", name: match[2] });
  }
  for (const match of source.matchAll(KIT_DESTRUCTURE_PATTERN)) {
    for (const entry of match[1].split(",")) {
      const name = entry.split(":")[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) used.push({ group: match[2] as "UI" | "Charts", name });
    }
  }
  return used;
};

const compiledThemes = new Map<string, Promise<Awaited<ReturnType<typeof compile>>>>();

const compileTheme = (theme: UiBuilderThemeDto, tailwindCss: string) => {
  const key = JSON.stringify(theme);
  let compiled = compiledThemes.get(key);
  if (!compiled) {
    compiled = compile(buildUiBuilderThemeCss(theme, tailwindCss), {
      loadStylesheet: async (id, base) => ({ path: id, base, content: tailwindCss }),
    });
    compiledThemes.set(key, compiled);
  }
  return compiled;
};

const hasClassRule = (css: string, className: string) => css.includes(`.${CSS.escape(className)}`);

const buildFontFace = (theme: UiBuilderThemeDto, interFont: string) =>
  theme.fontFamily === "inter"
    ? `@font-face{font-family:"Inter Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url(data:font/woff2;base64,${interFont}) format("woff2-variations");}`
    : "";

/** Transpiles a framework JSX source into a CommonJS-style module body. */
export const transpileUiBuilderFrameworkSource = (source: string): string =>
  transform(source, {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "classic",
    production: true,
  }).code;

const MOUNT_SCRIPT = `(function () {
  var Avintra = window.Avintra || { reportError: function () {}, ready: function () {} };
  var App = window.__AVINTRA_MODULE__ && window.__AVINTRA_MODULE__.default;
  if (typeof App !== "function") {
    if (!window.__AVINTRA_MODULE_FAILED__) Avintra.reportError("The generated module did not export a component.");
    return;
  }
  function Boundary(props) {
    React.Component.call(this, props);
    this.state = { error: null };
  }
  Boundary.prototype = Object.create(React.Component.prototype);
  Boundary.prototype.constructor = Boundary;
  Boundary.getDerivedStateFromError = function (error) { return { error: error }; };
  Boundary.prototype.componentDidCatch = function (error, info) {
    Avintra.reportError(error && error.message, String((error && error.stack) || "") + String((info && info.componentStack) || ""));
  };
  Boundary.prototype.render = function () {
    if (!this.state.error) return this.props.children;
    return React.createElement("div", { role: "alert", style: { margin: "2rem", padding: "1rem 1.25rem", borderRadius: "0.75rem", border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", fontFamily: "system-ui, sans-serif", fontSize: "14px" } },
      "This interface ran into a problem: " + String(this.state.error && this.state.error.message || this.state.error));
  };
  var root = ReactDOM.createRoot(document.getElementById("root"));
  ReactDOM.flushSync(function () {
    root.render(React.createElement(Boundary, null, React.createElement(App)));
  });
  Avintra.ready();
})();`;

const wrapDocument = ({
  compiledSource,
  css,
  fontFace,
  icons,
  kit,
}: {
  compiledSource: string;
  css: string;
  fontFace: string;
  icons: Record<string, unknown>;
  kit: string;
}) =>
  [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<meta ${UI_BUILDER_FRAMEWORK_DOCUMENT_MARKER} />`,
    `<meta name="avintra-kit" content="${UI_BUILDER_KIT_VERSION}" />`,
    `<style>${fontFace}${css}</style>`,
    "</head>",
    "<body>",
    '<div id="root"></div>',
    `<script>${escapeInlineScript(reactRuntime)}</script>`,
    `<script>${escapeInlineScript(reactDomRuntime)}</script>`,
    `<script>window.__AVINTRA_ICONS__ = ${escapeInlineScript(JSON.stringify(icons))};</script>`,
    `<script>${escapeInlineScript(kit)}</script>`,
    "<script>",
    "(function () {",
    "  var exports = {};",
    "  var module = { exports: exports };",
    "  var kit = window.AvintraKit || {};",
    "  try {",
    `    (function (React, Avintra, UI, Charts, Icons, exports, module) {\n${escapeInlineScript(compiledSource)}\n    })(window.React, window.Avintra, kit.UI, kit.Charts, kit.Icons, exports, module);`,
    "    window.__AVINTRA_MODULE__ = module.exports && module.exports.default ? module.exports : exports;",
    "  } catch (error) {",
    "    window.__AVINTRA_MODULE_FAILED__ = true;",
    "    if (window.Avintra) window.Avintra.reportError(error && error.message, error && error.stack);",
    "  }",
    "})();",
    "</script>",
    `<script>${MOUNT_SCRIPT}</script>`,
    "</body>",
    "</html>",
  ].join("\n");

/**
 * Builds the standalone document for a framework JSX source: transpiles it, compiles exactly the
 * Tailwind utilities it and the runtime kit use against the project theme, inlines only the icons
 * it names, and reports unknown classes, icons, and kit members as diagnostics.
 *
 * The generated code is never evaluated in the studio; it runs only inside the sandboxed preview
 * frame, where the host injects a network-blocking CSP and the Avintra runtime.
 */
export const buildUiBuilderFrameworkDocument = async (
  source: string,
  theme: UiBuilderThemeDto | null | undefined,
): Promise<UiBuilderFrameworkBuild> => {
  const compiledSource = transpileUiBuilderFrameworkSource(instrumentUiBuilderSource(source));
  const runtime = await loadRuntime();
  const effectiveTheme = theme ?? UI_BUILDER_DEFAULT_THEME;
  const diagnostics: UiBuilderBuildDiagnostic[] = [];

  const candidates = new Set([
    ...(source.match(SOURCE_TOKEN_PATTERN) ?? []),
    ...runtime.kitCandidates,
  ]);
  const compiler = await compileTheme(effectiveTheme, runtime.tailwindCss);
  const css = compiler.build([...candidates]);

  const unknownClasses = collectUiBuilderClassNames(source).filter(
    (className) => !MARKER_CLASSES.test(className) && !hasClassRule(css, className),
  );
  if (unknownClasses.length > 0) {
    diagnostics.push({
      code: "V5",
      detail: `These classes are not valid Tailwind utilities or theme tokens and render unstyled: ${unknownClasses.slice(0, 20).join(", ")}.`,
      blocking: unknownClasses.length >= UNKNOWN_CLASS_BLOCKING_THRESHOLD,
    });
  }

  const icons: Record<string, unknown> = {};
  const unknownIcons: string[] = [];
  for (const name of [...KIT_ICON_NAMES, ...collectUiBuilderIconNames(source)]) {
    const fileKey = resolveIcon(runtime.icons, name);
    if (fileKey) icons[name] = runtime.icons.nodes[fileKey];
    else unknownIcons.push(name);
  }
  for (const name of unknownIcons) {
    const suggestions = suggestIcons(runtime.icons, name);
    diagnostics.push({
      code: "V11",
      detail: `Icons.${name} is not a lucide icon.${suggestions.length > 0 ? ` Close matches: ${suggestions.join(", ")}.` : ""}`,
      blocking: true,
    });
  }

  for (const { group, name } of collectKitMembers(source)) {
    const known = group === "UI" ? UI_MEMBERS : CHART_MEMBERS;
    if (!known.has(name)) {
      diagnostics.push({
        code: "V12",
        detail: `${group}.${name} does not exist. Available ${group} members: ${[...known].join(", ")}.`,
        blocking: true,
      });
    }
  }

  return {
    html: wrapDocument({
      compiledSource,
      css,
      fontFace: buildFontFace(effectiveTheme, runtime.interFont),
      icons,
      kit: runtime.kit,
    }),
    diagnostics,
  };
};
