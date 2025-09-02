interface ContentHeaderProps {
  biggerHeading?: string;
  smallerHeading?: string;
}

const ContentHeader = ({
  biggerHeading,
  smallerHeading,
}: ContentHeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <h2 className="text-center text-4xl font-medium text-foreground ">
        {biggerHeading}
      </h2>
      <p className="text-center text-md text-muted-foreground ">
        {smallerHeading}
      </p>
    </div>
  );
};

export { ContentHeader };
