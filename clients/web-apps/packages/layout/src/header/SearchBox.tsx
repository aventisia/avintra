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
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
}

const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);

/** Header search button that opens a page palette, also on ⌘K / Ctrl+K. */
const SearchBox = ({ className, placeholder = "Go to page…" }: SearchBoxProps) => {
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

  const goTo = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden h-control-md w-[260px] cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-sunken pl-2.5 pr-1.5 text-body-sm text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none motion-reduce:transition-none md:inline-flex",
          className,
        )}
      >
        <SearchIcon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className="truncate">{placeholder}</span>
        <kbd className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-sm border border-line bg-fill px-1 font-mono text-2xs font-medium leading-none text-muted-foreground">
          {IS_MAC ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={placeholder} />
        <CommandList className="max-h-[360px]">
          <CommandEmpty>No pages match.</CommandEmpty>
          {sections?.map((section) => (
            <CommandGroup key={section.sectionName} heading={section.sectionName}>
              {section.menuItems.flatMap((item) => [
                <CommandItem
                  key={item.route}
                  value={`${section.sectionName} ${item.name} ${item.route}`}
                  onSelect={() => goTo(item.route)}
                  className="gap-2.5"
                >
                  <item.Icon className="size-4 shrink-0 stroke-[1.75] text-muted-foreground" />
                  {item.name}
                </CommandItem>,
                ...(item.subMenuItems ?? []).map((sub) => (
                  <CommandItem
                    key={sub.route}
                    value={`${section.sectionName} ${item.name} ${sub.name} ${sub.route}`}
                    onSelect={() => goTo(sub.route)}
                    className="pl-[34px]"
                  >
                    {item.name} · {sub.name}
                  </CommandItem>
                )),
              ])}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export { SearchBox };
