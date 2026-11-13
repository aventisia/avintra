import { IconTile } from "@avplatform/ui/icon-tile";
import { BracketsCurlyIcon, CubeIcon, FileArrowUpIcon, FlowArrowIcon } from "@phosphor-icons/react";
import React from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";

export interface ImportSummary {
  nodes: number;
  connections: number;
  variables: number;
}

interface ImportConfirmationDialogProps {
  open: boolean;
  isPending: boolean;
  summary: ImportSummary;
  onConfirm: () => void;
  onOpenChange?(open: boolean): void;
}

const SUMMARY_ITEMS = [
  { key: "nodes", label: "Nodes", Icon: CubeIcon },
  { key: "connections", label: "Connections", Icon: FlowArrowIcon },
  { key: "variables", label: "Variables", Icon: BracketsCurlyIcon },
] as const;

/** Confirms replacing the current canvas with an imported file, showing what the file contains. */
export const ImportConfirmationDialog: React.FC<ImportConfirmationDialogProps> = ({
  open,
  onOpenChange,
  isPending,
  summary,
  onConfirm,
}) => (
  <CardDialog
    isOpen={open}
    onClose={() => onOpenChange?.(false)}
    isDismissLocked={isPending}
    mark={
      <IconTile
        Icon={FileArrowUpIcon}
        size="lg"
        className="size-12 rounded-lg text-bad [&>svg]:size-6"
      />
    }
    eyebrow="Import agent"
    eyebrowClassName="text-bad"
    title="Replace the canvas"
    footer={
      <>
        <p className="min-w-0 truncate text-[12.5px] text-muted-foreground">
          Nothing changes until you import
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <CardDialogButton
            data-autofocus
            onClick={() => onOpenChange?.(false)}
            disabled={isPending}
          >
            Cancel
          </CardDialogButton>
          <CardDialogButton
            variant="danger"
            onClick={onConfirm}
            isBusy={isPending}
            disabled={isPending}
          >
            {isPending ? "Importing" : "Import"}
          </CardDialogButton>
        </div>
      </>
    }
  >
    <div className="flex items-start justify-center gap-4 rounded-md bg-sunken/80 px-4 py-4 ring-1 ring-line">
      {SUMMARY_ITEMS.map(({ key, label, Icon }) => (
        <div key={key} className="flex w-24 flex-col items-center gap-1.5">
          <span className="grid size-9 place-items-center rounded-md bg-popover text-ink-2 ring-1 ring-line">
            <Icon className="size-4" />
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums text-ink">
            {summary[key]}
          </span>
          <span className="text-[12px] font-medium text-ink-2">{label}</span>
        </div>
      ))}
    </div>
    <p className="mt-4 text-[13px] leading-5 text-ink-2">
      Review what this file contains. The current canvas and its variables will be overwritten by
      this file.
    </p>
  </CardDialog>
);
