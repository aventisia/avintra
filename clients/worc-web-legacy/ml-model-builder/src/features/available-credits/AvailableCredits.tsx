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
    <Badge variant={"outline"} className="py-2 px-4 bg-[#322D74] border-none">
      <p className="text-white flex items-center text-xs gap-1 font-semibold">
        Credits <span className="opacity-60 font-normal">-</span>{" "}
        {isLoading ? (
          <LoadingSpinner className="size-3 text-primary-300" />
        ) : (
          <span
            className={
              data?.data?.availableCredits && data?.data?.availableCredits < 0
                ? "text-destructive"
                : ""
            }
          >
            {data
              ? data?.data?.availableCredits.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })
              : "0"}
          </span>
        )}
      </p>
    </Badge>
  );
};

export { AvailableCredits };
