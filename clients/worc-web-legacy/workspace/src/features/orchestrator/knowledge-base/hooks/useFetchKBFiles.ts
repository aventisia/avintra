import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { DETAIL_DATA_QUERY_KEY } from "../constants";
import { KnowledgeBaseFileDto } from "../dtos/kb-file-dto";

const getKnowledgeBase = async (): Promise<{
  data: KnowledgeBaseFileDto[];
}> => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    data: [
      {
        id: "1",
        fileName: "ai-research-paper-2024.pdf",
        fileSize: "1.8MB",
        createdBy: "Pooja",
        createdOn: "2025-11-28T10:15:00Z",
      },
      {
        id: "2",
        fileName: "customer-support-guidelines.docx",
        fileSize: "3.1MB",
        createdBy: "Sneha Patil",
        createdOn: "2025-11-27T14:30:00Z",
      },
      {
        id: "3",
        fileName: "product-architecture-overview.pdf",
        fileSize: "2.6MB",
        createdBy: "Amit Kulkarni",
        createdOn: "2025-11-26T09:45:00Z",
      },
      {
        id: "4",
        fileName: "onboarding-process-v2.docx",
        fileSize: "1.2MB",
        createdBy: "Priya Deshmukh",
        createdOn: "2025-11-25T16:20:00Z",
      },
      {
        id: "5",
        fileName: "ml-model-training-notes.txt",
        fileSize: "900KB",
        createdBy: "Vikram Joshi",
        createdOn: "2025-11-24T11:10:00Z",
      },
      {
        id: "6",
        fileName: "api-integration-guide.pdf",
        fileSize: "2.9MB",
        createdBy: "Neha Verma",
        createdOn: "2025-11-23T13:05:00Z",
      },
    ],
  };
};
/**
 * Custom hook to fetch knowledgeBase using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchKBFiles = () => {
  // Get knowledgeBase using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DETAIL_DATA_QUERY_KEY,
    queryFn: () => getKnowledgeBase(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
