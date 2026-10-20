import { QueryKey } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { AssignUiBuilderUsersDialog } from "@/features/01-build/ui-builder-table";

import { DATA_QUERY_KEY } from "../../constants";
import { usePublishedUiStore } from "../../stores/published-ui-store";

const getPublishedUisQueryKeys = (spaceId: string | undefined): QueryKey[] => [
  [...DATA_QUERY_KEY, spaceId, "uis"],
];

const UiBuilderAssignUsersDialog = () => {
  const { open, close, uiBuilderProjectId } = usePublishedUiStore(
    useShallow((state) => ({
      open: state.usersDialogOpen,
      close: state.closeUsersDialog,
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  return (
    <AssignUiBuilderUsersDialog
      open={open}
      onClose={close}
      uiBuilderProjectId={uiBuilderProjectId}
      getProjectsQueryKeys={getPublishedUisQueryKeys}
    />
  );
};

export default UiBuilderAssignUsersDialog;
