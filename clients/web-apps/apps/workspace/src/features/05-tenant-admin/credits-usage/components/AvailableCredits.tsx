import { LoadingSpinner } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";

import { cn } from "@/ui/lib";

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
    <Badge className="border-black text-sm font-normal" variant={"outline"}>
      Available Credits:
      <span className="ml-1 font-semibold">
        {isLoading ? (
          <LoadingSpinner className="size-3 text-primary-300" />
        ) : (
          <span
            className={cn(
              "font-mono",
              data?.data?.availableCredits && data?.data?.availableCredits < 0
                ? "text-destructive"
                : "",
            )}
          >
            {data
              ? data?.data?.availableCredits.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })
              : "0"}
          </span>
        )}
      </span>
    </Badge>
  );
};

export { AvailableCredits };
