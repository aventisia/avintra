import { QueryKey } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { UI_BUILDER_QUERY_KEY } from "../../constants";
import { useUiBuilderUsersStore } from "../../stores/ui-builder-users-store";
import { AssignUiBuilderUsersDialog } from "./AssignUiBuilderUsersDialog";

const getUiBuilderProjectsQueryKeys = (spaceId: string | undefined): QueryKey[] => [
  [...UI_BUILDER_QUERY_KEY, spaceId ?? ""],
  [...UI_BUILDER_QUERY_KEY, "SHARED", spaceId ?? ""],
];

const UiBuilderAssignUsersDialog = () => {
  const { open, setOpen, uiBuilderProjectId } = useUiBuilderUsersStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  return (
    <AssignUiBuilderUsersDialog
      open={open}
      onClose={() => setOpen(false)}
      uiBuilderProjectId={uiBuilderProjectId}
      getProjectsQueryKeys={getUiBuilderProjectsQueryKeys}
    />
  );
};

export default UiBuilderAssignUsersDialog;
