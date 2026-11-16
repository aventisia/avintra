/** Width of a list panel docked on the left under the header (Run log, Change history). */
export const LEFT_DOCK_PANEL_WIDTH = "w-[21rem]";

/** Placement and entrance animation for a left-docked list panel. */
export const LEFT_DOCK_PANEL_CLASS =
  "left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] rounded-none duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none";

/** Scroll height of a left-docked panel's content below its header. */
export const LEFT_DOCK_SCROLL_CLASS = "h-[calc(100vh-7.5rem)]";

/** Panel title style shared by left-docked panels. */
export const LEFT_DOCK_TITLE_CLASS = "text-[13px] font-semibold tracking-[-0.01em]";

/** Offsets the canvas so it sits beside a left-docked panel. */
export const LEFT_DOCK_CANVAS_CLASS = "ml-[21.5rem] w-[calc(100%-21.5rem)]";
