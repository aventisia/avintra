import React, { type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "sucrase";

import frameworkCss from "../../../../ui-builder-framework.css?inline";
import { stripUiBuilderBridge } from "./ui-builder-bridge.util";

const SHADOWED_GLOBAL_NAMES = [
  "window",
  "document",
  "globalThis",
  "self",
  "location",
  "navigator",
  "localStorage",
  "sessionStorage",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "importScripts",
  "Function",
  "setTimeout",
  "setInterval",
  "requestAnimationFrame",
  "queueMicrotask",
  "Promise",
  "process",
  "structuredClone",
] as const;

const evaluateFrameworkModule = (compiledSource: string): unknown => {
  const exportsObject: Record<string, unknown> = {};

  // IMPORTANT NOTE: generated source is untrusted; it is evaluated with network and browser
  // sinks shadowed as undefined parameters so the component scope cannot reach them. `eval`
  // cannot be shadowed this way in strict mode, so the validator rejects `eval(` instead.
  const factory = new Function(
    "React",
    "exports",
    "require",
    "module",
    ...SHADOWED_GLOBAL_NAMES,
    `${compiledSource}\nreturn exports.default;`,
  ) as (...args: unknown[]) => unknown;

  return factory(
    React,
    exportsObject,
    undefined,
    { exports: exportsObject },
    ...SHADOWED_GLOBAL_NAMES.map(() => undefined),
  );
};

/** Transpiles a framework JSX source into evaluable JavaScript. */
export const transpileUiBuilderFrameworkSource = (source: string): string =>
  transform(source, {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "classic",
    production: true,
  }).code;

/** Renders transpiled framework JavaScript into static HTML markup. */
export const renderUiBuilderFrameworkMarkup = (compiledSource: string): string => {
  const component = evaluateFrameworkModule(compiledSource);

  if (typeof component !== "function") {
    throw new Error("The generated module did not export a component.");
  }

  const markup = renderToStaticMarkup(React.createElement(component as ComponentType));
  return stripUiBuilderBridge(markup);
};

/** Wraps static markup into a standalone document with the inlined framework styles. */
export const wrapUiBuilderFrameworkDocument = (
  markup: string,
  css: string = frameworkCss,
): string =>
  [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<style>${css}</style>`,
    "</head>",
    `<body>${markup}</body>`,
    "</html>",
  ].join("");

/** Builds the standalone document for a framework JSX source. */
export const buildUiBuilderFrameworkDocument = (source: string): string =>
  wrapUiBuilderFrameworkDocument(
    renderUiBuilderFrameworkMarkup(transpileUiBuilderFrameworkSource(source)),
  );
