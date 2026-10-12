import { ToolDto } from "@/features/dynamic-config-panel/dtos/tool-dto";

export const DEFAULT_TOOL_ICON_KEY = "WrenchIcon";
export const DEFAULT_TOOL_NODE_COLOR = "#4f46e5";

type CustomToolIconSource = Pick<ToolDto, "icon" | "iconUrl">;

export const getToolIcon = (tool: CustomToolIconSource): string =>
  tool.icon || DEFAULT_TOOL_ICON_KEY;

export const getToolIconUrl = (tool: CustomToolIconSource): string | undefined => {
  const iconUrl = tool.iconUrl?.trim();
  return iconUrl || undefined;
};
