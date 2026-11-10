interface ContentHeaderProps {
  biggerHeading?: string;
  smallerHeading?: string;
}

const ContentHeader = ({ biggerHeading, smallerHeading }: ContentHeaderProps) => {
  return (
    <div className="w-full overflow-hidden">
      <h1 className="text-title text-ink">{biggerHeading}</h1>
      <p className="mt-2 text-body text-muted-foreground">{smallerHeading}</p>
    </div>
  );
};

export { ContentHeader };
