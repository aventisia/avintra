"""Shared utilities for vector store implementations."""
import os
from typing import Union, List

from fastapi import HTTPException, status

from app.features.extract_file_text.extract_file_text_service import extract_text_from_file


class VectorStoreInputResolver:
    """Handles resolution of ingestion input into plain text for any vector store backend."""

    @staticmethod
    def resolve_source_text(input_value: str) -> str:
        """
        Resolve one input item from file/url/data-uri/text into plain text.
        
        If the input is a file path, URL, or data URI, extract text using extract_text_from_file.
        Otherwise treat it as raw text and return as-is.
        """
        source_value = (input_value or "").strip()
        if not source_value:
            return ""

        if VectorStoreInputResolver._is_extractable_source(source_value):
            return extract_text_from_file(source_value)

        return source_value    

    @staticmethod
    def _is_extractable_source(source_value: str) -> bool:
        """Check if a string is a file path, URL, or data URI that can be extracted."""
        return (
            source_value.startswith("http://")
            or source_value.startswith("https://")
            or source_value.startswith("data:")
            or os.path.exists(source_value)
        )

class VectorStoreTextChunker:
    """Handles text chunking with overlap for any vector store backend."""

    @staticmethod
    def chunk_text(text_value: str, chunk_size: int, chunk_overlap: int) -> list[str]:
        """
        Chunk text using a simple sliding-window approach with overlap.
        
        Preserves context continuity across chunks.
        
        Args:
            text_value: The text to chunk
            chunk_size: Maximum characters per chunk (validated: 100-8000)
            chunk_overlap: Overlapping characters between chunks (must be < chunk_size)
        
        Returns:
            List of text chunks. Empty list if input is empty after stripping.
        
        Raises:
            HTTPException: If chunk_overlap >= chunk_size
        """
        
        # Clean the input text
        clean_text = (text_value or "").strip()
        if not clean_text:
            return []

        # Validate chunking parameters
        if chunk_overlap >= chunk_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="chunk_overlap must be less than chunk_size.",
            )

        # Chunk the text using a sliding window approach
        chunks: list[str] = []
        step = chunk_size - chunk_overlap
        index = 0

        # Iterate through the text, creating chunks with the specified overlap
        while index < len(clean_text):
            chunk = clean_text[index : index + chunk_size].strip()
            if chunk:
                chunks.append(chunk)
            index += step

        return chunks
