/**
 * Renders a container for flow control button (s).
 *
 * @param children - The child elements to be rendered inside the container.
 * @returns The rendered view controls container.
 */
export const FCBContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
      {children}
    </div>
  );
};
