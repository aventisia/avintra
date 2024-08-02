import { memo } from "react";

/**
 * Renders the description for the Node component.
 */
export const NodeDescription = memo(({ children }: React.PropsWithChildren) => {
  return (
    <div className="grow truncate text-left text-sm text-muted-foreground">
      {children}
    </div>
  );
});
