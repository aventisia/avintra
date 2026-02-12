import { LoadingSpinner } from "../_components/ui";

export default function Loading() {
  return (
    <div className="h-[90vh] flex items-center justify-center">
      <LoadingSpinner className="h-10 w-10 text-primary" />
    </div>
  );
}
