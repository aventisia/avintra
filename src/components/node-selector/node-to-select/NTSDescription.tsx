/**
 * Renders the description for the NTS (Node To Select) component.
 */
export const NTSDescription = ({ children }: React.PropsWithChildren) => {
  return (
    <p className="w-[90%] truncate text-2xs text-muted-foreground">
      {children}
    </p>
  );
};
