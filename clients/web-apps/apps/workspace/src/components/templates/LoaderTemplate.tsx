import { LoadingSpinner } from "@avplatform/ui";

const LoaderTemplate = () => {
  return (
    <div className="grid h-[calc(100vh-4rem)] place-items-center">
      <LoadingSpinner className="h-10 w-10 text-primary" />
    </div>
  );
};

export default LoaderTemplate;
