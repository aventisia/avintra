const APP_VERSION = import.meta.env.VITE_APP_VERSION;

/** Version and branding line at the bottom of the expanded sidebar. */
const SidebarBrandingFooter = (): JSX.Element => (
  <p className="flex shrink-0 items-center gap-1.5 border-t border-line px-[18px] py-1 text-2xs text-muted-foreground">
    <span className="truncate">Powered by Aventisia</span>
    {APP_VERSION && (
      <>
        <span aria-hidden className="size-[3px] rounded-full bg-current" />
        <span className="shrink-0 font-mono">v{APP_VERSION}</span>
      </>
    )}
  </p>
);

export { SidebarBrandingFooter };
