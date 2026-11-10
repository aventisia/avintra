interface TableCNHeadingProps {
  heading: string;
}

export const TableCNHeading: React.FC<TableCNHeadingProps> = ({ heading }) => {
  return <h2 className="flex w-full items-center truncate text-title text-ink">{heading}</h2>;
};
