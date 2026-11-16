import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { createRoot } from "react-dom/client";

import { cn } from "./cn.util";
import { type IconInput, KitIcon } from "./icons";
import { type Tone } from "./primitives";

const FLOATING_SURFACE =
  "z-50 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg animate-[avk-pop-in_120ms_ease-out]";

/** Modal dialog root; pair with DialogTrigger and DialogContent. */
export const Dialog = DialogPrimitive.Root;

/** Element that opens the dialog; use `asChild` to wrap a Button. */
export const DialogTrigger = DialogPrimitive.Trigger;

/** Element that closes the dialog; use `asChild` to wrap a Button. */
export const DialogClose = DialogPrimitive.Close;

const DIALOG_SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" } as const;

/** Centered modal panel with title, optional description, and a close button. */
export const DialogContent = ({
  title,
  description,
  size = "md",
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: keyof typeof DIALOG_SIZES;
  className?: string;
  children?: React.ReactNode;
}) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 animate-[avk-fade-in_150ms_ease-out]" />
    <DialogPrimitive.Content
      className={cn(
        "fixed top-1/2 left-1/2 z-50 grid max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xl animate-[avk-zoom-in_160ms_ease-out] focus:outline-none",
        DIALOG_SIZES[size],
        className,
      )}
    >
      <div className="space-y-1 pr-8">
        <DialogPrimitive.Title className="text-base font-semibold text-foreground">
          {title}
        </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="text-sm text-muted-foreground">
            {description}
          </DialogPrimitive.Description>
        ) : (
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        )}
      </div>
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <KitIcon icon="X" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

/** Right-aligned action row for dialogs and sheets. */
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);

/** Side panel root (a dialog anchored to an edge); pair with SheetTrigger and SheetContent. */
export const Sheet = DialogPrimitive.Root;

/** Element that opens the sheet. */
export const SheetTrigger = DialogPrimitive.Trigger;

/** Element that closes the sheet. */
export const SheetClose = DialogPrimitive.Close;

/** Edge-anchored panel for details, filters, or forms. */
export const SheetContent = ({
  title,
  description,
  side = "right",
  className,
  children,
  footer,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  side?: "right" | "left";
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 animate-[avk-fade-in_150ms_ease-out]" />
    <DialogPrimitive.Content
      className={cn(
        "fixed inset-y-0 z-50 flex w-full max-w-md flex-col border-border bg-card text-card-foreground shadow-2xl focus:outline-none",
        side === "right"
          ? "right-0 border-l animate-[avk-slide-in-right_200ms_ease-out]"
          : "left-0 border-r animate-[avk-slide-in-left_200ms_ease-out]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="min-w-0 space-y-1">
          <DialogPrimitive.Title className="text-base font-semibold text-foreground">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description
            className={description ? "text-sm text-muted-foreground" : "sr-only"}
          >
            {description ?? title}
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close
          aria-label="Close"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <KitIcon icon="X" />
        </DialogPrimitive.Close>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

/** Menu root; pair with DropdownMenuTrigger and DropdownMenuContent. */
export const DropdownMenu = DropdownPrimitive.Root;

/** Element that opens the menu; use `asChild` to wrap a Button. */
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

/** Floating menu panel. */
export const DropdownMenuContent = ({
  align = "end",
  className,
  children,
}: {
  align?: "start" | "center" | "end";
  className?: string;
  children?: React.ReactNode;
}) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      align={align}
      sideOffset={6}
      className={cn(FLOATING_SURFACE, "min-w-44 p-1", className)}
    >
      {children}
    </DropdownPrimitive.Content>
  </DropdownPrimitive.Portal>
);

/** Menu entry; `onSelect` runs when chosen. */
export const DropdownMenuItem = ({
  icon,
  destructive,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> & {
  icon?: IconInput;
  destructive?: boolean;
}) => (
  <DropdownPrimitive.Item
    className={cn(
      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-muted",
      destructive ? "text-destructive" : "text-foreground",
      className,
    )}
    {...props}
  >
    <KitIcon icon={icon} className="text-muted-foreground" />
    {children}
  </DropdownPrimitive.Item>
);

/** Divider between menu groups. */
export const DropdownMenuSeparator = () => (
  <DropdownPrimitive.Separator className="my-1 h-px bg-border" />
);

/** Non-interactive group heading inside a menu. */
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <DropdownPrimitive.Label className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
    {children}
  </DropdownPrimitive.Label>
);

/** Popover root; pair with PopoverTrigger and PopoverContent. */
export const Popover = PopoverPrimitive.Root;

/** Element that opens the popover; use `asChild` to wrap a Button. */
export const PopoverTrigger = PopoverPrimitive.Trigger;

/** Floating panel anchored to its trigger. */
export const PopoverContent = ({
  align = "center",
  className,
  children,
}: {
  align?: "start" | "center" | "end";
  className?: string;
  children?: React.ReactNode;
}) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={6}
      className={cn(FLOATING_SURFACE, "w-72 p-4", className)}
    >
      {children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
);

/** Hover and focus hint around a single interactive child. */
export const Tooltip = ({
  content,
  side = "top",
  children,
}: {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactElement;
}) => (
  <TooltipPrimitive.Provider delayDuration={200}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-xs rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md animate-[avk-fade-in_100ms_ease-out]"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);

/** Small info button that reveals how a figure is calculated, on hover, focus, or click. */
export const InfoHint = ({
  formula,
  label = "How is this calculated?",
  className,
}: {
  formula: React.ReactNode;
  label?: string;
  className?: string;
}) => (
  <Popover>
    <Tooltip content={formula}>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          className,
        )}
      >
        <KitIcon icon="Info" size={14} />
      </PopoverTrigger>
    </Tooltip>
    <PopoverContent className="text-xs leading-relaxed">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{formula}</p>
    </PopoverContent>
  </Popover>
);

/** Tabs root; pair with TabsList, TabsTrigger, and TabsContent. */
export const Tabs = TabsPrimitive.Root;

/** Row of tab triggers. */
export const TabsList = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      "inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
);

/** One tab; `value` links it to TabsContent. */
export const TabsTrigger = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs",
      className,
    )}
    {...props}
  />
);

/** Panel shown for the active tab. */
export const TabsContent = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content className={cn("mt-4 focus-visible:outline-none", className)} {...props} />
);

/** Collapsible sections; single-open and collapsible by default. */
export const Accordion = ({
  type = "single",
  defaultValue,
  className,
  children,
}: {
  type?: "single" | "multiple";
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}) =>
  type === "multiple" ? (
    <AccordionPrimitive.Root
      type="multiple"
      defaultValue={defaultValue ? [defaultValue] : undefined}
      className={cn("divide-y divide-border rounded-lg border border-border", className)}
    >
      {children}
    </AccordionPrimitive.Root>
  ) : (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={defaultValue}
      className={cn("divide-y divide-border rounded-lg border border-border", className)}
    >
      {children}
    </AccordionPrimitive.Root>
  );

/** One collapsible section with its heading. */
export const AccordionItem = ({
  value,
  title,
  children,
}: {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) => (
  <AccordionPrimitive.Item value={value}>
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        {title}
        <KitIcon
          icon="ChevronDown"
          className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
    <AccordionPrimitive.Content className="px-4 pb-4 text-sm text-muted-foreground">
      {children}
    </AccordionPrimitive.Content>
  </AccordionPrimitive.Item>
);

type ToastEntry = {
  id: number;
  message: React.ReactNode;
  description?: React.ReactNode;
  tone: Tone;
};

let toastSequence = 0;
let toastEntries: ToastEntry[] = [];
const toastListeners = new Set<() => void>();
let toasterMounted = false;

const emitToasts = () => toastListeners.forEach((listener) => listener());

const dismissToast = (id: number) => {
  toastEntries = toastEntries.filter((entry) => entry.id !== id);
  emitToasts();
};

const TOAST_ICONS: Record<Tone, string> = {
  neutral: "Info",
  primary: "Info",
  info: "Info",
  success: "CheckCircle2",
  warning: "AlertTriangle",
  danger: "XCircle",
};

const Toaster = () => {
  const [entries, setEntries] = React.useState(toastEntries);
  React.useEffect(() => {
    const listener = () => setEntries([...toastEntries]);
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-80 flex-col gap-2"
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground shadow-lg animate-[avk-slide-up_180ms_ease-out]"
        >
          <KitIcon
            icon={TOAST_ICONS[entry.tone]}
            size={18}
            className={cn(
              "mt-px",
              entry.tone === "success" && "text-success",
              entry.tone === "danger" && "text-destructive",
              entry.tone === "warning" && "text-warning",
              (entry.tone === "info" || entry.tone === "primary" || entry.tone === "neutral") &&
                "text-info",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{entry.message}</p>
            {entry.description && (
              <p className="text-xs text-muted-foreground">{entry.description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(entry.id)}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <KitIcon icon="X" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const ensureToaster = () => {
  if (toasterMounted || typeof document === "undefined") return;
  toasterMounted = true;
  const host = document.createElement("div");
  document.body.appendChild(host);
  createRoot(host).render(<Toaster />);
};

const pushToast = (tone: Tone, message: React.ReactNode, description?: React.ReactNode) => {
  ensureToaster();
  toastSequence += 1;
  const id = toastSequence;
  toastEntries = [...toastEntries.slice(-3), { id, message, description, tone }];
  emitToasts();
  setTimeout(() => dismissToast(id), 4500);
  return id;
};

/** Shows a transient notification; no provider needs to be rendered. */
export const toast = Object.assign(
  (message: React.ReactNode, description?: React.ReactNode) =>
    pushToast("neutral", message, description),
  {
    success: (message: React.ReactNode, description?: React.ReactNode) =>
      pushToast("success", message, description),
    error: (message: React.ReactNode, description?: React.ReactNode) =>
      pushToast("danger", message, description),
    warning: (message: React.ReactNode, description?: React.ReactNode) =>
      pushToast("warning", message, description),
    info: (message: React.ReactNode, description?: React.ReactNode) =>
      pushToast("info", message, description),
  },
);
