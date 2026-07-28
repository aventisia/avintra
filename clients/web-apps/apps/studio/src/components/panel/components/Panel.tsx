import React from "react";
import { X } from "lucide-react";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@avplatform/ui/buttons";
import { useHotkeys } from "react-hotkeys-hook";

// PanelContextValue defines the shape of the context used within the Panel
interface PanelContextValue {
  id: string;
  closePanel: () => void;
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
    },
    ref,
  ) => {
    // Retrieve panel state and close handler from the store
    const { panels, closePanel } = usePanelStore();

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
      }),
      [id, closePanel],
    );

    // Do not render the panel if it’s not open
    if (!isOpen) return null;

    // Class mapping for side positioning
    const sideClasses = {
      left: "left-2",
      right: "right-2",
    };

    return (
      <PanelContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "fixed z-40 overflow-clip rounded-lg border-l border-r border-border bg-background",
            "translate-x-0 transform transition-transform duration-300 ease-in-out",
            appBanner
              ? "top-[calc(var(--header-height)+var(--header-padding)+var(--banner-height)+0.5rem)]"
              : "top-[calc(var(--header-height)+var(--header-padding)+0.5rem)]",
            appBanner
              ? "h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height)-1rem)]"
              : "h-[calc(100vh-var(--header-height)-var(--header-padding)-1rem)]",
            sideClasses[panelSide],
            width,
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
          "flex h-12 items-center justify-between gap-2 border-b pl-4 pr-2 text-lg tracking-wide",
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
      <h2
        ref={ref}
        id={`panel-title-${id}`}
        className={cn("text-[1rem] font-semibold text-foreground", className)}
      >
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
        {children || <X className="h-4 w-4" />}
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
    return (
      <div
        ref={ref}
        className={cn(
          "h-[calc(100vh-var(--header-height)-3*var(--header-padding))]",
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
    const { openPanel } = usePanelStore();

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
export {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelClose,
  PanelContent,
  PanelTrigger,
};
