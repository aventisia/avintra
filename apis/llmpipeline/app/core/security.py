import jwt
from app.core.logger import logger
from fastapi import Request
from app.core.config import settings
from app.features.auth.authenticated_user import User
from uuid import UUID

# Get JWT token from request (cookie or header)
def get_jwt(request: Request) -> str:
    """
    Tries to extract JWT token from cookie named 'AccessToken'.
    If not found, tries from Authorization header.
    """
    
    # Try to get JWT from cookies
    access_token = request.cookies.get("AccessToken")
    if access_token:
        return access_token
    
    # Try to get JWT from Authorization header
    authorization_header: str = request.headers.get("Authorization")

    if authorization_header and authorization_header.startswith("Bearer "):
        access_token = authorization_header.split(" ")[1].strip()
        if access_token:
            return access_token
        else:
            logger.error("No JWT found in Authorization header.")
            return "Error: No JWT found in Authorization header."
    else:
        logger.warning("Authorization header missing.")
        return "Error: Authorization header missing"

# Get user info from JWT token
def get_user_from_jwt(token: str) -> User:
    try:
        # Get the decoded JWT payload
        payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=["HS512"],
                audience=f"https://{settings.APP_BASE_URL}",
                issuer=f"https://{settings.APP_BASE_URL}"
            )
        
        # Return a User object constructed from the JWT claims
        return User(
            user_id=UUID(payload.get("uid")),
            username=payload.get("uname"),
            roles=payload.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", []),
            tenant_id=UUID(payload.get("tntid"))
        )
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired.")
        raise

    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {e}")
        raise