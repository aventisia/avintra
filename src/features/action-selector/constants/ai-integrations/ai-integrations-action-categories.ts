import { ActionCategoryType } from "../../types/action-category-type";
import { informationExtractorActions } from "./information-extractor-actions";

export const aiIntegrationActions: ActionCategoryType[] = [
    {
        name: "aiActions",
        label: "AI Actions",
        description:
          "AI Actions",
        img: `${import.meta.env.BASE_URL}function.png`,
        actions: informationExtractorActions,
        listType: "list"
    },
]