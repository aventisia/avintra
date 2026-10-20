import * as React from "react";

import { cn } from "./cn.util";
import { type IconInput, KitIcon } from "./icons";
import { InfoHint } from "./overlays";
import { Skeleton, type Tone } from "./primitives";

/** One navigation entry in an AppShell sidebar. */
export type NavItem = {
  label: string;
  value: string;
  icon?: IconInput;
  badge?: React.ReactNode;
};

/**
 * Application frame with a responsive sidebar (collapses to a menu button on small screens),
 * a top bar, and a scrollable main area.
 */
export const AppShell = ({
  brand,
  nav = [],
  activeNav,
  onNavigate,
  sidebarFooter,
  topbar,
  children,
  className,
}: {
  brand?: React.ReactNode;
  nav?: NavItem[];
  activeNav?: string;
  onNavigate?: (value: string) => void;
  sidebarFooter?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const hasSidebar = nav.length > 0 || brand;

  const navigation = (
    <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {nav.map((item) => {
        const isActive = item.value === activeNav;
        return (
          <button
            key={item.value}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              onNavigate?.(item.value);
              setIsMenuOpen(false);
            }}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <KitIcon icon={item.icon} size={18} />
            <span className="flex-1 truncate text-left">{item.label}</span>
            {item.badge}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className={cn("flex min-h-screen bg-background text-foreground", className)}>
      {hasSidebar && (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
            isMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
          )}
        >
          {brand && (
            <div className="flex h-14 items-center gap-2 border-b border-border px-4 font-semibold">
              {brand}
            </div>
          )}
          {navigation}
          {sidebarFooter && <div className="border-t border-border p-3">{sidebarFooter}</div>}
        </aside>
      )}
      {isMenuOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {(topbar || hasSidebar) && (
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
            {hasSidebar && (
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsMenuOpen(true)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
              >
                <KitIcon icon="Menu" size={18} />
              </button>
            )}
            <div className="flex min-w-0 flex-1 items-center gap-3">{topbar}</div>
          </header>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};

/** Page title row with description, breadcrumbs, and actions. Renders the page's h1. */
export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: string[];
  className?: string;
}) => (
  <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
    <div className="min-w-0 space-y-1">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb}-${index}`}>
              {index > 0 && <KitIcon icon="ChevronRight" size={12} />}
              <span className={index === breadcrumbs.length - 1 ? "text-foreground" : undefined}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/** Content section with a heading row and body. */
export const Section = ({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={cn("space-y-4", className)}>
    {(title || actions) && (
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-0.5">
          {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

/** Centered page container with consistent padding and vertical rhythm. */
export const Page = ({
  width = "xl",
  className,
  children,
}: {
  width?: "md" | "lg" | "xl" | "full";
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "mx-auto w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8",
      { md: "max-w-3xl", lg: "max-w-5xl", xl: "max-w-7xl", full: "max-w-none" }[width],
      className,
    )}
  >
    {children}
  </div>
);

const DELTA_TONE: Record<"up" | "down" | "flat", string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

/** KPI tile: label, big value, optional trend delta, icon, formula hint, and loading state. */
export const Stat = ({
  label,
  value,
  delta,
  deltaLabel,
  invertDelta = false,
  icon,
  tone = "primary",
  formula,
  loading = false,
  footer,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: number | null;
  deltaLabel?: React.ReactNode;
  invertDelta?: boolean;
  icon?: IconInput;
  tone?: Tone;
  formula?: React.ReactNode;
  loading?: boolean;
  footer?: React.ReactNode;
  className?: string;
}) => {
  const direction =
    delta === null || delta === undefined || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  const toneDirection =
    invertDelta && direction !== "flat" ? (direction === "up" ? "down" : "up") : direction;
  const iconTone = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  }[tone];

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-xs", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <span>{label}</span>
          {formula && <InfoHint formula={formula} />}
        </div>
        {icon && (
          <span
            className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconTone)}
          >
            <KitIcon icon={icon} size={18} />
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-28" />
      ) : (
        <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
      )}
      {(delta !== undefined && delta !== null) || deltaLabel ? (
        <p className="mt-2 flex items-center gap-1 text-xs">
          {delta !== undefined && delta !== null && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                DELTA_TONE[toneDirection],
              )}
            >
              <KitIcon
                icon={direction === "up" ? "ArrowUp" : direction === "down" ? "ArrowDown" : "Minus"}
                size={12}
              />
              {Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 1 })}%
            </span>
          )}
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </p>
      ) : null}
      {footer && (
        <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
};

/** Responsive grid for Stat tiles. */
export const StatGrid = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;

/** Label/value pairs for record details. */
export const DescriptionList = ({
  items,
  columns = 2,
  className,
}: {
  items: { label: React.ReactNode; value: React.ReactNode }[];
  columns?: 1 | 2 | 3;
  className?: string;
}) => (
  <dl
    className={cn(
      "grid gap-x-6 gap-y-4",
      columns === 2 && "sm:grid-cols-2",
      columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
      className,
    )}
  >
    {items.map((item, index) => (
      <div key={index} className="space-y-1">
        <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
        <dd className="text-sm break-words text-foreground">{item.value ?? "—"}</dd>
      </div>
    ))}
  </dl>
);

/** Vertical activity feed. */
export const Timeline = ({
  items,
  className,
}: {
  items: {
    title: React.ReactNode;
    time?: React.ReactNode;
    description?: React.ReactNode;
    icon?: IconInput;
    tone?: Tone;
  }[];
  className?: string;
}) => (
  <ol className={cn("relative space-y-5 border-l border-border pl-6", className)}>
    {items.map((item, index) => (
      <li key={index} className="relative">
        <span
          className={cn(
            "absolute top-0.5 -left-[33px] flex size-5 items-center justify-center rounded-full ring-4 ring-background",
            item.tone === "success"
              ? "bg-success text-white"
              : item.tone === "danger"
                ? "bg-destructive text-white"
                : item.tone === "warning"
                  ? "bg-warning text-white"
                  : "bg-primary text-primary-foreground",
          )}
        >
          <KitIcon icon={item.icon ?? "Check"} size={11} strokeWidth={3} />
        </span>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          {item.time && <p className="text-xs text-muted-foreground">{item.time}</p>}
        </div>
        {item.description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
        )}
      </li>
    ))}
  </ol>
);

/** Horizontal step indicator for wizards; `current` is the zero-based active step. */
export const Stepper = ({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) => (
  <ol aria-label="Progress" className={cn("flex items-center gap-2", className)}>
    {steps.map((step, index) => {
      const state = index < current ? "done" : index === current ? "current" : "upcoming";
      return (
        <li
          key={step}
          aria-current={state === "current" ? "step" : undefined}
          className="flex flex-1 items-center gap-2"
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              state === "done" && "bg-primary text-primary-foreground",
              state === "current" && "bg-primary/10 text-primary ring-2 ring-primary",
              state === "upcoming" && "bg-muted text-muted-foreground",
            )}
          >
            {state === "done" ? <KitIcon icon="Check" size={14} strokeWidth={3} /> : index + 1}
          </span>
          <span
            className={cn(
              "hidden text-sm whitespace-nowrap sm:inline",
              state === "upcoming" ? "text-muted-foreground" : "font-medium text-foreground",
            )}
          >
            {step}
          </span>
          {index < steps.length - 1 && <span aria-hidden className="h-px flex-1 bg-border" />}
        </li>
      );
    })}
  </ol>
);

/**
 * Kanban board. Cards can be dragged between columns; each card also gets a keyboard-friendly
 * "Move to" select when `onMove` is provided.
 */
export const Board = <TItem extends Record<string, unknown>>({
  columns,
  items,
  columnOf,
  itemKey = "id",
  renderCard,
  onMove,
  className,
}: {
  columns: { value: string; title: React.ReactNode; tone?: Tone }[];
  items: TItem[];
  columnOf: (item: TItem) => string;
  itemKey?: string;
  renderCard: (item: TItem) => React.ReactNode;
  onMove?: (item: TItem, toColumn: string) => void;
  className?: string;
}) => {
  const [dragKey, setDragKey] = React.useState<string | null>(null);
  const [overColumn, setOverColumn] = React.useState<string | null>(null);
  const keyOf = (item: TItem) => String(item[itemKey]);

  return (
    <div
      className={cn(
        "grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2",
        className,
      )}
    >
      {columns.map((column) => {
        const columnItems = items.filter((item) => columnOf(item) === column.value);
        return (
          <section
            key={column.value}
            aria-label={typeof column.title === "string" ? column.title : column.value}
            onDragOver={(event) => {
              if (!onMove) return;
              event.preventDefault();
              setOverColumn(column.value);
            }}
            onDragLeave={() => setOverColumn(null)}
            onDrop={(event) => {
              event.preventDefault();
              const item = items.find((entry) => keyOf(entry) === dragKey);
              if (item && onMove && columnOf(item) !== column.value) onMove(item, column.value);
              setDragKey(null);
              setOverColumn(null);
            }}
            className={cn(
              "flex min-h-40 flex-col gap-2 rounded-xl bg-muted/60 p-3 transition-colors",
              overColumn === column.value && "bg-primary/10 ring-2 ring-primary/30",
            )}
          >
            <header className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <span className="rounded-full bg-card px-2 text-xs text-muted-foreground tabular-nums">
                {columnItems.length}
              </span>
            </header>
            {columnItems.map((item) => (
              <article
                key={keyOf(item)}
                draggable={Boolean(onMove)}
                onDragStart={() => setDragKey(keyOf(item))}
                className={cn(
                  "space-y-2 rounded-lg border border-border bg-card p-3 text-sm shadow-xs",
                  onMove && "cursor-grab active:cursor-grabbing",
                  dragKey === keyOf(item) && "opacity-50",
                )}
              >
                {renderCard(item)}
                {onMove && (
                  <select
                    aria-label="Move to column"
                    value={column.value}
                    onChange={(event) => onMove(item, event.target.value)}
                    className="h-7 w-full cursor-pointer rounded border border-border bg-background px-2 text-xs text-muted-foreground"
                  >
                    {columns.map((target) => (
                      <option key={target.value} value={target.value}>
                        {typeof target.title === "string" ? target.title : target.value}
                      </option>
                    ))}
                  </select>
                )}
              </article>
            ))}
            {columnItems.length === 0 && (
              <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                No items
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
};

const readHashRoute = () => {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  } catch {
    return "";
  }
};

/**
 * Current view of a multi-view interface, kept in the URL hash so views survive reloads and can be
 * linked. Returns the route and a navigate function; pass them to AppShell's activeNav/onNavigate.
 */
export const useRoute = (defaultRoute: string): [string, (route: string) => void] => {
  const [route, setRoute] = React.useState(() => readHashRoute() || defaultRoute);

  React.useEffect(() => {
    const handleHashChange = () => setRoute(readHashRoute() || defaultRoute);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [defaultRoute]);

  const navigate = React.useCallback((next: string) => {
    setRoute(next);
    try {
      window.location.hash = `/${encodeURIComponent(next)}`;
    } catch {
      return;
    }
  }, []);

  return [route, navigate];
};
