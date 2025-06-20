import jwt
from app.core.logger import logger
from fastapi import Request
from app.core.config import settings
from app.models.user import User
from uuid import UUID

def verify_token(token: str):
    """
    Decodes and verifies the JWT token using the configured algorithm and secret.
    Validates 'aud' and 'iss' claims for security.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            audience=settings.audience,
            issuer=settings.issuer,
        )
        logger.info("✅ JWT token successfully verified.")
        return payload

    except jwt.ExpiredSignatureError:
        logger.warning("❌ Token has expired.")
        raise

    except jwt.InvalidTokenError as e:
        logger.error(f"❌ Invalid token: {e}")
        raise

def get_user_from_token(token: str) -> User:
    payload = verify_token(token)
    username = payload.get("uname")

    if username is None:
        logger.error("❌ Invalid token: 'uname' claim missing.")
        raise Exception("Invalid token: 'uname' claim missing.")

    try:
        user_id = UUID(payload.get("uid"))
    except (ValueError, TypeError):
        logger.error("❌ Invalid token: 'uid' is not a valid UUID.")
        raise Exception("Invalid token: 'uid' is invalid or missing.")

    try:
        tenant_id = UUID(payload.get("tntid"))
    except (ValueError, TypeError):
        logger.error("❌ Invalid token: 'tntid' is not a valid UUID.")
        raise Exception("Invalid token: 'tntid' is invalid or missing.")

    role = payload.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", [])

    logger.info(f"✅ Extracted user from token: {username}")

    return User(
        id=user_id,
        username=username,
        email=username,
        role=role,
        tenant_id=tenant_id
    )

def get_jwt_from_cookie(request: Request) -> str:
    """
    Retrieves JWT token from cookies (usually set via HttpOnly cookie).
    """
    token = request.cookies.get(settings.cookie_name)

    if token is None:
        logger.warning("❌ No JWT token found in cookies.")
        raise Exception("No JWT token found in cookies")

    logger.info("✅ JWT token extracted from cookie.")
    return token

def get_jwt_from_header(request: Request) -> str:
    """
    Extracts the JWT token from the Authorization header using the Bearer scheme.
    """
    authorization: str = request.headers.get("Authorization")

    if not authorization:
        logger.warning("❌ Authorization header missing.")
        raise Exception("Authorization header missing")

    if not authorization.startswith("Bearer "):
        logger.warning("❌ Invalid Authorization header format.")
        raise Exception("Invalid Authorization header format")

    token = authorization.split(" ")[1].strip()

    if not token:
        logger.error("❌ No token found in Authorization header.")
        raise Exception("No token found in Authorization header")

    logger.info("✅ JWT token extracted from Authorization header.")
    return token
