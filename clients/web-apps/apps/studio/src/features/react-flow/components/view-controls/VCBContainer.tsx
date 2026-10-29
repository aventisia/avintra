/**
 * Renders a container for view control button (s).
 *
 * @param children - The child elements to be rendered inside the container.
 * @returns The rendered view controls container.
 */
export const VCBContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div
      className="flex items-center rounded-lg border border-line bg-surface p-1"
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};
