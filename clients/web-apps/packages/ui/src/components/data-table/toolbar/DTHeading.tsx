interface DTHeadingProps {
  heading: string;
}

export const DTHeading: React.FC<DTHeadingProps> = ({ heading }) => {
  return <h2 className="flex w-full items-center truncate text-title text-ink">{heading}</h2>;
};
