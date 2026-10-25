import { type Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import * as React from "react";

import { Input, type InputProps } from "@/ui/components/Input";
import { cn } from "@/ui/lib";

const FOCUS_SHORTCUT_KEY = "/";

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const useFocusShortcut = (inputRef: React.RefObject<HTMLInputElement>) => {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== FOCUS_SHORTCUT_KEY || event.metaKey || event.ctrlKey || event.altKey)
        return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      inputRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [inputRef]);
};

type TableCNSearchInputProps<TData> = Omit<InputProps, "value" | "onChange"> & {
  table: Table<TData>;
};

/**
 * Search box bound to the table's global filter; `useTableCN({ searchColumns })` sets what it
 * matches. "/" focuses it and Escape clears it.
 */
export const TableCNSearchInput = <TData,>({
  table,
  placeholder = "Search...",
  className,
  onKeyDown,
  ...props
}: TableCNSearchInputProps<TData>) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  useFocusShortcut(inputRef);

  const searchText = String(table.getState().globalFilter ?? "");

  const clearSearch = () => {
    table.setGlobalFilter("");
    inputRef.current?.focus();
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === "Escape" && searchText !== "") {
      event.stopPropagation();
      table.setGlobalFilter("");
    }
  };

  return (
    <div className={cn("relative w-full mmd:w-[14rem] lg:w-[17rem]", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
      />
      <Input
        {...props}
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={searchText}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        onKeyDown={onInputKeyDown}
        className="peer h-8 rounded-lg pl-8 pr-8 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.05)] [&::-webkit-search-cancel-button]:hidden"
      />
      {searchText ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clearSearch}
          className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-md text-slate-400 outline-none transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 grid h-[1.125rem] min-w-[1.125rem] -translate-y-1/2 place-items-center rounded border border-slate-200 bg-slate-50 px-1 font-sans text-2xs font-medium text-slate-400 peer-focus:hidden"
        >
          {FOCUS_SHORTCUT_KEY}
        </kbd>
      )}
    </div>
  );
};
