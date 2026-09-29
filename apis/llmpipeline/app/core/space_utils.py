"""Helpers for resolving resources across request, Central, and other spaces."""

from uuid import UUID


def normalize_space_id(space_id: str | UUID | None) -> UUID | None:
    """Return a valid space UUID, treating missing/invalid headers as Central."""

    if space_id is None or str(space_id).strip() == "":
        return None
    try:
        return space_id if isinstance(space_id, UUID) else UUID(str(space_id))
    except (TypeError, ValueError, AttributeError):
        return None
