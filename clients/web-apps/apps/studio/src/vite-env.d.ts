/// <reference types="vite/client" />

declare module "virtual:ui-builder-runtime/react" {
  const source: string;
  export default source;
}

declare module "virtual:ui-builder-runtime/react-dom" {
  const source: string;
  export default source;
}

declare module "virtual:ui-builder-runtime/kit" {
  const source: string;
  export const kitCandidates: string[];
  export default source;
}

declare module "virtual:ui-builder-runtime/icons" {
  const registry: {
    nodes: Record<string, [string, Record<string, string>][]>;
    names: Record<string, string>;
  };
  export default registry;
}

declare module "virtual:ui-builder-runtime/inter-font" {
  const base64: string;
  export default base64;
}

declare module "virtual:ui-builder-runtime/tailwind-css" {
  const source: string;
  export default source;
}
