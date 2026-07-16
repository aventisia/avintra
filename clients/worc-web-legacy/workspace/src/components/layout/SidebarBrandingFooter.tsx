// components/sidebar-branding-footer.tsx
import { cn } from "@aventisia/ui/lib";
import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

/**
 * Branding footer displayed at the bottom of the sidebar.
 *
 * @returns {JSX.Element} The rendered SidebarBrandingFooter component.
 *
 * @remarks
 * - Reads `sidebarExpand` directly from `useBaseLayoutStore`.
 * - When collapsed, shows only the logo centered.
 * - When expanded, shows the full "Powered by Aventisia Technologies" label.
 */
const SidebarBrandingFooter = (): JSX.Element => {
  const sidebarExpand = useBaseLayoutStore(
    useShallow((state) => state.sidebarExpand),
  );

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3 border-t justify-center  p-3 transition-all duration-500",
        !sidebarExpand && "justify-center px-0",
      )}
    >
      {sidebarExpand ? (
        <>
          <span className="truncate text-xs  text-muted-foreground">
            Powered by
          </span>
          <img
            src="/workspace/logo.svg"
            alt="Aventisia Technologies"
            className="h-4  shrink-0"
          />
        </>
      ) : (
        <img
          src="/workspace/favicon.svg"
          alt="Aventisia Technologies"
          className="h-4 w-4 shrink-0"
        />
      )}
    </div>
  );
};

export { SidebarBrandingFooter };
