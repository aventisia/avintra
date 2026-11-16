import { type CSSProperties } from "react";
import { Toaster } from "sonner";

type SonnerToasterProps = {
  position?:
    "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
};

const TOASTER_STYLE = {
  "--width": "480px",
  "--border-radius": "8px",
  "--normal-bg": "var(--surface)",
  "--normal-border": "var(--line)",
  "--normal-text": "var(--ink)",
} as CSSProperties;

const SonnerToaster = ({ position = "bottom-right" }: SonnerToasterProps) => {
  return (
    <Toaster
      position={position}
      expand={false}
      visibleToasts={3}
      closeButton={false}
      gap={10}
      style={TOASTER_STYLE}
      toastOptions={{
        duration: 5000,
        classNames: {
          toast: "!gap-2.5 !py-3 !pl-3.5 !pr-2 !shadow-pop !text-body-sm",
          title: "font-semibold",
          description: "text-[13px]/[18px] text-muted-foreground",
          info: "[&_[data-icon]]:text-ink-2",
          success: "[&_[data-icon]]:text-ok",
          error: "[&_[data-icon]]:text-bad",
          warning: "[&_[data-icon]]:text-warn",
          loading: "[&_.sonner-loading-bar]:bg-live",
        },
      }}
    />
  );
};

export { SonnerToaster };
