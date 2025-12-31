import { PrimaryCategoryType } from "@/features/action-selector/types/primary-category-type";
import { FlowBlockDto } from "../dtos/flow-block-dtos";
import { ActionCategoryType } from "@/features/action-selector/types/action-category-type";

export function createActivityJson(
  data: FlowBlockDto[],
): PrimaryCategoryType[] {
  const blockConfig: Record<string, string> = {};

  const arr: ActionCategoryType[] = data.map((value: FlowBlockDto) => {
    if (value.name && value.inputOutputObject) {
      blockConfig[value.name] = JSON.parse(value.inputOutputObject);
    }
    return {
      label: "Blocks",
      description: "Blocks",
      icon: "",
      img: "/function.png",
      listType: "list" as const,
      actions: [
        {
          type: "blockNode",
          name: value.name ?? "",
          label: value.name ?? "",
          description: value.description ?? "",
          docsLink: "",
          icon: "BlockNodeIcon",
          img: "/function.png",
        },
      ],
    };
  });

  sessionStorage.setItem("block-config", JSON.stringify(blockConfig));
  return [
    {
      label: "Blocks",
      description: "Blocks",
      icon: "BLockIcon",
      img: "",
      actionCategories: arr,
    },
  ];
}
