import { useQuery } from "@tanstack/react-query";

async function fetchPromptTemplate(fileKey: string) {
  const res = await fetch(`prompt-templates/${fileKey}.txt`);

  if (!res.ok) {
    throw new Error("Failed to load prompt template");
  }

  return res.text();
}

export function useFetchPromptTemplate(fileKey?: string) {
  return useQuery({
    queryKey: ["prompt-template", fileKey],
    queryFn: () => fetchPromptTemplate(fileKey!),
    enabled: !!fileKey,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
