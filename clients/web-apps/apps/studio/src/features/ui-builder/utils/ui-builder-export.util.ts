import { prepareUiBuilderDocument } from "@avplatform/ui/ui-builder-host";

const toFileStem = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "interface";

const download = (fileName: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** Downloads a version as one standalone HTML file with the runtime and project images inlined. */
export const downloadUiBuilderHtml = (
  projectName: string,
  versionNumber: number | undefined,
  html: string,
  assets: Record<string, string>,
) =>
  download(
    `${toFileStem(projectName)}${versionNumber ? `-v${versionNumber}` : ""}.html`,
    prepareUiBuilderDocument(html, { assets }),
    "text/html",
  );

/** Downloads a React version's component source. */
export const downloadUiBuilderSource = (
  projectName: string,
  versionNumber: number | undefined,
  source: string,
) =>
  download(
    `${toFileStem(projectName)}${versionNumber ? `-v${versionNumber}` : ""}.jsx`,
    source,
    "text/javascript",
  );
