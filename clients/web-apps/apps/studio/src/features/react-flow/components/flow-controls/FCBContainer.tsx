/**
 * Renders a container for flow control button (s).
 *
 * @param children - The child elements to be rendered inside the container.
 * @returns The rendered view controls container.
 */
export const FCBContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-white p-1 shadow">{children}</div>
  );
};
