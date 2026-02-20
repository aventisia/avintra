// nextra-theme-blog or your custom theme
import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";

// Get the default MDX components
const themeComponents = getThemeComponents();

/**
 * Merge components
 * @param components The MDX components
 * @returns The merged components
 */
export function useMDXComponents(components = {}) {
  return {
    ...themeComponents,
    ...components,
  };
}
