"""Stable error and close codes for every voice session.

The worker publishes these to the caller UI, so codes stay fixed across changes to
the runtime.
"""

from __future__ import annotations

WS_CLOSE_NORMAL = 1000
WS_CLOSE_UPSTREAM_FAILURE = 1011
WS_CLOSE_BAD_CONFIG = 4400
WS_CLOSE_FORBIDDEN = 4403

ERROR_CODE_UNSUPPORTED_PROVIDER = "unsupported_provider"
ERROR_CODE_INVALID_CONFIG = "invalid_config"
ERROR_CODE_CREDENTIALS_UNAVAILABLE = "credentials_unavailable"
ERROR_CODE_UPSTREAM = "upstream_error"
