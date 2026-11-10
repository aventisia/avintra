export const PageContainer = ({ children }: React.PropsWithChildren) => {
  return <div className="grid min-h-screen w-full bg-bg min-[900px]:grid-cols-2">{children}</div>;
};
