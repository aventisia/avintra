import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { DATA_QUERY_KEY } from "../constants";
import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";
//import { EmbeddingModelEnum } from "../enums/embedding-models-enum";
//import { VectorStoreEnum } from "../enums/vector-store-enum";

const getKnowledgeBase = async (): Promise<{
  data: KnowledgeBaseTableDto[];
}> => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: [
    //   {
    //     id: "kb-001",
    //     name: "Product Documentation",
    //     description:
    //       "Contains all product manuals and technical documentation. Contains all product manuals and technical documentation.",
    //     vectorStore: VectorStoreEnum.Qdrant,
    //     embeddingModel: EmbeddingModelEnum["text-embedding-3-large"],
    //     isDisabled: false,
    //     createdBy: "admin",
    //     createdOn: new Date("2026-01-10T10:15:00Z"),
    //     lastModifiedBy: "admin",
    //     lastModifiedOn: new Date("2026-02-01T12:00:00Z"),
    //   },
    //   {
    //     id: "kb-002",
    //     name: "Customer Support KB",
    //     description: "FAQs and support articles.",
    //     vectorStore: VectorStoreEnum.Weaviate,
    //     embeddingModel: EmbeddingModelEnum["text-embedding-3-small"],
    //     isDisabled: false,
    //     createdBy: "support_user",
    //     createdOn: new Date("2026-01-15T09:00:00Z"),
    //     lastModifiedBy: "support_user",
    //     lastModifiedOn: new Date("2026-02-05T14:30:00Z"),
    //   },
    //   {
    //     id: "kb-003",
    //     name: "HR Policies",
    //     description: "Internal HR documents.",
    //     vectorStore: VectorStoreEnum.Qdrant,
    //     embeddingModel: EmbeddingModelEnum["text-embedding-ada-002"],
    //     isDisabled: true,
    //     createdBy: "hr_admin",
    //     createdOn: new Date("2026-01-20T08:45:00Z"),
    //     lastModifiedBy: "hr_admin",
    //     lastModifiedOn: new Date("2026-02-03T11:20:00Z"),
    //   },
    //   {
    //     id: "kb-004",
    //     name: "Engineering Wiki",
    //     description: "Architecture and engineering notes.",
    //     vectorStore: VectorStoreEnum.Qdrant,
    //     embeddingModel: EmbeddingModelEnum["text-embedding-3-large"],
    //     isDisabled: false,
    //     createdBy: "eng_lead",
    //     createdOn: new Date("2026-01-25T13:10:00Z"),
    //     lastModifiedBy: "dev_user",
    //     lastModifiedOn: new Date("2026-02-07T16:40:00Z"),
    //   },
    //   {
    //     id: "kb-005",
    //     name: "Sales Playbook",
    //     description: "Sales strategies and scripts.",
    //     vectorStore: VectorStoreEnum.Weaviate,
    //     embeddingModel: EmbeddingModelEnum["text-embedding-3-small"],
    //     isDisabled: false,
    //     createdBy: "sales_manager",
    //     createdOn: new Date("2026-01-28T07:30:00Z"),
    //     lastModifiedBy: "sales_manager",
    //     lastModifiedOn: new Date("2026-02-06T10:15:00Z"),
    //   },
    //   {
    //     id: "kb-006",
    //     name: "Legal Documents",
    //     description: "Contracts and compliance docs.",
    //     vectorStore: VectorStoreEnum.Qdrant,
    //     embeddingModel: EmbeddingModelEnum["text-embedding-ada-002"],
    //     isDisabled: true,
    //     createdBy: "legal_team",
    //     createdOn: new Date("2026-02-01T11:00:00Z"),
    //     lastModifiedBy: "legal_team",
    //     lastModifiedOn: new Date("2026-02-08T09:50:00Z"),
    //   },
    ],
  };
};
/**
 * Custom hook to fetch knowledgeBase using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchKnowledgeBase = () => {
  // Get knowledgeBase using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getKnowledgeBase(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
