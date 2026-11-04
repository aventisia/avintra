import { RecordSheetLoading, RecordSheetUnavailable } from "@avplatform/ui/record-sheet";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { BookOpenTextIcon } from "@phosphor-icons/react";
import { Navigate } from "react-router-dom";

import { useFetchKnowledgeBase } from "../../hooks/useFetchKnowledgeBase";
import { KBCrudForm } from "./KBCrudForm";

interface KBCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

const KBReadRedirect = ({ rowId }: { rowId: string }) => {
  const { data, isLoading } = useFetchKnowledgeBase();
  const name = data?.data.find((item) => item.id === rowId)?.name;
  if (isLoading) return <RecordSheetLoading label="Loading knowledge base..." />;
  if (!name) return <RecordSheetUnavailable Icon={BookOpenTextIcon} recordLabel="Knowledge base" />;
  return <Navigate replace to={`/configure/knowledge-base/${rowId}?kb=${name}`} />;
};

export const KBCrudDialogContent = ({ crudAction, rowId }: KBCrudDialogContentProps) => {
  if (crudAction === "read") return <KBReadRedirect rowId={rowId} />;
  return <KBCrudForm rowId={rowId} crudAction={crudAction} />;
};
