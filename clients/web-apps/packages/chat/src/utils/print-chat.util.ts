const PRINT_CSS = `
@page { margin: 14mm; }
body { margin: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
[data-chat-transcript] { overflow: visible !important; height: auto !important; padding: 0 !important; }
pre, table, svg, img { break-inside: avoid; }
`;

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (char) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot" }[char]};`);

const stylesheetLoaded = (link: HTMLLinkElement) =>
  link.sheet
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        link.addEventListener("load", () => resolve());
        link.addEventListener("error", () => resolve());
      });

/** Wraps cloned content in a light-theme print document. */
const buildPrintHtml = (title: string, content: HTMLElement) => {
  const styles = [...document.querySelectorAll("style, link[rel='stylesheet']")]
    .map((node) => node.outerHTML)
    .join("");

  return `<!doctype html><html lang="${document.documentElement.lang || "en"}"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>${styles}<style>${PRINT_CSS}</style></head><body class="bg-surface text-ink"><h1 class="mb-4 text-xl font-semibold">${escapeHtml(title)}</h1>${content.outerHTML}</body></html>`;
};

/** Opens the print dialog for a built HTML document, where it can be saved as a PDF. */
const printHtmlDocument = async (html: string) => {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.append(frame);
  try {
    const frameDocument = frame.contentDocument!;
    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();
    await Promise.all(
      [...frameDocument.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']")].map(
        stylesheetLoaded,
      ),
    );
    await frameDocument.fonts.ready;
    // IMPORTANT NOTE: print() returns before the dialog closes in some browsers, so the frame stays until afterprint.
    frame.contentWindow!.addEventListener("afterprint", () => frame.remove(), { once: true });
    frame.contentWindow!.focus();
    frame.contentWindow!.print();
  } catch (error) {
    frame.remove();
    throw error;
  }
};

/** Builds a light-theme print document of the open chat's transcript, without its controls. */
export const buildChatPrintHtml = (title: string, root: ParentNode = document) => {
  const transcript = root.querySelector<HTMLElement>("[data-chat-transcript]");
  if (!transcript) return null;

  const content = transcript.cloneNode(true) as HTMLElement;
  content.querySelectorAll("[data-chat-print-hide]").forEach((node) => node.remove());
  return buildPrintHtml(title, content);
};

/** Opens the print dialog for the open chat, where it can be saved as a PDF. */
export const printChat = async (title: string) => {
  const html = buildChatPrintHtml(title);
  if (!html) throw new Error("No chat transcript is open.");
  await printHtmlDocument(html);
};

/** Opens the print dialog for a rendered artifact body, where it can be saved as a PDF. */
export const printArtifact = async (title: string, root: ParentNode = document) => {
  const body = root.querySelector<HTMLElement>("[data-artifact-print]");
  if (!body) throw new Error("No printable artifact is open.");
  await printHtmlDocument(buildPrintHtml(title, body.cloneNode(true) as HTMLElement));
};
