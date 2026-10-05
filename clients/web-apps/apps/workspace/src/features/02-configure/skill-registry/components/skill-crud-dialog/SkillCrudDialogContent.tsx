import { type DialogCrudAction } from "@avplatform/ui/types";

import { SkillCrudForm } from "./SkillCrudForm";

interface SkillCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SkillCrudDialogContent = ({ crudAction, rowId }: SkillCrudDialogContentProps) => {
  return <SkillCrudForm rowId={rowId} crudAction={crudAction} />;
};
