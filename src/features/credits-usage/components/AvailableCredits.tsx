import { LoadingSpinner } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";

import { useFetchAvailableCredits } from "../hooks/useFetchAvailableCredits";

/**
 * Displays the user's available credits inside a styled badge.
 * Fetches the available credits using the `useFetchAvailableCredits` hook.
 * Shows a loading spinner while the credits are being fetched.
 *
 * @returns {JSX.Element} A badge component displaying the available credits or a loading spinner.
 */
const AvailableCredits = () => {
  // Get available credits
  const { data, isLoading } = useFetchAvailableCredits();

  return (
    <div className="flex items-center gap-4">
      <p className="text-lg font-medium">Credit Usage</p>
      <Badge className="border border-black bg-transparent px-4 py-1 text-sm text-accent-foreground">
        Credits <span className="font-normal opacity-60">-</span>{" "}
        {isLoading ? (
          <LoadingSpinner className="size-3 text-primary-300" />
        ) : (
          <>{data ? data?.data?.availableCredits.toLocaleString() : "0"}</>
        )}
      </Badge>
    </div>
  );
};

export { AvailableCredits };
