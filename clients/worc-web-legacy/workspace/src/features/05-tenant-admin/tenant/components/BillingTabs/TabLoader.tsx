import { LoadingSpinner } from "@aventisia/ui";

const TabLoader = () => {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <LoadingSpinner className="h-8 w-8 text-primary" />
    </div>
  );
};

export default TabLoader;
