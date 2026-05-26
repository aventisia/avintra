/**
 * Enum representing the supported vector store types for knowledge bases.
 * This enum is used to specify which vector store is being used for a particular knowledge base,
 * enabling the application to handle different vector store implementations accordingly.
 */
export enum VectorStoreEnum {
  pgvector = "pgvector",
  qdrant = "qdrant",
  // weaviate = "weaviate",
  // chromadb = "chromadb",
  // pinecone = "pinecone",
  // milvus = "milvus",
}
