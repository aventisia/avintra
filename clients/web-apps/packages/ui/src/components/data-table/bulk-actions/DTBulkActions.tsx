export function DTBulkActions({ children }: React.PropsWithChildren) {
  return (
    <div className="fixed bottom-4 left-1/2 flex -translate-x-1/2 transform items-center justify-between gap-3 rounded-lg border bg-white px-4 py-2 text-sm shadow-lg">
      {children}
    </div>
  );
}
