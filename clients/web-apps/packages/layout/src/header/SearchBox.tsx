import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { type LucideIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type SearchBoxAction = {
  label: string;
  Icon: LucideIcon;
  onSelect: () => void;
};

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
  actions?: SearchBoxAction[];
}

const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);

/** Header search button that opens a page and action palette, also on ⌘K / Ctrl+K. */
const SearchBox = ({ className, placeholder = "Go to page…", actions }: SearchBoxProps) => {
  const [open, setOpen] = useState(false);
  const sections = useBaseLayoutStore((state) => state.sidebarMenuSections);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((isOpen) => !isOpen);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = (onSelect: () => void) => {
    setOpen(false);
    onSelect();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden h-control-md w-[260px] cursor-pointer items-center gap-2 rounded-md border border-line bg-sunken pl-[11px] pr-1.5 text-[13px] text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none motion-reduce:transition-none md:inline-flex",
          className,
        )}
      >
        <SearchIcon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className="flex-1 truncate text-left">{placeholder}</span>
        {[IS_MAC ? "⌘" : "Ctrl", "K"].map((key) => (
          <kbd
            key={key}
            className="rounded-[4px] border border-b-2 border-line-strong bg-surface px-[5px] py-[3px] font-mono text-[11px] leading-none text-muted-foreground"
          >
            {key}
          </kbd>
        ))}
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={placeholder} />
        <CommandList className="max-h-[360px]">
          <CommandEmpty>Nothing matches.</CommandEmpty>
          {sections?.map((section) => (
            <CommandGroup key={section.sectionName} heading={section.sectionName}>
              {section.menuItems.flatMap((item) => [
                <CommandItem
                  key={item.route}
                  value={`${section.sectionName} ${item.name} ${item.route}`}
                  onSelect={() => run(() => navigate(item.route))}
                  className="gap-2.5"
                >
                  <item.Icon className="size-4 shrink-0 stroke-[1.75] text-muted-foreground" />
                  {item.name}
                </CommandItem>,
                ...(item.subMenuItems ?? []).map((sub) => (
                  <CommandItem
                    key={sub.route}
                    value={`${section.sectionName} ${item.name} ${sub.name} ${sub.route}`}
                    onSelect={() => run(() => navigate(sub.route))}
                    className="pl-[34px]"
                  >
                    {item.name} · {sub.name}
                  </CommandItem>
                )),
              ])}
            </CommandGroup>
          ))}
          {actions && actions.length > 0 && (
            <CommandGroup heading="Actions">
              {actions.map(({ label, Icon, onSelect }) => (
                <CommandItem
                  key={label}
                  value={`Actions ${label}`}
                  onSelect={() => run(onSelect)}
                  className="gap-2.5"
                >
                  <Icon className="size-4 shrink-0 stroke-[1.75] text-muted-foreground" />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export { SearchBox };
