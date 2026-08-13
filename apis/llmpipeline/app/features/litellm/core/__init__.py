# Shared infrastructure for the LiteLLM feature.
#
# This package holds everything used by more than one capability folder:
# the LiteLLM transport (`litellm_service`), credential resolution
# (`credentials`), the provider registry, shared DTOs (`schemas`), and the
# streaming job manager. Capability folders import from here and never from
# each other.
