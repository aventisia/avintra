/**
 * Renders a container for view control button (s).
 *
 * @param children - The child elements to be rendered inside the container.
 * @returns The rendered view controls container.
 */
export const VCBContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center rounded-lg border bg-white p-1 shadow">
      {children}
    </div>
  );
};
