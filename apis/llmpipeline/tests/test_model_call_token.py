import jwt
from unittest.mock import MagicMock, patch

from app.core.config import settings
from app.core.vault_credential_manager import VaultCredentialManager


def _fetch(model_call):
    response = MagicMock(ok=True)
    response.json.return_value = {"data": {"apiKey": "x"}}
    with patch("app.core.vault_credential_manager.requests.get", return_value=response) as get:
        VaultCredentialManager(api_url="http://x/vault-credential").get_vault_credential_secret_by_name(
            "my-cred", jwt="t", model_call=model_call
        )
    return get.call_args.kwargs["headers"]


def test_no_token_by_default():
    assert "X-Model-Call-Token" not in _fetch(False)


def test_token_for_model_call():
    token = _fetch(True)["X-Model-Call-Token"]
    base = f"https://{settings.APP_BASE_URL}"
    claims = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS512"], audience=f"{base}/model-credential", issuer=base)
    assert claims["cred"] == "my-cred"
    assert 0 < claims["exp"] - claims["iat"] <= 60
