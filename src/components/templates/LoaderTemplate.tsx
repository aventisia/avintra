import { LoadingSpinner } from "@aventisia/ui";

const LoaderTemplate = () => {
  return (
    <div className="grid h-[calc(100vh-4rem)] place-items-center">
      <LoadingSpinner />
    </div>
  );
};

export default LoaderTemplate;
