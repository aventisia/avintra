import { Dialog, DialogClose, DialogPortal, DialogPrimitive } from "@avplatform/ui/dialog";
import { IconTile } from "@avplatform/ui/icon-tile";
import { KeyboardIcon, XIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { HeldKeysPreview } from "./components/HeldKeysPreview";
import { ShortcutRow } from "./components/ShortcutRow";
import { SHORTCUT_COLUMNS } from "./constants/shortcut-groups.constant";
import { useHeldKeys } from "./hooks/useHeldKeys.hook";
import { useKeyboardShortcutsStore } from "./stores/keyboard-shortcuts-store";

const ShortcutsDialog = () => {
  const { showDialog, setShowDialog } = useKeyboardShortcutsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );
  const { held, reset, handleKeyDown, handleKeyUp } = useHeldKeys();
  const contentRef = useRef<HTMLDivElement>(null);

  const focusDialog = (event: Event) => {
    event.preventDefault();
    reset();
    contentRef.current?.focus();
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={contentRef}
          aria-describedby={undefined}
          onOpenAutoFocus={focusDialog}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setShowDialog(false);
          }}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pb-4 pt-[max(4.5rem,12vh)] outline-none data-[state=closed]:duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <section className="relative flex max-h-[calc(100dvh_-_max(4.5rem,12vh)_-_1rem)] w-[min(48rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg bg-popover text-ink ring-1 ring-line duration-300 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 motion-reduce:animate-none">
            <header className="flex items-start gap-4 px-6 pb-4 pt-6">
              <IconTile
                Icon={KeyboardIcon}
                size="lg"
                className="size-12 rounded-lg [&>svg]:size-6"
              />
              <div className="mt-1 min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                  Agent builder
                </p>
                <DialogPrimitive.Title className="min-w-0 truncate text-heading text-ink">
                  Keyboard shortcuts
                </DialogPrimitive.Title>
              </div>
              <DialogClose
                aria-label="Close"
                className="-mr-2 -mt-1 grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-focus"
              >
                <XIcon className="size-4" />
              </DialogClose>
            </header>

            <div className="px-6">
              <HeldKeysPreview held={held} />
            </div>

            <div className="grid min-h-0 flex-1 gap-x-6 gap-y-5 overflow-y-auto px-6 pb-6 pt-4 md:grid-cols-2">
              {SHORTCUT_COLUMNS.map((column) => (
                <div key={column[0].title} className="flex flex-col gap-5">
                  {column.map((group) => (
                    <section key={group.title} className="rounded-lg border border-line p-1.5">
                      <h3 className="mb-1 flex items-center justify-between gap-2 border-b border-line-strong/40 px-2.5 pb-2 text-body font-semibold text-ink">
                        {group.title}
                        <span className="text-hint font-medium tabular-nums text-muted-foreground">
                          {group.shortcuts.length}
                        </span>
                      </h3>
                      <ul>
                        {group.shortcuts.map((shortcut) => (
                          <ShortcutRow key={shortcut.label} shortcut={shortcut} held={held} />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default ShortcutsDialog;
