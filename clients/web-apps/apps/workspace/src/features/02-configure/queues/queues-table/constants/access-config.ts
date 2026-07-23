import { IconProps } from "@avplatform/ui/types";
import { EditIcon, EyeIcon, Plus, ShieldCheck, Trash2 } from "lucide-react";

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
    label: "Full Access",
    description: "Unrestricted access to all queue work item actions",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  [QueueWorkItemAccessTypesEnum.View]: {
    label: "Can View",
    description: "View queue work items without changes",
    badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
  },
  [QueueWorkItemAccessTypesEnum.Create]: {
    label: "Can Create",
    description: "Add new items to the queue",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [QueueWorkItemAccessTypesEnum.Edit]: {
    label: "Can Edit",
    description: "Modify queue work item details or state",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  [QueueWorkItemAccessTypesEnum.Delete]: {
    label: "Can Delete",
    description: "Remove or process queue items",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
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
    label: "Full Access",
    Icon: ShieldCheck,
  },
  [QueueWorkItemAccessTypesEnum.View]: {
    label: "Can View",
    Icon: EyeIcon,
  },
  [QueueWorkItemAccessTypesEnum.Create]: {
    label: "Can Create",
    Icon: Plus,
  },
  [QueueWorkItemAccessTypesEnum.Edit]: {
    label: "Can Edit",
    Icon: EditIcon,
  },
  [QueueWorkItemAccessTypesEnum.Delete]: {
    label: "Can Delete",
    Icon: Trash2,
  },
};

export const queueAccessSelectOptions = Object.values(QueueWorkItemAccessTypesEnum).map(
  (value) => ({
    value,
    label: QUEUE_WORK_ITEM_ACCESS_META[value].label,
    description: QUEUE_WORK_ITEM_ACCESS_META[value].description,
  }),
);
