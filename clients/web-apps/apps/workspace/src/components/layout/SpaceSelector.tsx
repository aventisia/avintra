import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { cn } from "@avplatform/ui/lib";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select-field/Select";
import { useFetchSpaceOptions } from "@/features/05-tenant-admin/spaces/hooks/useFetchSpaceOptions";
import { CENTRAL_SPACE_VALUE, useCurrentSpaceStore } from "@/stores/current-space-store";

/**
 * Renders a Space selector dropdown for the ribbon.
 * Lists the spaces the current user has access to and persists the selection.
 * The "Central" space is always the default and can never be blank.
 * Styled to match the dark ribbon and aligned with the left menu line.
 */
export const SpaceSelector = () => {
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

  // Get sidebar expand state to align with the left menu line
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

  const spaceOptions = data?.data || [];

  // The Select value. Central (null) is represented by the sentinel so the
  // dropdown always shows a value and is never blank.
  const selectValue = currentSpace ? currentSpace.id : CENTRAL_SPACE_VALUE;

  return (
    <div
      className={cn(
        "ml-2 transition-[margin] duration-500 md:ml-0",
        sidebarExpand ? "md:ml-[--sidebar-max-width]" : "md:ml-[--sidebar-min-width]",
      )}
    >
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
        <SelectTrigger
          size="sm"
          className="h-[2.1rem] w-[10rem] border-transparent bg-white/10 text-white shadow-none transition-all duration-300 hover:bg-white/20 focus:border-transparent focus:ring-white/30 [&>span]:text-white/80"
        >
          <SelectValue placeholder="Select Space" />
        </SelectTrigger>
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
