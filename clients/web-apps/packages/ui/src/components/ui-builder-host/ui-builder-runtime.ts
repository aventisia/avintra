/** `source` stamped on every message the in-frame runtime posts to its host. */
export const UI_BUILDER_RUNTIME_SOURCE = "avintra-ui-runtime";

/** `source` stamped on every message the host posts into the frame. */
export const UI_BUILDER_HOST_SOURCE = "avintra-ui-host";

/** Attribute marking markup the host injects at render time; stripped before saving. */
export const UI_BUILDER_RUNTIME_MARKER_ATTRIBUTE = "data-avintra-runtime";

/** Content Security Policy that keeps a generated interface off the network. */
export const UI_BUILDER_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

const UI_BUILDER_PROBE_CAPTURE_SCRIPT = `(function () {
  var OUT = "${UI_BUILDER_RUNTIME_SOURCE}";
  var IN = "${UI_BUILDER_HOST_SOURCE}";
  var MAX_HEIGHT = 2400;
  var rasterize = function (width) {
    return new Promise(function (resolve, reject) {
      var height = Math.min(MAX_HEIGHT, Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 200));
      var styles = Array.prototype.map.call(document.querySelectorAll("style"), function (node) { return node.textContent; }).join("\\n");
      var body = new XMLSerializer().serializeToString(document.body).replace(/<script[\\s\\S]*?<\\/script>/gi, "");
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '"><foreignObject x="0" y="0" width="100%" height="100%"><html xmlns="http://www.w3.org/1999/xhtml" style="width:' + width + 'px"><head><style><![CDATA[' + styles.replace(/]]>/g, "]] >") + ']]></style></head>' + body + '</html></foreignObject></svg>';
      var image = new Image();
      image.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        context.fillStyle = getComputedStyle(document.body).backgroundColor || "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0);
        try { resolve(canvas.toDataURL("image/jpeg", 0.72)); } catch (error) { reject(error); }
      };
      image.onerror = function () { reject(new Error("The page could not be captured.")); };
      image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  };
  window.addEventListener("message", function (event) {
    if (event.source !== parent) return;
    var data = event.data;
    if (!data || data.source !== IN || data.type !== "probe:capture") return;
    rasterize(Number(data.width) || window.innerWidth).then(
      function (image) { parent.postMessage({ source: OUT, type: "probe:capture", id: data.id, image: image }, "*"); },
      function (error) { parent.postMessage({ source: OUT, type: "probe:capture", id: data.id, error: String(error && error.message || error) }, "*"); }
    );
  });
})();`;

const UI_BUILDER_RUNTIME_SCRIPT = `(function () {
  if (window.Avintra) return;
  var OUT = "${UI_BUILDER_RUNTIME_SOURCE}";
  var IN = "${UI_BUILDER_HOST_SOURCE}";
  var TIMEOUT_MS = 30000;
  var pending = {};
  var sequence = 0;

  var post = function (message) {
    message.source = OUT;
    try { parent.postMessage(message, "*"); } catch (error) {}
  };

  window.addEventListener("message", function (event) {
    if (event.source !== parent) return;
    var data = event.data;
    if (!data || data.source !== IN || data.type !== "data:response") return;
    var entry = pending[data.id];
    if (!entry) return;
    delete pending[data.id];
    clearTimeout(entry.timer);
    if (data.ok) entry.resolve(data.data);
    else entry.reject(new Error(data.error || "The data request failed."));
  });

  var request = function (connection, operation, params) {
    return new Promise(function (resolve, reject) {
      sequence += 1;
      var id = "req-" + sequence;
      var timer = setTimeout(function () {
        delete pending[id];
        reject(new Error("The data request timed out."));
      }, TIMEOUT_MS);
      pending[id] = { resolve: resolve, reject: reject, timer: timer };
      post({ type: "data:request", id: id, connection: String(connection), operation: operation, params: params || {} });
    });
  };

  var queue = function (key) {
    return {
      list: function (options) { return request(key, "list", options || {}); },
      get: function (id) { return request(key, "get", { id: id }); },
      add: function (data, description) { return request(key, "add", { data: data || {}, description: description || null }); },
      update: function (id, patch) {
        patch = patch || {};
        return request(key, "update", { id: id, status: patch.status || null, data: patch.data || null });
      },
      query: function (spec) { return request(key, "query", spec || {}); }
    };
  };

  var reportError = function (message, stack) {
    post({ type: "runtime:error", message: String(message || "Unknown error").slice(0, 2000), stack: String(stack || "").slice(0, 4000) });
  };

  window.addEventListener("error", function (event) {
    reportError(event.message, event.error && event.error.stack);
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    reportError(reason && reason.message ? reason.message : reason, reason && reason.stack);
  });

  var readySent = false;
  var ready = function () {
    if (readySent) return;
    readySent = true;
    var root = document.getElementById("root") || document.body;
    post({ type: "runtime:ready", markup: window.__AVINTRA_PROBE__ && root ? String(root.innerHTML).slice(0, 400000) : "" });
  };

  var useQueue = function (key, options) {
    var R = window.React;
    options = options || {};
    var auto = options.auto !== false;
    var paramsKey = JSON.stringify(options.params || {});
    var stateTuple = R.useState({ items: [], total: 0, loading: auto, error: null, loaded: false });
    var state = stateTuple[0];
    var setState = stateTuple[1];
    var refresh = R.useCallback(function () {
      setState(function (previous) { return Object.assign({}, previous, { loading: true, error: null }); });
      return queue(key).list(JSON.parse(paramsKey)).then(function (page) {
        setState({ items: page.items || [], total: page.total || 0, loading: false, error: null, loaded: true });
        return page;
      }, function (error) {
        setState(function (previous) { return Object.assign({}, previous, { loading: false, error: error.message, loaded: true }); });
        throw error;
      });
    }, [key, paramsKey]);
    R.useEffect(function () {
      if (auto) refresh().catch(function () {});
    }, [auto, refresh]);
    var thenRefresh = function (promise) {
      return promise.then(function (result) {
        if (state.loaded || auto) refresh().catch(function () {});
        return result;
      });
    };
    return {
      items: state.items,
      total: state.total,
      loading: state.loading,
      error: state.error,
      loaded: state.loaded,
      refresh: refresh,
      get: function (id) { return queue(key).get(id); },
      add: function (data, description) { return thenRefresh(queue(key).add(data, description)); },
      update: function (id, patch) { return thenRefresh(queue(key).update(id, patch)); }
    };
  };

  var useQueueQuery = function (key, spec, options) {
    var R = window.React;
    options = options || {};
    var auto = options.auto !== false;
    var specKey = JSON.stringify(spec || {});
    var stateTuple = R.useState({ data: null, loading: auto, error: null, loaded: false });
    var state = stateTuple[0];
    var setState = stateTuple[1];
    var refresh = R.useCallback(function () {
      setState(function (previous) { return Object.assign({}, previous, { loading: true, error: null }); });
      return queue(key).query(JSON.parse(specKey)).then(function (result) {
        setState({ data: result, loading: false, error: null, loaded: true });
        return result;
      }, function (error) {
        setState(function (previous) { return Object.assign({}, previous, { loading: false, error: error.message, loaded: true }); });
        throw error;
      });
    }, [key, specKey]);
    R.useEffect(function () {
      if (auto) refresh().catch(function () {});
    }, [auto, refresh]);
    var queries = (state.data && state.data.queries) || {};
    return {
      data: state.data,
      results: queries,
      rows: function (name) { return (queries[name] && queries[name].rows) || []; },
      first: function (name) { var rows = (queries[name] && queries[name].rows) || []; return rows[0] || {}; },
      loading: state.loading,
      error: state.error,
      loaded: state.loaded,
      truncated: Boolean(state.data && state.data.truncated),
      formula: function (name, metric) { return (queries[name] && queries[name].formulas && queries[name].formulas[metric]) || ""; },
      description: function (name) { return (queries[name] && queries[name].description) || ""; },
      filterDescription: (state.data && state.data.filterDescription) || "",
      refresh: refresh
    };
  };

  var asset = function (name) {
    var assets = window.__AVINTRA_ASSETS__ || {};
    return Object.prototype.hasOwnProperty.call(assets, name) ? assets[name] : "";
  };

  window.Avintra = { data: { queue: queue }, useQueue: useQueue, useQueueQuery: useQueueQuery, asset: asset, reportError: reportError, ready: ready };

  if (document.readyState === "complete") setTimeout(ready, 0);
  else window.addEventListener("load", function () { setTimeout(ready, 0); });
})();`;

const RUNTIME_MARKUP_PATTERN = new RegExp(
  `<(script|meta)\\b[^>]*\\b${UI_BUILDER_RUNTIME_MARKER_ATTRIBUTE}\\b[^>]*>(?:[\\s\\S]*?<\\/script>)?`,
  "gi",
);

/** Removes any host-injected runtime markup from a document string. */
export const stripUiBuilderRuntime = (html: string): string =>
  html.replace(RUNTIME_MARKUP_PATTERN, "");

/**
 * Prepares a generated document for display inside a sandboxed frame: prepends a
 * network-blocking CSP and the Avintra runtime (data bridge and error reporting).
 *
 * The result is meant for `srcDoc` rendering only; never persist it.
 */
export const prepareUiBuilderDocument = (
  html: string,
  options: { probe?: boolean; assets?: Record<string, string> } = {},
) => {
  const clean = stripUiBuilderRuntime(html);
  const marker = `${UI_BUILDER_RUNTIME_MARKER_ATTRIBUTE}="1"`;
  const probeFlag = options.probe
    ? `window.__AVINTRA_PROBE__=true;${UI_BUILDER_PROBE_CAPTURE_SCRIPT}`
    : "";
  const assetScript = options.assets
    ? `window.__AVINTRA_ASSETS__=${JSON.stringify(options.assets).replace(/</g, "\\u003c")};`
    : "";
  const injected = [
    `<meta ${marker} http-equiv="Content-Security-Policy" content="${UI_BUILDER_CONTENT_SECURITY_POLICY}">`,
    `<script ${marker}>${assetScript}${probeFlag}${UI_BUILDER_RUNTIME_SCRIPT}</script>`,
  ].join("");

  const headMatch = /<head\b[^>]*>/i.exec(clean);
  if (headMatch) {
    const insertAt = headMatch.index + headMatch[0].length;
    return `${clean.slice(0, insertAt)}${injected}${clean.slice(insertAt)}`;
  }

  const htmlMatch = /<html\b[^>]*>/i.exec(clean);
  if (htmlMatch) {
    const insertAt = htmlMatch.index + htmlMatch[0].length;
    return `${clean.slice(0, insertAt)}<head>${injected}</head>${clean.slice(insertAt)}`;
  }

  const doctypeMatch = /^\s*<!doctype[^>]*>/i.exec(clean);
  if (doctypeMatch) {
    const insertAt = doctypeMatch[0].length;
    return `${clean.slice(0, insertAt)}${injected}${clean.slice(insertAt)}`;
  }

  return `${injected}${clean}`;
};
