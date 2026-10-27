import { maxLenError, nameError, reqError } from "@avplatform/ui/utils";
import { nameRegex } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Zod schema to validate domain names using the built-in URL parser.
 *
 * How it works:
 * 1. Accepts plain domains (e.g., "chatgpt.com") or full URLs (e.g., "https://chatgpt.com").
 * 2. If the value doesn’t include a scheme ("http://", "https://"), we temporarily add "http://"
 *    so that `new URL(...)` can parse it.
 * 3. The value is valid when it parses and its hostname looks like a domain (e.g., "example.com").
 * 4. In the transform step, any scheme ("http://", "https://") is stripped off so the final
 *    stored value is just the domain name (e.g., "chatgpt.com").
 *
 * Notes:
 * - This intentionally ignores URL paths, queries, and fragments.
 *   If present, they won’t be stripped — you can enhance regex if you want stricter rules.
 * - Doesn’t validate advanced FQDN rules (like label length or punycode).
 *   For stricter validation, consider `validator.js` with `isFQDN()`.
 */
export const DomainSchema = z
  .string()
  .trim()
  .min(1, reqError("Organization Domain"))
  .refine(
    (val) => {
      try {
        // Add a dummy scheme if missing so `URL` parser can handle plain domains
        const { hostname } = new URL(val.includes("://") ? val : `http://${val}`);
        return /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(hostname);
      } catch {
        return false; // Invalid URL/domain
      }
    },
    { message: "Enter a domain like example.com." },
  )
  .transform(
    (val) => val.replace(/^https?:\/\//, ""), // Strip scheme if present, keep only domain
  );

export const companyInfoSchema = z.object({
  organizationName: z
    .string()
    .min(1, { message: reqError("Organization Name") })
    .max(255, { message: maxLenError("Organization Name", 255) }),
  domain: DomainSchema,
  numberOfEmployees: z.string().min(1, reqError("Number of Employees field")),
  country: z
    .string()
    .min(1, reqError("Country"))
    .regex(nameRegex, {
      message: nameError("Country"),
    }),
  industry: z
    .string()
    .regex(nameRegex, {
      message: nameError("Industry"),
    })
    .optional(),
  role: z
    .string()
    .regex(nameRegex, {
      message: nameError("Role"),
    })
    .optional(),
});
