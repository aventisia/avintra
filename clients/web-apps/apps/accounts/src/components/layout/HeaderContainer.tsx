interface HeaderContainerProps {
  children?: React.ReactNode;
}

const HeaderContainer = ({ children }: HeaderContainerProps) => {
  return <div className="flex w-full items-center justify-between">{children}</div>;
};

export { HeaderContainer };
