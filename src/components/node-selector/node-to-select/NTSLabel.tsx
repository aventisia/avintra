/**
 * Renders a label for the NTS (Node To Select) component.
 */
export const NTSLabel = ({ children }: React.PropsWithChildren) => {
  return (
    <h2 className="flex items-center text-xs font-medium text-foreground">
      {children}
    </h2>
  );
};
