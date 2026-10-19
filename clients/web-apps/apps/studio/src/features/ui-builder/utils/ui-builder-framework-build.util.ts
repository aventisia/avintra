import { transform } from "sucrase";
import reactRuntime from "virtual:ui-builder-runtime/react";
import reactDomRuntime from "virtual:ui-builder-runtime/react-dom";

import frameworkCss from "../../../../ui-builder-framework.css?inline";

/** Marker stamped on built framework documents so hosts and tools can recognise them. */
export const UI_BUILDER_FRAMEWORK_DOCUMENT_MARKER = 'name="avintra-format" content="react"';

const escapeInlineScript = (code: string) =>
  code.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");

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

const CLASS_SELECTOR_PATTERN = /\.((?:\\.|[A-Za-z0-9_-])+)/g;
const SOURCE_TOKEN_PATTERN = /[A-Za-z0-9_:/.[\]%#-]+/g;

const collectSourceTokens = (source: string) => new Set(source.match(SOURCE_TOKEN_PATTERN) ?? []);

const selectorClassNames = (selector: string) =>
  [...selector.matchAll(CLASS_SELECTOR_PATTERN)].map((match) => match[1].replace(/\\(.)/g, "$1"));

const findBlockEnd = (css: string, openIndex: number) => {
  let depth = 0;
  for (let index = openIndex; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    else if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return css.length - 1;
};

const pruneCssBlock = (css: string, used: Set<string>): string => {
  const kept: string[] = [];
  let cursor = 0;

  while (cursor < css.length) {
    const openIndex = css.indexOf("{", cursor);
    if (openIndex === -1) break;
    const prelude = css.slice(cursor, openIndex).trim();
    const closeIndex = findBlockEnd(css, openIndex);
    const body = css.slice(openIndex + 1, closeIndex);
    cursor = closeIndex + 1;

    if (/^@(media|supports)\b/.test(prelude)) {
      const inner = pruneCssBlock(body, used);
      if (inner) kept.push(`${prelude}{${inner}}`);
      continue;
    }

    const classNames = prelude.startsWith("@") ? [] : selectorClassNames(prelude);
    const isUsed = classNames.length === 0 || classNames.some((name) => used.has(name));
    if (isUsed) kept.push(`${prelude}{${body}}`);
  }

  return kept.join("");
};

/**
 * Keeps only the design-system rules a source can use: base rules plus every utility whose
 * class name appears anywhere in the source (class names built in expressions included).
 */
export const pruneUiBuilderFrameworkCss = (source: string, css: string = frameworkCss) =>
  pruneCssBlock(css, collectSourceTokens(source));

/** Transpiles a framework JSX source into a CommonJS-style module body. */
export const transpileUiBuilderFrameworkSource = (source: string): string =>
  transform(source, {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "classic",
    production: true,
  }).code;

/**
 * Wraps compiled framework code into a standalone document that mounts it live with an
 * inlined React runtime and the precompiled design-system styles.
 *
 * The generated code is never evaluated in the studio; it runs only inside the sandboxed
 * preview frame, where the host injects a network-blocking CSP and the Avintra runtime.
 */
export const wrapUiBuilderFrameworkDocument = (
  compiledSource: string,
  css: string = frameworkCss,
) =>
  [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<meta ${UI_BUILDER_FRAMEWORK_DOCUMENT_MARKER} />`,
    `<style>${css}</style>`,
    "</head>",
    "<body>",
    '<div id="root"></div>',
    `<script>${escapeInlineScript(reactRuntime)}</script>`,
    `<script>${escapeInlineScript(reactDomRuntime)}</script>`,
    "<script>",
    "(function () {",
    "  var exports = {};",
    "  var module = { exports: exports };",
    "  try {",
    `    (function (React, Avintra, exports, module) {\n${escapeInlineScript(compiledSource)}\n    })(window.React, window.Avintra, exports, module);`,
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

/** Builds the standalone document for a framework JSX source. */
export const buildUiBuilderFrameworkDocument = (source: string): string =>
  wrapUiBuilderFrameworkDocument(
    transpileUiBuilderFrameworkSource(source),
    pruneUiBuilderFrameworkCss(source),
  );
