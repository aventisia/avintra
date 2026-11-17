"""Warns when a client still sends the removed ``is_byok_enabled`` flag.

BYOK is decided by ``credential_name`` alone. The removed flag stays accepted
(with ``extra="ignore"``) so old payloads keep working, but a request that
asked for BYOK through the flag must be visible in logs: it now runs on the
platform credentials in the same way as any other blank credential, rather
than failing loudly as it used to.

IMPORTANT NOTE: this fail-open behaviour is deliberate and still awaiting
product sign-off; until it is signed off, a warning is the only signal.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, model_validator

from app.core.logger import logger


def warn_on_legacy_byok_flag(data: Any, *, where: str) -> None:
    """Log one warning when a payload asks for BYOK via the removed flag."""

    if not isinstance(data, dict):
        return
    for key in ("is_byok_enabled", "isByokEnabled"):
        if data.get(key) is True:
            logger.warning(
                "[LLM-V2] ignoring removed %s on %s; BYOK is decided by credential_name",
                key,
                where,
            )
            return


class LegacyByokWarningModel(BaseModel):
    """Base model that warns when the removed BYOK flag arrives set to true."""

    @model_validator(mode="before")
    @classmethod
    def _warn_on_legacy_byok_flag(cls, data: Any) -> Any:
        warn_on_legacy_byok_flag(data, where=cls.__name__)
        return data
