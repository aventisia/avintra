/**
 * Renders the description for the Node component.
 */
export const NodeDescription = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="grow truncate text-left text-sm text-muted-foreground">
      {children}
    </div>
  );
};
