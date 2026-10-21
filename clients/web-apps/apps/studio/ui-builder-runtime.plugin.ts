import { build } from "esbuild";
import { readFileSync, readdirSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { type Plugin } from "vite";

const PLUGIN_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const requireFromApp = createRequire(path.resolve(PLUGIN_DIRECTORY, "package.json"));

const packageDirectory = (packageName: string) =>
  path.dirname(requireFromApp.resolve(`${packageName}/package.json`));

const resolvePackageFile = (packageName: string, file: string) =>
  path.join(packageDirectory(packageName), file);

const KIT_DIRECTORY = path.resolve(PLUGIN_DIRECTORY, "src/features/ui-builder/kit");
const SOURCE_TOKEN_PATTERN = /[A-Za-z0-9_:/.[\]%#()=,&>*+-]+/g;

const REACT_SHIMS: Record<string, string> = {
  react: "module.exports = window.React;",
  "react-dom": "module.exports = window.ReactDOM;",
  "react-dom/client": "module.exports = window.ReactDOM;",
  "react/jsx-runtime": [
    "var React = window.React;",
    "function jsx(type, config, key) {",
    "  var props = Object.assign({}, config);",
    "  if (key !== undefined) props.key = key;",
    "  return React.createElement(type, props);",
    "}",
    "module.exports = { jsx: jsx, jsxs: jsx, Fragment: React.Fragment };",
  ].join("\n"),
};

const buildKitBundle = async () => {
  const result = await build({
    entryPoints: [path.join(KIT_DIRECTORY, "index.ts")],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: "es2020",
    minify: true,
    legalComments: "none",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "avintra-kit-react-shim",
        setup: (pluginBuild) => {
          pluginBuild.onResolve(
            { filter: /^(react|react-dom|react-dom\/client|react\/jsx-runtime)$/ },
            (args) => ({
              path: args.path,
              namespace: "avintra-kit-shim",
            }),
          );
          pluginBuild.onLoad({ filter: /.*/, namespace: "avintra-kit-shim" }, (args) => ({
            contents: REACT_SHIMS[args.path],
            loader: "js",
          }));
        },
      },
    ],
  });
  return result.outputFiles[0].text;
};

const collectKitCandidates = () => {
  const tokens = new Set<string>();
  for (const file of readdirSync(KIT_DIRECTORY)) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(path.join(KIT_DIRECTORY, file), "utf8");
    for (const literal of source.match(/"[^"\n]*"|`[^`]*`/g) ?? []) {
      for (const token of literal.slice(1, -1).match(SOURCE_TOKEN_PATTERN) ?? []) tokens.add(token);
    }
  }
  return [...tokens];
};

const ICON_EXPORT_PATTERN = /export \{ ([^}]+) \} from '\.\/icons\/([a-z0-9-]+)\.js';/g;
const ICON_NODE_PATTERN = /createLucideIcon\("[^"]+", (\[[\s\S]*?\])\);/;

const collectIcons = () => {
  const lucideDirectory = resolvePackageFile("lucide-react", "dist/esm");
  const index = readFileSync(path.join(lucideDirectory, "lucide-react.js"), "utf8");
  const nodes: Record<string, unknown> = {};
  const names: Record<string, string> = {};

  for (const [, exportList, fileKey] of index.matchAll(ICON_EXPORT_PATTERN)) {
    if (!nodes[fileKey]) {
      const iconSource = readFileSync(path.join(lucideDirectory, "icons", `${fileKey}.js`), "utf8");
      const nodeSource = ICON_NODE_PATTERN.exec(iconSource)?.[1];
      if (!nodeSource) continue;
      const node = new Function(`return ${nodeSource};`)() as [string, Record<string, string>][];
      nodes[fileKey] = node.map(([tag, attributes]) => [
        tag,
        Object.fromEntries(Object.entries(attributes).filter(([name]) => name !== "key")),
      ]);
    }
    for (const alias of exportList
      .split(",")
      .map((entry) => entry.trim().replace(/^default as /, ""))) {
      if (alias.endsWith("Icon") || alias.startsWith("Lucide")) continue;
      names[alias] = fileKey;
    }
  }

  return { nodes, names };
};

const VIRTUAL_PREFIX = "virtual:ui-builder-runtime/";

/**
 * Serves the UI builder's inlined runtime assets as virtual modules: the React UMD builds, the
 * runtime kit bundle and its class candidates, the lucide icon registry, the Inter font, and the
 * Tailwind v4 stylesheet compiled in the browser for each built document.
 */
export const uiBuilderRuntimePlugin = (): Plugin => {
  const loaders: Record<string, () => Promise<string> | string> = {
    react: () =>
      `export default ${JSON.stringify(readFileSync(resolvePackageFile("react", "umd/react.production.min.js"), "utf8"))};`,
    "react-dom": () =>
      `export default ${JSON.stringify(readFileSync(resolvePackageFile("react-dom", "umd/react-dom.production.min.js"), "utf8"))};`,
    kit: async () =>
      `export default ${JSON.stringify(await buildKitBundle())};\nexport const kitCandidates = ${JSON.stringify(collectKitCandidates())};`,
    icons: () => `export default ${JSON.stringify(collectIcons())};`,
    "inter-font": () =>
      `export default ${JSON.stringify(
        readFileSync(
          resolvePackageFile("@fontsource-variable/inter", "files/inter-latin-wght-normal.woff2"),
        ).toString("base64"),
      )};`,
    "tailwind-css": () =>
      `export default ${JSON.stringify(readFileSync(resolvePackageFile("tailwindcss-v4", "index.css"), "utf8"))};`,
  };

  return {
    name: "ui-builder-runtime",
    resolveId: (id) =>
      id.startsWith(VIRTUAL_PREFIX) && id.slice(VIRTUAL_PREFIX.length) in loaders
        ? `\0${id}`
        : null,
    load: (id) => {
      if (!id.startsWith(`\0${VIRTUAL_PREFIX}`)) return null;
      return loaders[id.slice(VIRTUAL_PREFIX.length + 1)]();
    },
    handleHotUpdate: ({ file, server }) => {
      if (!file.startsWith(KIT_DIRECTORY)) return;
      const module = server.moduleGraph.getModuleById(`\0${VIRTUAL_PREFIX}kit`);
      if (module) server.moduleGraph.invalidateModule(module);
    },
  };
};
