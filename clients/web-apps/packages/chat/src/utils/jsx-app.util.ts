import { escapeHtml } from "./escape-html.util";

const REACT_URL = "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js";
const REACT_INTEGRITY = "sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z";
const REACT_DOM_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js";
const REACT_DOM_INTEGRITY =
  "sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1";
const TAILWIND_URL =
  "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.18/dist/index.global.js";
const TAILWIND_INTEGRITY =
  "sha384-y0axVOJIfo0bJOmTOnyRyUjrqjUotl7L/k6mzSwu2SSrB3r7P+b0cSFkiod+js0X";

const scriptTag = (url: string, integrity: string) =>
  `<script src="${url}" integrity="${integrity}" crossorigin="anonymous"></script>`;

const errorPage = (title: string, message: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>` +
  `<body style="margin:0;padding:16px;font:14px/1.5 ui-sans-serif,system-ui,sans-serif">` +
  `<p style="margin:0 0 8px;font-weight:600;color:#b91c1c">Could not compile this app</p>` +
  `<pre style="margin:0;white-space:pre-wrap;font:13px/1.5 ui-monospace,monospace">${escapeHtml(message)}</pre></body></html>`;

const runnerScript = (compiled: string) => `(function () {
  var root = document.getElementById("root");
  var fail = function (message) { root.textContent = "Could not run this app: " + message; };
  try {
    var module = { exports: {} };
    var exports = module.exports;
    var require = function (name) {
      if (name === "react") return window.React;
      throw new Error('Only "react" can be imported, not "' + name + '"');
    };
    var React = window.React;
    (function (module, exports, require) {
    ${compiled.replace(/<(?=!--|\/script)/gi, "\\x3C")}
    })(module, exports, require);
    var App = module.exports.default;
    if (typeof App !== "function") throw new Error("the file needs an export default of a component");
    class Boundary extends React.Component {
      constructor(props) { super(props); this.state = { error: null }; }
      static getDerivedStateFromError(error) { return { error: error }; }
      render() {
        if (!this.state.error) return this.props.children;
        return React.createElement("pre", { style: { whiteSpace: "pre-wrap", color: "#b91c1c" } }, "Could not run this app: " + this.state.error.message);
      }
    }
    window.ReactDOM.createRoot(root).render(React.createElement(Boundary, null, React.createElement(App)));
  } catch (error) {
    fail(error && error.message ? error.message : String(error));
  }
})();`;

/** Compiles a single-file React app into a complete HTML page for the preview sandbox; failures become an error page. */
export const buildJsxAppPage = async (source: string, title: string): Promise<string> => {
  let compiled: string;
  try {
    const { transform } = await import("sucrase");
    compiled = transform(source, { transforms: ["jsx", "imports"], production: true }).code;
  } catch (error) {
    return errorPage(title, error instanceof Error ? error.message : String(error));
  }
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>` +
    `${scriptTag(TAILWIND_URL, TAILWIND_INTEGRITY)}` +
    `${scriptTag(REACT_URL, REACT_INTEGRITY)}${scriptTag(REACT_DOM_URL, REACT_DOM_INTEGRITY)}` +
    `</head><body><div id="root"></div><script>${runnerScript(compiled)}</script></body></html>`
  );
};
