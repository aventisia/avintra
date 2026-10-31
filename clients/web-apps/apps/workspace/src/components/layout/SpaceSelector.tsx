import { useUserSessionStore } from "@avplatform/ui/stores";
import { ChevronsUpDown } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select-field/Select";
import { useFetchSpaceOptions } from "@/features/05-tenant-admin/spaces/hooks/useFetchSpaceOptions";
import { CENTRAL_SPACE_VALUE, useCurrentSpaceStore } from "@/stores/current-space-store";

/**
 * Space selector dropdown; fills the width of its container.
 * Lists the spaces the current user has access to and persists the selection.
 * The "Central" space is always the default and can never be blank.
 */
export const SpaceSelector = ({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) => {
  // Fetch space options
  const { data } = useFetchSpaceOptions();

  // Get current space state
  const { currentSpace, setCurrentSpace, rehydrateForUser } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
      setCurrentSpace: state.setCurrentSpace,
      rehydrateForUser: state.rehydrateForUser,
    })),
  );

  // Get the current user session (email) to scope the persisted space per user.
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // When the user session becomes available (e.g. after login), re-read the
  // persisted space for that user. Defaults to Central if none is stored.
  useEffect(() => {
    if (userSession?.email) {
      rehydrateForUser();
    }
  }, [userSession?.email, rehydrateForUser]);

  const spaceOptions = data?.data || [];

  // The Select value. Central (null) is represented by the sentinel so the
  // dropdown always shows a value and is never blank.
  const selectValue = currentSpace ? currentSpace.id : CENTRAL_SPACE_VALUE;

  return (
    <div className={className}>
      <Select
        value={selectValue}
        onValueChange={(value) => {
          if (value === CENTRAL_SPACE_VALUE) {
            // Central is represented by null (no X-Space-Id header is sent).
            setCurrentSpace(null);
            return;
          }
          const selected = spaceOptions.find((option) => option.value === value);
          if (selected) {
            setCurrentSpace({ id: selected.value, name: selected.label });
          }
        }}
      >
        {showLabel ? (
          <SelectTrigger
            size="sm"
            className="h-auto w-full gap-2 rounded-md border-line bg-ink/[0.04] px-[9px] py-[3px] text-left text-[13px] font-semibold text-ink shadow-none hover:bg-ink/[0.06] [&>svg:last-child]:hidden"
          >
            <div className="min-w-0">
              <small className="block text-[11px] font-medium text-muted-foreground">Space</small>
              <div className="truncate">
                <SelectValue placeholder="Select space" />
              </div>
            </div>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </SelectTrigger>
        ) : (
          <SelectTrigger
            size="sm"
            className="h-[34px] w-full border-line bg-sunken text-[13px] font-semibold text-ink shadow-none hover:bg-hover"
          >
            <SelectValue placeholder="Select space" />
          </SelectTrigger>
        )}
        <SelectContent>
          {/* Central is always the first, default option and can never be blank. */}
          <SelectItem value={CENTRAL_SPACE_VALUE}>Central</SelectItem>
          {spaceOptions
            .filter((option) => !option.isDefault)
            .map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
