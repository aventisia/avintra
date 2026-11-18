import { DIALOG_CONTROL, DIALOG_INPUT_SIZE, DIALOG_TEXTAREA_SIZE } from "@/ui/lib/field-styles";

export const crudDialogFieldClasses = {
  item: "space-y-1.5",
  label: "ml-0 text-[12.5px] font-semibold text-ink-2",
  input: `${DIALOG_INPUT_SIZE} ${DIALOG_CONTROL}`,
  textarea: `${DIALOG_TEXTAREA_SIZE} ${DIALOG_CONTROL}`,
  selectTrigger: `h-11 pl-3.5 pr-3 ${DIALOG_CONTROL}`,
  jsonEditor: "bg-popover",
  searchInput: `h-11 pl-9 pr-9 ${DIALOG_CONTROL}`,
  searchIcon: "left-3.5",
  chipTray: "border-0 bg-sunken/80 px-1.5 pt-1.5 ring-1 ring-line",
  chip: "rounded-md border-0 bg-popover py-1 pl-2.5 pr-1.5 text-[12.5px] ring-1 ring-line",
  switchItem: "gap-4 rounded-md border-0 bg-sunken/80 px-3.5 py-3 ring-1 ring-line space-y-0",
  switchLabel: "text-[13px] font-semibold text-ink",
  switchDescription: "text-[12px] text-muted-foreground",
};
