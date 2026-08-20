from fastapi import Depends, HTTPException, Request, status
from app.core.jwt_helper import get_jwt, get_user_from_jwt
from app.features.auth.authenticated_user import User
from app.core.logger import logger

# ASP.NET-style route authorization dependency.
def authorize(required_roles: list[str] | None = None):
    """
    ASP.NET-style route authorization dependency.
    - No roles: authenticated user is required.
    - With roles: authenticated user must have at least one required role.
    """
    # Normalize required roles to a set for efficient checking
    normalized_required_roles = _normalize_roles(required_roles)

    # The actual FastAPI dependency function that will be used in routes
    def dependency(request: Request) -> User:
        auth_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        # Get JWT from request
        try:
            jwt = get_jwt(request)
            user = get_user_from_jwt(jwt)
            user.access_token = jwt
        except Exception as error:
            logger.warning(f"Authentication failed: {error}")
            raise auth_error

        # Resolve the current space from the "X-Space-Id" request header, mirroring
        # the backend middleware. Empty means the default "Central" space.
        user.space_id = request.headers.get("X-Space-Id") or None

        # Resolve the current deployment environment from the "X-Env-Type" request header,
        # mirroring the backend middleware. Defaults to "dev" when absent.
        user.env_type = request.headers.get("X-Env-Type") or "dev"

        # Return user if no specific roles are required
        if not normalized_required_roles:
            return user

        # Check if user has at least one of the required roles
        user_roles = _normalize_roles(user.roles)
        if not user_roles.intersection(normalized_required_roles):
            logger.warning(
                f"Access denied for user id '{user.user_id}': roles '{user.roles}' do not match required '{required_roles}'"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        # Access granted
        return user
    return dependency

# Helper: Normalize role names to a consistent format (lowercase, stripped)
def _normalize_roles(roles: list[str] | None) -> set[str]:
    if not roles:
        return set()
    return {role.strip().lower() for role in roles if role and role.strip()}