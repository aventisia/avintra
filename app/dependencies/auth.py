from fastapi import Depends, HTTPException, Request, status
from app.core.security import get_jwt_from_header, get_user_from_token
from app.models.user import User
from app.core.logger import logger

def authenticate_current_user(request: Request) -> User:
    """
    FastAPI dependency that retrieves and verifies the authenticated user from a JWT token.
    The token is expected in the Authorization header as a Bearer token.
    """
    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = get_jwt_from_header(request)
        logger.info("✅ Extracted JWT token from Authorization header.")

        user = get_user_from_token(token)
        logger.info(f"✅ Authenticated user id: {user.id}")

        return user

    except Exception as error:
        logger.warning(f"❌ Authentication failed: {error}")
        raise auth_error


def enforce_user_role(required_role: str):
    """
    Dependency factory for role-based access control (RBAC).
    Ensures that the authenticated user has the required role.

    Example usage:
        @router.get("/admin", dependencies=[Depends(enforce_user_role("admin"))])
    """
    def role_guard(user: User = Depends(authenticate_current_user)):
        logger.debug(f"🔍 Verifying role for user id '{user.id}'; required role: '{required_role}'")
        
        # Check if the required role is in the list of roles
        if required_role not in user.role:
            logger.warning(
                f"❌ Access denied for user id '{user.id}': role '{user.role}' does not match required '{required_role}'"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}",
            )

        logger.info(f"✅ Access granted for user id '{user.id}' with role '{user.role}'")
        return user

    return role_guard


def verify_jwt_token_validity(request: Request) -> bool:
    """
    FastAPI dependency to check only if a JWT token is valid.
    Does not return user data. Useful for simple token checks (e.g., health checks or silent auth).

    Example usage:
        @router.get("/token-check")
        def token_check(is_valid: bool = Depends(verify_jwt_token_validity)):
            return {"token_valid": is_valid}
    """
    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = get_jwt_from_header(request)
        logger.debug("🔍 Validating token (no user extraction).")

        _ = get_user_from_token(token)  # Just check token is valid
        logger.info("✅ Token is valid.")

        return True

    except Exception as error:
        logger.warning(f"❌ Token validation failed: {error}")
        raise auth_error
