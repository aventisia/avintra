import { IconProps } from "@avplatform/ui/types";
import {
  EyeIcon,
  NotePencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { QueueWorkItemAccessTypesEnum } from "../enums/queue-work-item-access-enum";

export const QUEUE_WORK_ITEM_ACCESS_META: Record<
  QueueWorkItemAccessTypesEnum,
  {
    label: string;
    description: string;
    badgeClass?: string;
  }
> = {
  [QueueWorkItemAccessTypesEnum.FullAccess]: {
    label: "Full access",
    description: "Unrestricted access to all queue work item actions",
    badgeClass: "bg-sunken text-ink-2 border-line",
  },
  [QueueWorkItemAccessTypesEnum.View]: {
    label: "Can view",
    description: "View queue work items without changes",
    badgeClass: "bg-sunken text-ink-2 border-line",
  },
  [QueueWorkItemAccessTypesEnum.Create]: {
    label: "Can create",
    description: "Add new items to the queue",
    badgeClass: "bg-sunken text-ink-2 border-line",
  },
  [QueueWorkItemAccessTypesEnum.Edit]: {
    label: "Can edit",
    description: "Modify queue work item details or state",
    badgeClass: "bg-sunken text-ink-2 border-line",
  },
  [QueueWorkItemAccessTypesEnum.Delete]: {
    label: "Can delete",
    description: "Remove or process queue items",
    badgeClass: "bg-bad/10 text-bad border-bad/35",
  },
};

export const ACCESS_MENU_CONFIG: Record<
  QueueWorkItemAccessTypesEnum,
  {
    label: string;
    Icon: React.ComponentType<IconProps>;
  }
> = {
  [QueueWorkItemAccessTypesEnum.FullAccess]: {
    label: "Full access",
    Icon: ShieldCheckIcon,
  },
  [QueueWorkItemAccessTypesEnum.View]: {
    label: "Can view",
    Icon: EyeIcon,
  },
  [QueueWorkItemAccessTypesEnum.Create]: {
    label: "Can create",
    Icon: PlusIcon,
  },
  [QueueWorkItemAccessTypesEnum.Edit]: {
    label: "Can edit",
    Icon: NotePencilIcon,
  },
  [QueueWorkItemAccessTypesEnum.Delete]: {
    label: "Can delete",
    Icon: TrashIcon,
  },
};

export const queueAccessSelectOptions = Object.values(QueueWorkItemAccessTypesEnum).map(
  (value) => ({
    value,
    label: QUEUE_WORK_ITEM_ACCESS_META[value].label,
    description: QUEUE_WORK_ITEM_ACCESS_META[value].description,
  }),
);
