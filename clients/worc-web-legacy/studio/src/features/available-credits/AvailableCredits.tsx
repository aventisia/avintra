import { LoadingSpinner } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";

import { useFetchAvailableCredits } from "./useFetchAvailableCredits";

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
    <Badge variant={"outline"} className="border-none bg-[#322D74] px-4 py-2">
      <p className="flex items-center gap-1 text-xs font-semibold text-white">
        Credits <span className="font-normal opacity-60">-</span>{" "}
        {isLoading ? (
          <LoadingSpinner className="text-primary-300 size-3" />
        ) : (
          <>
            {data
              ? data?.data?.availableCredits.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })
              : "0"}
          </>
        )}
      </p>
    </Badge>
  );
};

export { AvailableCredits };
