const SVG_NS = "http://www.w3.org/2000/svg";
const FALLBACK_SIZE = { width: 1024, height: 768 };
const TARGET_LONG_SIDE = 2048;
const MAX_SCALE = 4;
const PIXEL_LENGTH = /^\s*(\d+(?:\.\d+)?)(?:px)?\s*$/;

const INLINED_PROPERTIES = [
  "display",
  "visibility",
  "opacity",
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
];

const escapeXml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!,
  );

const pixels = (value: string | null) => {
  const match = value?.match(PIXEL_LENGTH);
  return match ? Number(match[1]) : 0;
};

const readSvgSize = (svgText: string) => {
  const svg = new DOMParser().parseFromString(svgText, "image/svg+xml").documentElement;
  const width = pixels(svg.getAttribute("width"));
  const height = pixels(svg.getAttribute("height"));
  if (width > 0 && height > 0) return { width, height };
  const [, , viewWidth = 0, viewHeight = 0] = (svg.getAttribute("viewBox") ?? "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (viewWidth > 0 && viewHeight > 0) return { width: viewWidth, height: viewHeight };
  return FALLBACK_SIZE;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be drawn."));
    image.src = src;
  });

const isShown = (element: Element) => {
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  return (
    style.visibility === "visible" &&
    style.display !== "none" &&
    Number(style.opacity) > 0 &&
    box.width > 0 &&
    box.height > 0
  );
};

const isExported = (element: Element) => !element.closest("[data-chat-print-hide]");

const withInlinedStyles = (svg: SVGSVGElement) => {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  const sources = [svg, ...svg.querySelectorAll("*")];
  const targets = [copy, ...copy.querySelectorAll("*")];
  sources.forEach((source, index) => {
    const computed = getComputedStyle(source);
    targets[index]!.setAttribute(
      "style",
      INLINED_PROPERTIES.map(
        (property) => `${property}:${computed.getPropertyValue(property)}`,
      ).join(";"),
    );
  });
  return copy;
};

const placedSvg = (svg: SVGSVGElement, origin: DOMRect) => {
  const box = svg.getBoundingClientRect();
  const copy = withInlinedStyles(svg);
  copy.setAttribute("x", String(box.left - origin.left));
  copy.setAttribute("y", String(box.top - origin.top));
  copy.setAttribute("width", String(box.width));
  copy.setAttribute("height", String(box.height));
  return new XMLSerializer().serializeToString(copy);
};

const placedText = (element: Element, origin: DOMRect) => {
  const box = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return `<text x="${box.left - origin.left}" y="${box.top - origin.top + box.height / 2}" dominant-baseline="central" fill="${escapeXml(style.color)}" font-family="${escapeXml(style.fontFamily)}" font-size="${style.fontSize}" font-weight="${style.fontWeight}">${escapeXml(element.textContent ?? "")}</text>`;
};

const textLeaves = (root: HTMLElement) =>
  [...root.querySelectorAll("*")].filter(
    (element) =>
      !(element instanceof SVGElement) &&
      element.childElementCount === 0 &&
      !!element.textContent?.trim(),
  );

/**
 * Redraws an element's SVG graphics and plain text as one standalone SVG on the element's
 * background, inlining computed colours and fonts so CSS variables survive outside the page.
 * Parts inside `[data-chat-print-hide]` or currently hidden are left out.
 */
export const elementToSvg = (root: HTMLElement) => {
  const origin = root.getBoundingClientRect();
  const rootStyle = getComputedStyle(root);
  const graphics = [...root.querySelectorAll("svg")]
    .filter((svg) => !svg.parentElement?.closest("svg") && isExported(svg) && isShown(svg))
    .map((svg) => placedSvg(svg, origin));
  const texts = textLeaves(root)
    .filter((element) => isExported(element) && isShown(element))
    .map((element) => placedText(element, origin));
  const radius = pixels(rootStyle.borderTopLeftRadius);
  return `<svg xmlns="${SVG_NS}" width="${origin.width}" height="${origin.height}" viewBox="0 0 ${origin.width} ${origin.height}"><rect width="100%" height="100%" rx="${radius}" fill="${escapeXml(rootStyle.backgroundColor)}"/>${graphics.join("")}${texts.join("")}</svg>`;
};

/** Renders SVG text to a PNG at about 2048 px on its long side, keeping its transparency. */
export const svgToPngBlob = async (svgText: string) => {
  const { width, height } = readSvgSize(svgText);
  const scale = Math.min(MAX_SCALE, Math.max(1, TARGET_LONG_SIDE / Math.max(width, height)));
  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The image could not be drawn.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The image could not be drawn."))),
      "image/png",
    ),
  );
};

/** Swaps a file name's extension for `.png`. */
export const pngFileName = (name: string) =>
  `${name.replace(/\.[a-z0-9]{1,5}$/i, "") || "Image"}.png`;
