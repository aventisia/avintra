/**
 * Format tool name for display - converts to PascalCase with spaces.
 * Examples:
 * - "GitHub" → "GitHub"
 * - "openweathermap" → "Open Weather Map"
 * - "googleSheets" → "Google Sheets"
 * - "github" → "Github"
 */
export function formatToolName(name?: string): string {
  if (!name) return "";
  
  // If already in PascalCase with spaces (like "Open Weather Map"), return as-is
  if (/^[A-Z][a-zA-Z\s]*$/.test(name)) {
    return name;
  }

  // Convert camelCase or snake_case to space-separated words
  const formatted = name
    // Insert space before uppercase letters (camelCase)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // Replace underscores and hyphens with spaces
    .replace(/[_-]/g, " ")
    // Capitalize first letter of each word
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return formatted;
}

/**
 * Get the tool display name by converting to PascalCase with spaces.
 * Falls back to the name as-is if formatting fails.
 */
export function getToolDisplayName(toolName?: string): string {
  try {
    return formatToolName(toolName);
  } catch {
    return toolName || "";
  }
}
