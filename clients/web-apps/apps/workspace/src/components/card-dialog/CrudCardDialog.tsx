import {
  type CrudCustomDialogProps,
  useCrudDialogChrome,
  useCrudDialogIsDirty,
} from "@avplatform/ui/crud-dialog";
import { IconTile, type IconTileProps } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { type DialogCrudAction } from "@avplatform/ui/types";
import type { FC } from "react";

import { CardDialog } from "./CardDialog";
import { CardDialogButton } from "./CardDialogButton";
import { StatusLine } from "./StatusLine";

export type CrudCardDialogConfig = {
  Icon: IconTileProps["Icon"];
  getHeader: (crudAction: DialogCrudAction) => { heading: string; description?: string };
  Content: FC<{ crudAction: DialogCrudAction; rowId: string }>;
  widthClassName?: string;
};

/**
 * Card dialog around an entity's CRUD form: the form's `name` becomes the title, and actions
 * the form wraps in `CrudDialogActions` sit in the footer next to Cancel.
 */
export const CrudCardDialog = ({
  isOpen,
  crudAction,
  rowId,
  onClose,
  onGoBack,
  banner,
  Icon,
  getHeader,
  Content,
  widthClassName = "w-[min(36rem,calc(100vw-2rem))]",
}: CrudCustomDialogProps & CrudCardDialogConfig) => {
  const isDirty = useCrudDialogIsDirty();
  const chrome = useCrudDialogChrome();
  const { heading } = getHeader(crudAction);
  const recordName = chrome?.recordName?.trim();
  const hasNameField = chrome?.recordName !== undefined;
  const isReadMode = crudAction === "read";

  const status = isReadMode ? (
    <StatusLine tone="idle">View only</StatusLine>
  ) : (
    <StatusLine tone={isDirty ? "pending" : "idle"}>
      {isDirty ? "Unsaved changes" : crudAction === "create" ? "Not saved yet" : "No changes yet"}
    </StatusLine>
  );

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={onClose}
      isOutsideClickLocked={isDirty}
      widthClassName={widthClassName}
      mark={<IconTile Icon={Icon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow={hasNameField ? heading : null}
      title={
        hasNameField ? (
          <span className={cn(!recordName && "text-muted-foreground")}>
            {recordName || "Untitled"}
          </span>
        ) : (
          heading
        )
      }
      footer={
        <>
          {status}
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onGoBack ?? onClose}>
              {onGoBack ? "Back" : isReadMode ? "Close" : "Cancel"}
            </CardDialogButton>
            <div ref={chrome?.setActionsSlot} className="flex items-center gap-2 [&>button]:h-9" />
          </div>
        </>
      }
    >
      {banner}
      <Content crudAction={crudAction} rowId={rowId} />
    </CardDialog>
  );
};
