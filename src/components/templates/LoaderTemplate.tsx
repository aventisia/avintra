import { LoadingSpinner } from "@aventisia/ui";

const LoaderTemplate = () => {
  return (
    <div className="h-[calc(100vh-9rem)] grid place-items-center">
      <LoadingSpinner />
    </div>
  );
};

export default LoaderTemplate;
