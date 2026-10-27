export function DTBulkActions({ children }: React.PropsWithChildren) {
  return (
    <div className="fixed bottom-4 left-1/2 flex -translate-x-1/2 transform items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2 text-body-sm shadow-pop">
      {children}
    </div>
  );
}
