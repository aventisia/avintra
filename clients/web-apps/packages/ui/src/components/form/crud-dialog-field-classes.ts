const ringControl =
  "border-0 bg-popover text-body-sm ring-1 ring-border focus-visible:border-0 focus-visible:ring-1 focus-visible:ring-focus aria-[invalid=true]:ring-bad aria-[invalid=true]:focus-visible:ring-bad disabled:bg-sunken";

export const crudDialogFieldClasses = {
  item: "space-y-1.5",
  label: "ml-0 text-[12.5px] font-semibold text-ink-2",
  input: `h-11 px-3.5 ${ringControl}`,
  textarea: `resize-none px-3.5 py-2.5 leading-5 ${ringControl}`,
  selectTrigger: `h-11 pl-3.5 pr-3 ${ringControl} data-[state=open]:border-0 data-[state=open]:ring-1 data-[state=open]:ring-focus`,
  jsonEditor:
    "border-0 bg-popover ring-1 ring-border focus-within:border-0 focus-within:ring-1 focus-within:ring-focus",
  searchInput: `h-11 pl-9 pr-9 ${ringControl}`,
  searchIcon: "left-3.5",
  chipTray: "border-0 bg-sunken/80 px-1.5 pt-1.5 ring-1 ring-line",
  chip: "rounded-md border-0 bg-popover py-1 pl-2.5 pr-1.5 text-[12.5px] ring-1 ring-line",
  switchItem: "gap-4 rounded-md border-0 bg-sunken/80 px-3.5 py-3 ring-1 ring-line space-y-0",
  switchLabel: "text-[13px] font-semibold text-ink",
  switchDescription: "text-[12px] text-muted-foreground",
};
