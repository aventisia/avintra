from typing import Optional, Any


class ToolResult:

    @staticmethod
    def success(
        message: str,
        data: Optional[Any] = None
    ) -> dict:

        return {
            "status": "success",
            "message": message,
            "data": data or {}
        }

    @staticmethod
    def failed(
        message: str,
        error: Optional[str] = None
    ) -> dict:

        return {
            "status": "failed",
            "message": message,
            "error": error
        }

    @staticmethod
    def requires_input(
        message: str,
        missing_fields: Optional[list[str]] = None,
        provided_fields: Optional[dict] = None
    ) -> dict:

        return {
            "status": "requires_input",
            "message": message,
            "missing_fields": missing_fields or [],
            "provided_fields": provided_fields or {}
        }