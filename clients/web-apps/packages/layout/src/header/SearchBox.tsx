import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import {
  ArrowBendDownLeftIcon,
  ArrowBendDownRightIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type SearchBoxAction = {
  label: string;
  Icon: PhosphorIcon;
  onSelect: () => void;
};

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
  actions?: SearchBoxAction[];
}

const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);

const GROUP_CLASS_NAME =
  "p-0 [&:not([hidden])~&]:mt-2 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-1 [&_[cmdk-group-heading]]:font-mono";

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex min-w-5 items-center justify-center rounded-[4px] border border-b-2 border-line-strong bg-surface px-[5px] py-[3px] font-mono text-[11px] leading-none text-muted-foreground">
    {children}
  </kbd>
);

const PaletteItem = ({
  value,
  Icon,
  label,
  hint,
  onSelect,
}: {
  value: string;
  Icon: ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  onSelect: () => void;
}) => (
  <CommandItem
    value={value}
    onSelect={onSelect}
    className="group/item min-h-10 gap-3 rounded-md px-2.5 aria-selected:bg-fill"
  >
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted-foreground transition-colors group-aria-selected/item:border-primary/40 group-aria-selected/item:text-primary-text">
      <Icon className="size-4 stroke-[1.75]" />
    </span>
    <span className="flex-1 truncate">{label}</span>
    <span className="truncate text-xs text-muted-foreground group-aria-selected/item:hidden">
      {hint}
    </span>
    <ArrowBendDownLeftIcon
      className="hidden size-4 shrink-0 text-muted-foreground group-aria-selected/item:block"
      aria-hidden="true"
    />
  </CommandItem>
);

/** Header search button that opens a page and action palette, also on ⌘K / Ctrl+K. */
const SearchBox = ({
  className,
  placeholder = "Search pages and actions…",
  actions,
}: SearchBoxProps) => {
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
        <MagnifyingGlassIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate text-left">{placeholder}</span>
        <Kbd>{IS_MAC ? "⌘" : "Ctrl"}</Kbd>
        <Kbd>K</Kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[12vh] max-w-[640px] translate-y-0 overflow-hidden rounded-xl border border-line p-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
          <DialogTitle className="sr-only">Search pages and actions</DialogTitle>
          <Command loop className="rounded-none">
            <div className="flex items-center border-b border-line pr-4 [&>[cmdk-input-wrapper]]:flex-1 [&>[cmdk-input-wrapper]]:px-4">
              <CommandInput placeholder={placeholder} className="h-14 text-body" />
              <Kbd>Esc</Kbd>
            </div>
            <CommandList className="max-h-[min(440px,60vh)] scroll-py-2 p-2">
              <CommandEmpty className="flex flex-col items-center gap-2 py-10 text-body-sm text-muted-foreground">
                <MagnifyingGlassMinusIcon className="size-6" aria-hidden="true" />
                No pages or actions match.
              </CommandEmpty>
              {sections?.map((section) => (
                <CommandGroup
                  key={section.sectionName}
                  heading={section.sectionName}
                  className={GROUP_CLASS_NAME}
                >
                  {section.menuItems.flatMap((item) => [
                    <PaletteItem
                      key={item.route}
                      value={`${section.sectionName} ${item.name} ${item.route}`}
                      Icon={item.Icon}
                      label={item.name}
                      hint={section.sectionName}
                      onSelect={() => run(() => navigate(item.route))}
                    />,
                    ...(item.subMenuItems ?? []).map((sub) => (
                      <PaletteItem
                        key={sub.route}
                        value={`${section.sectionName} ${item.name} ${sub.name} ${sub.route}`}
                        Icon={ArrowBendDownRightIcon}
                        label={sub.name}
                        hint={item.name}
                        onSelect={() => run(() => navigate(sub.route))}
                      />
                    )),
                  ])}
                </CommandGroup>
              ))}
              {actions && actions.length > 0 && (
                <CommandGroup heading="Actions" className={GROUP_CLASS_NAME}>
                  {actions.map(({ label, Icon, onSelect }) => (
                    <PaletteItem
                      key={label}
                      value={`Actions ${label}`}
                      Icon={Icon}
                      label={label}
                      hint="Action"
                      onSelect={() => run(onSelect)}
                    />
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <div className="flex items-center gap-4 border-t border-line bg-sunken px-4 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                Navigate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                Open
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <Kbd>{IS_MAC ? "⌘" : "Ctrl"}</Kbd>
                <Kbd>K</Kbd>
                Toggle
              </span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { SearchBox };
