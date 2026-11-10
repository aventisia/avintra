import { RecordSheetLoading, RecordSheetUnavailable } from "@avplatform/ui/record-sheet";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { PuzzlePieceIcon } from "@phosphor-icons/react";
import { Navigate } from "react-router-dom";

import { TABLE_TAB_QUERY_PARAM } from "../../constants";
import { useFetchSkills } from "../../hooks/useFetchSkills.hook";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { SkillCrudForm } from "./SkillCrudForm";

interface SkillCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

const SkillReadRedirect = ({ rowId }: { rowId: string }) => {
  const { data, isLoading } = useFetchSkills();
  const { isPlatformTab } = useTableTab();
  const name = data?.data.find((item) => item.id === rowId)?.name;
  if (isLoading) return <RecordSheetLoading label="Loading skill..." />;
  if (!name) return <RecordSheetUnavailable Icon={PuzzlePieceIcon} recordLabel="Skill" />;
  return (
    <Navigate
      replace
      to={`/configure/skill-registry/${rowId}?skill=${name}${
        isPlatformTab ? `&${TABLE_TAB_QUERY_PARAM}=platform` : ""
      }`}
    />
  );
};

export const SkillCrudDialogContent = ({ crudAction, rowId }: SkillCrudDialogContentProps) => {
  if (crudAction === "read") return <SkillReadRedirect rowId={rowId} />;
  return <SkillCrudForm rowId={rowId} crudAction={crudAction} />;
};
