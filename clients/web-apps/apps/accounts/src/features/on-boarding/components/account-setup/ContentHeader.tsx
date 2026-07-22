interface ContentHeaderProps {
  biggerHeading?: string;
  smallerHeading?: string;
}

const ContentHeader = ({ biggerHeading, smallerHeading }: ContentHeaderProps) => {
  return (
    <div className="w-full overflow-hidden">
      <h2 className="flex items-center text-4xl font-medium text-foreground">{biggerHeading}</h2>
      <p className="mt-3 flex items-center text-md text-muted-foreground">{smallerHeading}</p>
    </div>
  );
};

export { ContentHeader };
