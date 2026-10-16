import {
  UI_BUILDER_BRIDGE_SOURCE,
  UI_BUILDER_SELECTION_MESSAGE_TYPE,
} from "../constants/ui-builder-selection.constant";

const BRIDGE_MARKER_ATTRIBUTE = "data-ui-builder-bridge";

const BRIDGE_SCRIPT_PATTERN = new RegExp(
  `<script\\b[^>]*\\b${BRIDGE_MARKER_ATTRIBUTE}\\b[^>]*>[\\s\\S]*?<\\/script>`,
  "gi",
);

const BRIDGE_STYLE_PATTERN = new RegExp(
  `<style\\b[^>]*\\b${BRIDGE_MARKER_ATTRIBUTE}\\b[^>]*>[\\s\\S]*?<\\/style>`,
  "gi",
);

const UI_BUILDER_BRIDGE_SCRIPT = `(function () {
  var OUTLINE_CLASS = "__ui_builder_outline__";
  var OUTER_HTML_LIMIT = 4096;
  var TEXT_LIMIT = 500;
  var SELECTOR_LIMIT = 500;

  var style = document.createElement("style");
  style.setAttribute("${BRIDGE_MARKER_ATTRIBUTE}", "1");
  style.textContent = "." + OUTLINE_CLASS + "{outline:2px solid #2563eb !important;outline-offset:1px !important;cursor:crosshair !important;}";
  (document.head || document.documentElement).appendChild(style);

  var highlighted = null;

  var clearHighlight = function () {
    if (highlighted && highlighted.classList) highlighted.classList.remove(OUTLINE_CLASS);
    highlighted = null;
  };

  var highlight = function (element) {
    if (highlighted === element) return;
    clearHighlight();
    highlighted = element;
    if (highlighted && highlighted.classList) highlighted.classList.add(OUTLINE_CLASS);
  };

  var cssEscape = function (value) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
    var backslash = String.fromCharCode(92);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, function (ch) {
      return backslash + ch;
    });
  };

  var buildSelector = function (element) {
    var parts = [];
    var node = element;
    while (node && node.nodeType === 1 && node !== document.documentElement) {
      if (node.id) {
        parts.unshift("#" + cssEscape(node.id));
        break;
      }
      var part = node.tagName.toLowerCase();
      var parent = node.parentElement;
      if (parent) {
        var sameTag = [];
        for (var i = 0; i < parent.children.length; i += 1) {
          if (parent.children[i].tagName === node.tagName) sameTag.push(parent.children[i]);
        }
        if (sameTag.length > 1) part += ":nth-of-type(" + (sameTag.indexOf(node) + 1) + ")";
      }
      parts.unshift(part);
      node = node.parentElement;
    }
    var selector = parts.join(" > ");
    return selector.length > SELECTOR_LIMIT ? selector.slice(0, SELECTOR_LIMIT) : selector;
  };

  document.addEventListener("mouseover", function (event) {
    var target = event.target;
    if (target && target.nodeType === 1) highlight(target);
  }, true);

  document.addEventListener("mouseout", clearHighlight, true);

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || target.nodeType !== 1) return;
    if (target === document.body || target === document.documentElement) return;
    event.preventDefault();
    event.stopPropagation();
    parent.postMessage({
      source: "${UI_BUILDER_BRIDGE_SOURCE}",
      type: "${UI_BUILDER_SELECTION_MESSAGE_TYPE}",
      selector: buildSelector(target),
      outerHtml: String(target.outerHTML || "").slice(0, OUTER_HTML_LIMIT),
      textContent: String(target.innerText || "").slice(0, TEXT_LIMIT)
    }, "*");
  }, true);
})();`;

/**
 * Injects the element-selection bridge script into a generated document string.
 *
 * The result is meant for `srcDoc` rendering only; never persist or send it to a version.
 */
export const injectUiBuilderBridge = (html: string): string => {
  if (!html.trim() || html.includes(BRIDGE_MARKER_ATTRIBUTE)) return html;

  const bridge = `<script ${BRIDGE_MARKER_ATTRIBUTE}="1">${UI_BUILDER_BRIDGE_SCRIPT}</script>`;
  const bodyCloseIndex = html.toLowerCase().lastIndexOf("</body>");
  if (bodyCloseIndex === -1) return `${html}${bridge}`;

  return `${html.slice(0, bodyCloseIndex)}${bridge}${html.slice(bodyCloseIndex)}`;
};

/** Removes any injected bridge markup from a document string before it is saved or sent. */
export const stripUiBuilderBridge = (html: string): string =>
  html.replace(BRIDGE_SCRIPT_PATTERN, "").replace(BRIDGE_STYLE_PATTERN, "");

/**
 * Returns a copy of the document with the selected element's text replaced.
 *
 * Parses and mutates with `DOMParser` and `textContent` only (no HTML execution).
 * Throws when the selector is invalid or matches no element.
 */
export const applyUiBuilderTextEdit = (html: string, selector: string, newText: string): string => {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  let element: Element | null;
  try {
    element = parsed.querySelector(selector);
  } catch {
    throw new Error("The selected element could not be found.");
  }
  if (!element) throw new Error("The selected element could not be found.");

  element.textContent = newText;

  const doctypeMatch = /^<!doctype[^>]*>/i.exec(html.trim());
  const doctype = doctypeMatch ? doctypeMatch[0] : "";

  return stripUiBuilderBridge(`${doctype}${parsed.documentElement.outerHTML}`);
};
