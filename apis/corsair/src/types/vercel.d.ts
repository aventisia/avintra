/**
 * Ambient declaration for @corsair-dev/vercel.
 *
 * The published package omits its dist/index.d.ts (publishing bug), so
 * TypeScript cannot resolve types for it. We declare the module here with the
 * same shape as the other @corsair-dev/* plugins: a factory function named
 * after the package plus auth/endpoint metadata exports.
 */
declare module "@corsair-dev/vercel" {
  import type { CorsairPlugin } from "corsair";
  export function vercel(): CorsairPlugin;
  export const vercelAuthConfig: unknown;
  export const vercelEndpointSchemas: unknown;
}
