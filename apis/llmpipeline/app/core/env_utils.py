"""Environment-type helpers shared across the LLM pipeline services.

The active environment is delivered by the ``X-Env-Type`` header (see
``app.dependencies.authorize``) and stored on ``User.env_type``. It is persisted
in the Workspace database using the C# enum names ("Dev"/"Prod") and in vector
Metadata using lowercase values ("dev"/"prod"), so all Python comparisons
normalize through :func:`normalize_env_type`.
"""


def normalize_env_type(env_type: str | None) -> str:
    """
    Normalize an environment value to the lowercase form ("dev" / "prod").
    Missing or blank values default to "dev".
    """
    normalized = (env_type or "").strip().lower()
    return normalized or "dev"
