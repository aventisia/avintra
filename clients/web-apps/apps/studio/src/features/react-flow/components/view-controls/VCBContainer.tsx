/**
 * Renders a container for view control button (s).
 *
 * @param children - The child elements to be rendered inside the container.
 * @returns The rendered view controls container.
 */
export const VCBContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div
      className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};
