# Schemas for Vector Store feature
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, TypeAlias, Union
from datetime import datetime, timezone
from app.features.llm_providers.llm_providers_schemas import ProviderLiteral

# Supported vector storage backends
VectorStoreLiteral: TypeAlias = Literal['pgvector', 'qdrant']

# Request schema for document ingestion endpoint
class IngestDocRequest(BaseModel):
    vector_store: VectorStoreLiteral  # Target vector storage backend
    embedding_provider: ProviderLiteral  # LLM provider for embeddings (e.g., openai)
    embedding_model: str  # Embedding model ID (e.g., text-embedding-3-small)
    input: str  # Single file path, URL, data URI, or raw text string
    metadata: dict # Required metadata to associate with the ingested document (e.g., {"kb_name": "my_kb", "doc_name": "test.txt", "description": "Test document"})
    chunk_size: int = Field(default=500, ge=100, le=8000)  # Max characters per chunk
    chunk_overlap: int = Field(default=100, ge=0)  # Overlapping characters between chunks
    credential_name: Optional[str] = Field(default=None, validation_alias='credential_name', serialization_alias='credential_name')  # Credential reference for vector store (unique name)
    embedding_credential_name: Optional[str] = Field(default=None, validation_alias='embedding_credential_name', serialization_alias='embedding_credential_name')  # Credential reference for embedding provider (unique name)
    # The following fields are for future use
    batch_size: int = Field(default=100, ge=1, le=200)  # TODO: Yet to be test/implemented
    dimensions: Optional[int] = Field(default=None, ge=1)  # TODO: Yet to be test/implemented
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow"). TODO: Yet to confirm the better implemenation of this.
    ref_id: str # Identifier to link back to Agent/Workflow. TODO: Yet to confirm the better implemenation of this.
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow). TODO: Yet to confirm the better implemenation of this.
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution"). TODO: Yet to confirm the better implemenation of this.

# Response schema for document ingestion endpoint
class IngestDocResponse(BaseModel):
    vector_store: VectorStoreLiteral # The vector storage backend where embeddings are stored
    embedding_provider: ProviderLiteral # The LLM provider used for generating embeddings
    embedding_model: str # The embedding model used for generating embeddings
    metadata: dict # Metadata associated with the ingested document
    chunks_created: int # Number of chunks created from the ingested document
    embeddings_stored: int # Number of embeddings successfully stored in the vector database
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    time_taken: float  # Time taken for the entire ingestion process in seconds
    input_tokens: Optional[int] = 0
    credential_name: Optional[str] = None  # Credential reference for vector store (name, or legacy id/uuid)
    embedding_credential_name: Optional[str] = None  # Credential reference for embedding provider (name, or legacy id/uuid)
    error: Optional[str] = None

# ------------------------------------------------------------------------------------------------------

# Request schema for document query endpoint
class QueryDocRequest(BaseModel):
    vector_store: VectorStoreLiteral
    embedding_provider: ProviderLiteral
    embedding_model: str
    query: str
    top_k: int = Field(default=5, ge=1, le=100)
    score_threshold: float = Field(default=0.1, ge=0.0, le=1.0)
    kb_names: Optional[List[str]] = None  # Filter by Knowledge Base name(s)
    doc_names: Optional[List[str]] = None  # Filter by document/file name(s)
    credential_name: Optional[str] = Field(default=None, validation_alias='credential_name', serialization_alias='credential_name')  # Credential reference for vector store (unique name)
    embedding_credential_name: Optional[str] = Field(default=None, validation_alias='embedding_credential_name', serialization_alias='embedding_credential_name')  # Credential reference for embedding provider (unique name)
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow"). TODO: Yet to confirm the better implemenation of this.
    ref_id: str # Identifier to link back to Agent/Workflow. TODO: Yet to confirm the better implemenation of this.
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow). TODO: Yet to confirm the better implemenation of this.
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution"). TODO: Yet to confirm the better implemenation of this.


# Schema for individual retrieved chunk in query response
class RetrievedChunk(BaseModel):
    content: str
    similarity_score: float
    metadata: Optional[dict] = None

# Response schema for document query endpoint
class QueryDocResponse(BaseModel):
    vector_store: VectorStoreLiteral
    embedding_provider: ProviderLiteral
    embedding_model: str
    query: str
    top_k: int
    kb_names: Optional[List[str]] = None
    doc_names: Optional[List[str]] = None
    chunks: List[RetrievedChunk]
    time_taken: float
    input_tokens: Optional[int] = 0
    credential_name: Optional[str] = None
    embedding_credential_name: Optional[str] = None
    error: Optional[str] = None


# ------------------------------------------------------------------------------------------------------

# Request schemas for document deletion endpoint
class DeleteDocRequest(BaseModel):
    vector_store: VectorStoreLiteral
    # One of the kb_name or doc_name should be provided to identify the documents to delete. If both are provided, kb_name will take precedence.
    kb_names: Optional[List[str]] = None  # Delete by Knowledge Base name(s)
    doc_names: Optional[List[str]] = None  # Delete by document/file name(s)
    credential_name: Optional[str] = Field(default=None, validation_alias='credential_name', serialization_alias='credential_name')

# Response schema for document deletion endpoint
class DeleteDocResponse(BaseModel):
    vector_store: VectorStoreLiteral
    kb_names: Optional[List[str]] = None
    doc_names: Optional[List[str]] = None
    deleted_chunks: int
    time_taken: float
    error: Optional[str] = None
