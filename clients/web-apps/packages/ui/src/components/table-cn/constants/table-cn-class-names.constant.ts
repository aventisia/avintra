/** Floating panel shared by TableCN popovers and menus. */
export const TABLE_CN_PANEL_CLASS_NAME =
  "rounded-xl border-0 bg-popover p-0 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.08]";

/** Outline button of the toolbar (sort, view); pair with `variant="outline" size="xs"`. */
export const TABLE_CN_TOOLBAR_BUTTON_CLASS_NAME =
  "h-8 gap-1.5 px-2.5 text-[13px] font-medium [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-slate-500 data-[state=open]:bg-muted data-[state=open]:text-slate-900";

/** Row of a TableCN command list. */
export const TABLE_CN_COMMAND_ITEM_CLASS_NAME =
  "gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-slate-700 aria-selected:bg-muted aria-selected:text-slate-900";

/** Search field at the top of a TableCN command list. */
export const TABLE_CN_COMMAND_INPUT_CLASS_NAME = "h-10 text-[13px]";
