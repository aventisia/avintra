interface DTHeadingProps {
  heading: string;
}

export const DTHeading: React.FC<DTHeadingProps> = ({ heading }) => {
  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      {heading}
    </h2>
  );
};
