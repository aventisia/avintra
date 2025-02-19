export const PageContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex h-fit min-h-screen w-full max-w-[1536px] space-x-2 overflow-auto p-3">
      {children}
    </div>
  );
};
