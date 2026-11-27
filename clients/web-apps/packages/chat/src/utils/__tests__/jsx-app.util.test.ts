import { describe, expect, it } from "vitest";

import { buildJsxAppPage } from "../jsx-app.util";

type FakeElement = { type: unknown; props: unknown; children: FakeElement[] };

const inlineScript = (page: string) => {
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  return scripts.at(-1)![1]!;
};

const run = (page: string) => {
  const root = { textContent: "", innerHTML: "" };
  const rendered: unknown[] = [];
  const React = {
    createElement: (type: unknown, props: unknown, ...children: FakeElement[]): FakeElement => ({
      type,
      props,
      children,
    }),
    useState: () => "stub-use-state",
    Component: class {},
  };
  const ReactDOM = { createRoot: () => ({ render: (element: unknown) => rendered.push(element) }) };
  const document = { getElementById: () => root };
  new Function("window", "document", inlineScript(page))({ React, ReactDOM }, document);
  return { root, rendered };
};

describe("buildJsxAppPage", () => {
  it("compiles JSX and mounts the default export", async () => {
    const page = await buildJsxAppPage(
      'import React from "react"; export default function App() { return <h1>Hi</h1>; }',
      "App.jsx",
    );
    const { rendered } = run(page);

    expect(rendered).toHaveLength(1);
    expect(page).not.toMatch(/\bimport\s+React/);
    const app = (rendered[0] as FakeElement).children[0]!.type as () => FakeElement;
    expect(app.name).toBe("App");
    expect(app().type).toBe("h1");
  });

  it("accepts named React imports", async () => {
    const page = await buildJsxAppPage(
      'import { useState } from "react"; export const probe = useState; export default () => null;',
      "App.jsx",
    );

    expect(() => run(page)).not.toThrow();
  });

  it("loads pinned React, ReactDOM and Tailwind with integrity", async () => {
    const page = await buildJsxAppPage("export default () => null;", "App.jsx");

    expect(page.match(/integrity="sha384-/g)).toHaveLength(3);
    expect(page).toContain("react/18.3.1/umd/react.production.min.js");
    expect(page).toContain("react-dom/18.3.1/umd/react-dom.production.min.js");
    expect(page).toContain("@tailwindcss/browser@");
  });

  it("shows a compile error instead of a blank page", async () => {
    const page = await buildJsxAppPage("export default function App( {", "App.jsx");

    expect(page).toContain("Could not compile");
    expect(page).not.toContain("<script src=");
  });

  it("keeps </script> inside the source from ending the script", async () => {
    const page = await buildJsxAppPage('export default () => "</script><p>oops</p>";', "App.jsx");

    expect(page.match(/<\/script>/g)!.length).toBe(page.match(/<script/g)!.length);
  });

  it("rejects imports other than react", async () => {
    const page = await buildJsxAppPage(
      'import x from "lodash"; export default () => x;',
      "App.jsx",
    );
    const { root } = run(page);

    expect(root.textContent + root.innerHTML).toContain("lodash");
  });

  it("explains a missing default export", async () => {
    const page = await buildJsxAppPage("export const a = 1;", "App.jsx");
    const { root } = run(page);

    expect(root.textContent + root.innerHTML).toContain("export default");
  });

  it("runs top-level JSX when React is only imported by name", async () => {
    const page = await buildJsxAppPage(
      'import { useState } from "react"; const icon = <b />; export const probe = useState; export default function App() { return icon; }',
      "App.jsx",
    );
    const { root, rendered } = run(page);

    expect(root.textContent).toBe("");
    expect(rendered).toHaveLength(1);
  });

  it("keeps an HTML comment opener in the source from swallowing the closing script tag", async () => {
    const page = await buildJsxAppPage(
      'const s = "<!--<script>"; export default () => <p>{s}</p>;',
      "App.jsx",
    );

    expect(inlineScript(page)).not.toContain("<!--");
    const { root, rendered } = run(page);
    expect(root.textContent).toBe("");
    expect(rendered).toHaveLength(1);
  });

  it("escapes the title", async () => {
    const page = await buildJsxAppPage("export default () => null;", 'A <b> & "c"');

    expect(page).toContain("<title>A &lt;b&gt; &amp; &quot;c&quot;</title>");
  });
});
