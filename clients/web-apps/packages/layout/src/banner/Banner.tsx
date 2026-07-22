import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { XIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  isClosable?: boolean;
  layout?: "row" | "center" | "complex";
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    { className, icon, action, onClose, isClosable = true, layout = "row", children, ...props },
    ref,
  ) => {
    // Get the state and actions from the base layout store
    const { setAppBanner } = useBaseLayoutStore(
      useShallow((state) => ({
        setAppBanner: state.setAppBanner,
      })),
    );

    const innerContent = (
      <div
        className={cn(
          "flex h-full gap-2",
          layout === "center" && "justify-center",
          layout === "complex" && "md:items-center",
        )}
      >
        {layout === "complex" ? (
          <div className="flex grow gap-3 md:items-center">
            {icon && <div className="flex shrink-0 items-center gap-3 max-md:mt-0.5">{icon}</div>}
            <div
              className={cn(
                "flex grow",
                layout === "complex" &&
                  "flex-col justify-between gap-3 md:flex-row md:items-center",
              )}
            >
              {children}
            </div>
          </div>
        ) : (
          <>
            {icon && <div className="flex shrink-0 items-center gap-3">{icon}</div>}
            <div className="flex grow items-center justify-between gap-3">{children}</div>
          </>
        )}
        {(action || isClosable) && (
          <div className="flex items-center gap-3">
            {action}
            {isClosable && (
              <Button
                variant="ghost"
                size="icon7"
                className="-my-1.5 -me-2 shrink-0 hover:bg-white/10"
                onClick={() => {
                  setAppBanner(false);
                  if (onClose) onClose();
                }}
                aria-label="Close banner"
              >
                <XIcon
                  size={18}
                  strokeWidth={2}
                  className="text-secondary-foreground opacity-60"
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full bg-secondary px-4 py-2 text-secondary-foreground md:h-[--banner-height]",
          className,
        )}
        {...props}
      >
        {innerContent}
      </div>
    );
  },
);
Banner.displayName = "Banner";

export { Banner, type BannerProps };
