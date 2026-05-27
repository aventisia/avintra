import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { KnowledgeBaseFileDto, VectorizationStatus } from "../dtos/kb-file-dto";

// TODO: Move the Dtos to a separate files

interface KBRegisterFileDto {
  fileUrl: string;
  fileName: string;
  fileSizeInBytes: number;
  fileExtension?: string;
  chunkSize: number;
  chunkOverlap: number;
}

interface KBRegisterTextDto {
  textContent: string;
  fileName: string;
  chunkSize: number;
  chunkOverlap: number;
}

interface VectorStoreIngestRequestDto {
  vector_store: string;
  embedding_provider: string;
  embedding_model: string;
  input: string;
  metadata: Record<string, string>;
  chunk_size: number;
  chunk_overlap: number;
  store_credential_id?: string;
  embedding_credential_id?: string;
  ref_type: string;
  ref_id: string;
  ref_name: string;
  action: string;
  agent_name?: string;
}

interface VectorStoreQueryRequestDto {
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

interface VectorStoreDeleteRequestDto {
  vector_store: string;
  // One of the kb_name or doc_name should be provided to identify the documents to delete. If both are provided, kb_name will take precedence.
  kb_names?: string[];
  doc_names?: string[];
  store_credential_id?: string;
}

interface RetrievedChunkDto {
  content: string;
  similarity_score: number;
  metadata?: Record<string, unknown>;
}

interface VectorStoreQueryResponseDto {
  chunks: RetrievedChunkDto[];
}

interface KBUpdateFileStatusDto {
  status: VectorizationStatus;
  chunksCount: number;
  errorMessage?: string;
}

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/knowledge-base`;
const vectorStoreApiBaseUrl: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/vector-store`;

export const getKnowledgeBaseFiles = (knowledgeBaseId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<KnowledgeBaseFileDto[]>
    >(`${baseAPIURL}/${knowledgeBaseId}/files`)
    .then((res) => res.data);
};

export const registerKnowledgeBaseFile = (
  knowledgeBaseId: string,
  dto: KBRegisterFileDto,
) => {
  return axiosInstance
    .post<
      IHttpResponse<KnowledgeBaseFileDto>
    >(`${baseAPIURL}/${knowledgeBaseId}/files/register`, dto)
    .then((res) => res.data);
};

export const registerKnowledgeBaseText = (
  knowledgeBaseId: string,
  dto: KBRegisterTextDto,
) => {
  return axiosInstance
    .post<
      IHttpResponse<KnowledgeBaseFileDto>
    >(`${baseAPIURL}/${knowledgeBaseId}/files/register-text`, dto)
    .then((res) => res.data);
};

export const deleteKnowledgeBaseFile = (
  knowledgeBaseId: string,
  fileId: string,
) => {
  return axiosInstance
    .delete<
      IHttpResponse<boolean>
    >(`${baseAPIURL}/${knowledgeBaseId}/files/${fileId}`)
    .then((res) => res.data);
};

export const updateKnowledgeBaseFileStatus = (
  knowledgeBaseId: string,
  fileId: string,
  dto: KBUpdateFileStatusDto,
) => {
  return axiosInstance
    .patch<
      IHttpResponse<KnowledgeBaseFileDto>
    >(`${baseAPIURL}/${knowledgeBaseId}/files/${fileId}/status`, dto)
    .then((res) => res.data);
};

export const ingestVectorStoreInput = (dto: VectorStoreIngestRequestDto) => {
  return axiosInstance
    .post(`${vectorStoreApiBaseUrl}/ingest`, dto, { timeout: 5 * 60 * 1000 })
    .then((res) => {
      const payload = res.data as { data?: unknown } | unknown;
      return (payload as { data?: unknown })?.data ?? payload;
    });
};

export const queryVectorStore = (
  dto: VectorStoreQueryRequestDto,
): Promise<VectorStoreQueryResponseDto> => {
  return axiosInstance
    .post(`${vectorStoreApiBaseUrl}/query`, dto)
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

export const deleteVectorStoreDocument = (dto: VectorStoreDeleteRequestDto) => {
  return axiosInstance
    .delete(`${vectorStoreApiBaseUrl}/delete`, {
      data: dto,
    })
    .then((res) => {
      const payload = res.data as { data?: unknown } | unknown;
      return (payload as { data?: unknown })?.data ?? payload;
    });
};

export type {
  KBRegisterFileDto,
  KBRegisterTextDto,
  KBUpdateFileStatusDto,
  RetrievedChunkDto,
  VectorStoreDeleteRequestDto,
  VectorStoreIngestRequestDto,
  VectorStoreQueryRequestDto,
};
