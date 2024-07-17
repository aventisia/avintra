interface HeaderContainerProps {
  children?: React.ReactNode;
}

const HeaderContainer = ({ children }: HeaderContainerProps) => {
  return (
    <div className="flex w-full items-center justify-between p-5 xs:p-3">
      {children}
    </div>
  );
};

export { HeaderContainer };
