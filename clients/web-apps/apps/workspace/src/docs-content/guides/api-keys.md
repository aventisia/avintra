# API Keys

The **API Keys** page lets you generate and manage API keys used to call agent endpoints programmatically. Integrations use these keys to authenticate when invoking your agents.

## Purpose

API keys let external systems and scripts call your agents securely. Generate a key, share it with the integration, and revoke it when no longer needed.

## The table

The page shows a table of API keys with columns such as:

- **Name** — the key's name.
- **Key** — the API key value (masked).
- **Created** — when the key was created.
- **Status** — whether the key is active or revoked.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **Edit** — change the key's name.
- **Revoke** — deactivate the key so it can no longer be used.
- **Delete** — remove the key.

## Creating an API key

Click the **Create API Key** button. Fill in:

- **Name** — a descriptive name for the key.

After creating the key, copy the generated value and store it securely. It is shown only once.

## Tips

- Scope keys to the minimum privileges your integration needs.
- Revoke keys that are no longer in use.
