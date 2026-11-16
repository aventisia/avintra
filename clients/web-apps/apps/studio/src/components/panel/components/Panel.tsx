import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { XIcon } from "@phosphor-icons/react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";

// PanelContextValue defines the shape of the context used within the Panel
interface PanelContextValue {
  id: string;
  closePanel: () => void;
  contained: boolean;
}

// Create a context to manage individual panel behavior
const PanelContext = React.createContext<PanelContextValue | null>(null);

// Custom hook to consume PanelContext
const usePanelContext = () => {
  const context = React.useContext(PanelContext);
  if (!context) {
    throw new Error("Panel components must be used within a Panel");
  }
  return context;
};

// Panel root component
interface PanelProps {
  children: React.ReactNode;
  id: string;
  side?: "left" | "right";
  width?: string;
  className?: string;
  closeOnEscape?: boolean;
  /**
   * Anchor the panel to its nearest positioned ancestor (e.g. the canvas pane)
   * instead of the browser viewport. Contained panels are inset vertically and
   * no longer cover sibling panes.
   */
  contained?: boolean;
  /** When contained, span the full width of the ancestor instead of `side`/`width`. */
  fill?: boolean;
  /**
   * Not contained only: sit flush against the header and the browser's side and bottom edges,
   * with no inset or rounded corners.
   */
  flush?: boolean;
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      children,
      id,
      side = "right",
      width = "w-96",
      className,
      closeOnEscape = true,
      contained = false,
      fill = false,
      flush = false,
    },
    ref,
  ) => {
    // Retrieve panel state and close handler from the store
    const { panels, closePanel } = usePanelStore(
      useShallow((state) => ({
        panels: state.panels,
        closePanel: state.closePanel,
      })),
    );

    // Get the appBanner state using shallow equality check for optimization
    const { appBanner } = useBaseLayoutStore(
      useShallow((state) => ({
        appBanner: state.appBanner,
      })),
    );

    const panel = panels[id];
    const isOpen = panel?.isOpen || false;
    const panelSide = panel?.side || side;

    // Set up escape key to close the panel if enabled
    useHotkeys(
      "esc",
      () => {
        closePanel(id);
      },
      {
        enabled: isOpen && closeOnEscape,
        preventDefault: true,
      },
      [id, closePanel, isOpen],
    );

    // Memoize context value to avoid unnecessary re-renders
    const contextValue = React.useMemo(
      () => ({
        id,
        closePanel: () => closePanel(id),
        contained,
      }),
      [id, closePanel, contained],
    );

    // Do not render the panel if it’s not open
    if (!isOpen) return null;

    // Class mapping for side positioning
    const sideClasses = {
      left: "left-0",
      right: "right-0",
    };

    return (
      <PanelContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "z-40 overflow-clip rounded-xl bg-surface shadow-pop",
            "translate-x-0 transform transition-transform duration-200 ease-in-out motion-reduce:transition-none",
            contained
              ? cn(
                  "absolute inset-y-0 border border-line",
                  fill ? "inset-x-0 w-auto" : cn(sideClasses[panelSide], width),
                )
              : flush
                ? cn(
                    "fixed bottom-0 border-l border-line rounded-none",
                    appBanner
                      ? "top-[calc(var(--header-height)+var(--banner-height))]"
                      : "top-[var(--header-height)]",
                    sideClasses[panelSide],
                    width,
                  )
                : cn(
                    "fixed border-l border-r border-line",
                    appBanner
                      ? "top-[calc(var(--header-height)+var(--banner-height)+0.5rem)]"
                      : "top-[calc(var(--header-height)+0.5rem)]",
                    appBanner
                      ? "h-[calc(100vh-var(--header-height)-var(--banner-height)-1rem)]"
                      : "h-[calc(100vh-var(--header-height)-1rem)]",
                    sideClasses[panelSide],
                    width,
                  ),
            className,
          )}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`panel-title-${id}`}
        >
          {children}
        </div>
      </PanelContext.Provider>
    );
  },
);
Panel.displayName = "Panel";

// PanelHeader defines the header layout of the panel
interface PanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const PanelHeader = React.forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ children, className }, ref) => {
    usePanelContext(); // Ensure header is used inside a Panel

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-12 items-center justify-between gap-2 border-b border-line pl-4 pr-2 text-heading",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
PanelHeader.displayName = "PanelHeader";

// PanelTitle renders the panel’s title with semantic heading
interface PanelTitleProps {
  children: React.ReactNode;
  className?: string;
}

const PanelTitle = React.forwardRef<HTMLHeadingElement, PanelTitleProps>(
  ({ children, className }, ref) => {
    const { id } = usePanelContext();

    return (
      <h2 ref={ref} id={`panel-title-${id}`} className={cn("text-heading text-ink", className)}>
        {children}
      </h2>
    );
  },
);
PanelTitle.displayName = "PanelTitle";

// PanelClose is a button to close the panel
interface PanelCloseProps {
  className?: string;
  children?: React.ReactNode;
}

const PanelClose = React.forwardRef<HTMLButtonElement, PanelCloseProps>(
  ({ className, children }, ref) => {
    const { closePanel } = usePanelContext();

    return (
      <Button
        ref={ref}
        onClick={closePanel}
        variant={"ghost"}
        size={"icon8"}
        className={cn(className)}
        aria-label="Close panel"
      >
        {children || <XIcon className="h-4 w-4" />}
      </Button>
    );
  },
);
PanelClose.displayName = "PanelClose";

// PanelContent wraps the scrollable content area of the panel
interface PanelContentProps {
  children: React.ReactNode;
  className?: string;
}

const PanelContent = React.forwardRef<HTMLDivElement, PanelContentProps>(
  ({ children, className }, ref) => {
    const { contained } = usePanelContext();

    return (
      <div
        ref={ref}
        className={cn(
          contained
            ? "h-[calc(100%-3rem)]"
            : "h-[calc(100vh-var(--header-height)-3*var(--header-padding))]",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
PanelContent.displayName = "PanelContent";

// PanelTrigger opens the corresponding panel by ID when clicked
interface PanelTriggerProps {
  children: React.ReactNode;
  panelId: string;
  side?: "left" | "right";
  asChild?: boolean;
  className?: string;
}

const PanelTrigger = React.forwardRef<HTMLButtonElement, PanelTriggerProps>(
  ({ children, panelId, side = "right", asChild = false, className }, ref) => {
    const { openPanel } = usePanelStore(useShallow((state) => ({ openPanel: state.openPanel })));

    // Memoize click handler for performance
    const handleClick = React.useCallback(() => {
      openPanel(panelId, side);
    }, [openPanel, panelId, side]);

    // Support using a custom child component as trigger
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        onClick: handleClick,
        ref,
      });
    }

    return (
      <Button
        size="icon8"
        variant="ghost"
        ref={ref}
        onClick={handleClick}
        className={cn(className)}
      >
        {children}
      </Button>
    );
  },
);
PanelTrigger.displayName = "PanelTrigger";

// Export all panel-related components
export { Panel, PanelHeader, PanelTitle, PanelClose, PanelContent, PanelTrigger };
