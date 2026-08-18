import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

export interface VectorStoreQueryRequestDto {
  vector_store: string;
  embedding_provider: string;
  embedding_model: string;
  query: string;
  top_k: number;
  score_threshold?: number;
  kb_names?: string[];
  doc_names?: string[];
  store_credential_id?: string;
  embedding_credential_id?: string;
  ref_type: string;
  ref_id: string;
  ref_name: string;
  action: string;
  agent_name?: string;
}

export interface RetrievedChunkDto {
  content: string;
  similarity_score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorStoreQueryResponseDto {
  chunks: RetrievedChunkDto[];
}

const vectorStoreApiBaseUrl: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/vector-store`;

export const queryVectorStore = (
  dto: VectorStoreQueryRequestDto,
): Promise<VectorStoreQueryResponseDto> => {
  return axiosInstance
    .post(`${vectorStoreApiBaseUrl}/query`, dto, { headers: getStudioSpaceHeaders() })
    .then((res) => {
      const payload = res.data as
        | {
            data?: VectorStoreQueryResponseDto;
          }
        | VectorStoreQueryResponseDto;
      return ((payload as { data?: VectorStoreQueryResponseDto })?.data ??
        payload) as VectorStoreQueryResponseDto;
    });
};
