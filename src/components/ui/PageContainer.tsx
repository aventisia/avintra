export const PageContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex h-fit min-h-screen w-full space-x-2 overflow-auto p-3">
      {children}
    </div>
  );
};
