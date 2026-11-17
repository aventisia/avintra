"""Internal backend URLs must include the nginx module prefix that routes them.

llmpipeline checks and posts credits on AccountsAPIs and reads fixed-credits and
voice settings from WorkspaceAPIs. Both are served behind a module prefix
(``/accounts/api``, ``/workspace/api``); ``https://<host>/api`` is a 404.
"""

from app.core import config
from app.core.byok_usage_manager import ByokUsageManager
from app.core.credit_manager import CreditManagerService
from app.core.vault_credential_manager import VaultCredentialManager
from app.features.litellm.core import credit_utils


class _StubResponse:
    is_success = True

    def json(self):
        return {"data": None}


def test_defaults_use_the_nginx_prefixes(monkeypatch):
    monkeypatch.setattr(config.settings, "APP_BASE_URL", "avintra.example.com")
    monkeypatch.setattr(config.settings, "ACCOUNTS_API_URL", "")
    monkeypatch.setattr(config.settings, "WORKSPACE_API_URL", "")

    assert config.accounts_api_url() == "https://avintra.example.com/accounts/api"
    assert config.workspace_api_url() == "https://avintra.example.com/workspace/api"


def test_explicit_overrides_win(monkeypatch):
    monkeypatch.setattr(config.settings, "ACCOUNTS_API_URL", "https://localhost:4000/api")
    monkeypatch.setattr(config.settings, "WORKSPACE_API_URL", "https://localhost:4001/api")

    assert config.accounts_api_url() == "https://localhost:4000/api"
    assert config.workspace_api_url() == "https://localhost:4001/api"


def test_credit_clients_target_the_accounts_api(monkeypatch):
    monkeypatch.setattr(config.settings, "ACCOUNTS_API_URL", "https://localhost:4000/api")

    assert CreditManagerService().api_url == "https://localhost:4000/api/credit-usage"
    assert ByokUsageManager().api_url == "https://localhost:4000/api/byok-usage"


def test_vault_credential_manager_targets_the_workspace_api(monkeypatch):
    monkeypatch.setattr(config.settings, "WORKSPACE_API_URL", "https://localhost:4001/api")

    assert (
        VaultCredentialManager().api_url
        == "https://localhost:4001/api/vault-credential"
    )


def test_fixed_credits_lookup_uses_the_workspace_api(monkeypatch):
    monkeypatch.setattr(config.settings, "WORKSPACE_API_URL", "https://localhost:4001/api")
    requested = []

    def fake_get(url, **_):
        requested.append(url)
        return _StubResponse()

    monkeypatch.setattr(credit_utils.httpx, "get", fake_get)
    ref_id = "ac97ee9c-0bac-4822-8735-32678a36e310"

    assert credit_utils.agent_has_fixed_credits(ref_id, "token") is False
    assert requested == [f"https://localhost:4001/api/execution/agent/{ref_id}/fixed-credits"]
