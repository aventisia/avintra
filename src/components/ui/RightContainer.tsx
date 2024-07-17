interface RightContainerProps {
  children?: React.ReactNode;
}

const RightContainer = ({ children }: RightContainerProps) => {
  return (
    <div className="hidden flex-col items-center justify-center rounded-[1.5rem] bg-gray-100 lg:flex lg:w-[50%]">
      {children}
    </div>
  );
};

export { RightContainer };
