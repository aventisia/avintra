from typing import Any

from app.features.custom_tools.schemas import ToolOperation


def parse_openapi_spec(spec: dict[str, Any]) -> list[ToolOperation]:
    operations: list[ToolOperation] = []

    paths = spec.get("paths", {})
    for path, methods in paths.items():
        for method, operation in methods.items():
            if method.lower() not in {"get", "post", "put", "patch", "delete"}:
                continue

            operation_id = operation.get("operationId") or f"{method}_{path}"
            parameters = operation.get("parameters", [])
            request_body = operation.get("requestBody")

            operations.append(
                ToolOperation(
                    operation_id=operation_id,
                    method=method.upper(),
                    path=path,
                    summary=operation.get("summary"),
                    description=operation.get("description"),
                    parameters=parameters,
                    request_body=request_body,
                    response_schema=_extract_response_schema(operation),
                )
            )

    return operations


def _extract_response_schema(operation: dict[str, Any]) -> dict[str, Any] | None:
    responses = operation.get("responses", {})
    success = responses.get("200") or responses.get("201") or next(iter(responses.values()), None)
    if not success:
        return None
    content = success.get("content", {})
    for media in content.values():
        return media.get("schema")
    return None
