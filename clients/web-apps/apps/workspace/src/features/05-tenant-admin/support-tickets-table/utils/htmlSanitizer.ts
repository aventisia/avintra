import DOMPurify from "dompurify";

/**
 * sanitizeHtml - Strong client-side sanitizer that:
 *  - Uses DOMPurify for the heavy lifting
 *  - additionally decodes & sanitizes data:image/svg+xml URIs (base64 or utf8)
 *  - strips javascript: and other dangerous URIs from href/src
 *  - returns sanitized HTML string ready for html-react-parser
 */

const WINDOW = typeof window !== "undefined" ? window : null;
const purify = WINDOW ? DOMPurify(WINDOW) : DOMPurify; // DOMPurify factory for browsers

// Utility: decode data URL payload (handles base64 & percent-encoded)
function decodeDataPayload(
  dataUrl: string,
): { mime: string; isBase64: boolean; payload: string } | null {
  try {
    const match = dataUrl.match(/^data:([^;,]+)(;base64)?,(.*)$/s);
    if (!match) return null;
    const mime = match[1];
    const isBase64 = !!match[2];
    const payload = match[3];
    if (isBase64) {
      // base64 -> raw string
      // atob yields binary string; for UTF-8 we need to decode properly
      const raw = atob(payload);
      // Convert binary string to UTF-8
      const utf8 = decodeURIComponent(
        raw
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return { mime, isBase64: true, payload: utf8 };
    } else {
      // percent-encoded or plain - decodeURIComponent handles both
      const decoded = decodeURIComponent(payload);
      return { mime, isBase64: false, payload: decoded };
    }
  } catch (e) {
    console.log("Error", e);
    return null;
  }
}

// Utility: encode safe svg back to data URL. Use utf8 percent-encoding to avoid base64 issues.
function encodeSvgToDataUrl(svgString: string) {
  // remove any weird nulls
  const cleaned = svgString.replace(/\0/g, "");
  const encoded = encodeURIComponent(cleaned)
    // keep common characters readable to make URLs smaller
    .replace(/%20/g, " ")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%22/g, '"')
    .replace(/%2C/g, ",")
    .replace(/%3D/g, "=")
    .replace(/%7B/g, "{")
    .replace(/%7D/g, "}")
    .replace(/%3C/g, "<")
    .replace(/%3E/g, ">");
  return `data:image/svg+xml;utf8,${encoded}`;
}

// Extra safety: allowed data image mime types (non-exhaustive). We will special-case svg.
const SAFE_IMAGE_MIMES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
];

// Function: sanitize a raw SVG string using DOMPurify (SVG profile)
function sanitizeSvgString(svg: string): string | null {
  try {
    // Use DOMPurify to sanitize SVG. Ensure the browser knows this is an SVG by parsing it as XML/SVG.
    // DOMPurify can sanitize SVG content if we tell it.
    const sanitized = purify.sanitize(svg, {
      USE_PROFILES: { svg: true }, // use DOMPurify's SVG profile
      WHOLE_DOCUMENT: false,
    });
    // Ensure result still contains an <svg
    if (!/^\s*<svg[\s>]/i.test(sanitized)) {
      // DOMPurify may strip malicious svg down to nothing; consider that unsafe
      return null;
    }
    return sanitized;
  } catch (e) {
    console.log("Error", e);

    return null;
  }
}

// Remove dangerous URI schemes
function isUnsafeUrl(url: string | null | undefined) {
  if (!url) return true;
  const trimmed = url.trim().toLowerCase();
  // allow relative paths and safe schemes
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../"))
    return false;
  if (/^(https?|mailto|tel):/.test(trimmed)) return false;
  // allow data images handled elsewhere (only images)
  if (/^data:/.test(trimmed)) return false;
  // otherwise, consider unsafe (javascript:, vbscript:, file:, etc)
  return /^(javascript|vbscript|file):/.test(trimmed);
}

/**
 * sanitizeHtml - Public function
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!WINDOW) {
    // If no window (SSR), safe fallback: just return empty string. Prefer server-side sanitize in SSR.
    return "";
  }

  // First-pass sanitize with DOMPurify using a secure profile
  const purified = purify.sanitize(rawHtml, {
    USE_PROFILES: { html: true }, // HTML profile
    WHOLE_DOCUMENT: false,
    // disallow unknown protocols by default, we'll post-process data: URIs explicitly
    // DOMPurify config is flexible; further checks below
  });

  // Parse sanitized HTML into DOM to perform targeted attribute checks & data:image/svg handling
  const parser = new DOMParser();
  const doc = parser.parseFromString(purified, "text/html");

  // Remove any inline event handlers as extra safeguard (DOMPurify should have removed them)
  const allElements = Array.from(doc.querySelectorAll("*"));
  for (const el of allElements) {
    // remove attributes that start with on (onclick, onerror etc)
    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name)) {
        el.removeAttribute(attr.name);
      }
    }
  }

  // Sanitize links and sources (href/src) for unsafe schemes
  const elementsWithSrcOrHref = Array.from(doc.querySelectorAll("[src],[href]"));
  for (const el of elementsWithSrcOrHref) {
    const src = el.getAttribute("src");
    const href = el.getAttribute("href");
    if (src) {
      const lower = src.trim().toLowerCase();
      if (lower.startsWith("data:")) {
        // handle data URLs - specifically treat image/svg+xml
        const decoded = decodeDataPayload(src);
        if (!decoded) {
          // invalid data URL -> remove attribute
          el.removeAttribute("src");
          continue;
        }
        // if mime is not an allowed image mime, remove
        if (!SAFE_IMAGE_MIMES.includes(decoded.mime)) {
          el.removeAttribute("src");
          continue;
        }

        if (decoded.mime === "image/svg+xml") {
          // decode & sanitize inner svg markup
          const sanitizedSvg = sanitizeSvgString(decoded.payload);
          if (!sanitizedSvg) {
            // couldn't sanitize safely -> remove src entirely to be safe
            el.removeAttribute("src");
            continue;
          }
          // re-encode sanitized svg as data URL
          const safeDataUrl = encodeSvgToDataUrl(sanitizedSvg);
          el.setAttribute("src", safeDataUrl);
        } else {
          // For other image mime types (png/jpg/gif etc) we allow data: URIs but ensure they are base64
          // If it's not base64 or looks malformed, remove it.
          if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(src)) {
            el.removeAttribute("src");
          }
          // otherwise keep it as-is (DOMPurify already removed scripts)
        }
      } else {
        // not data: - reject javascript:, vbscript: etc
        if (isUnsafeUrl(src)) {
          el.removeAttribute("src");
        }
      }
    }

    if (href) {
      if (href.trim().toLowerCase().startsWith("data:")) {
        // data: URLs in href are dangerous -> remove
        el.removeAttribute("href");
      } else if (isUnsafeUrl(href)) {
        el.removeAttribute("href");
      }
    }
  }

  // Remove <script>, <iframe>, <object>, <embed>, <link rel="import"> explicitly (DOMPurify should remove but double-check)
  const forbiddenSelectors = ["script", "iframe", "object", "embed", "link[rel~=import]"];
  for (const sel of forbiddenSelectors) {
    const nodes = Array.from(doc.querySelectorAll(sel));
    for (const n of nodes) n.remove();
  }

  // Remove style attributes that contain "expression" or javascript: in url(...) (extra CSS guard)
  for (const el of allElements) {
    const style = el.getAttribute("style");
    if (!style) continue;
    const lower = style.toLowerCase();
    if (lower.includes("expression(") || /url\((['"]?)\s*javascript:/i.test(lower)) {
      el.removeAttribute("style");
    }
  }

  // Serialize back to HTML string
  const container = doc.body;
  return container.innerHTML;
}
