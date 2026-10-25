The **API Keys** page lets you generate and manage API keys used to call agent endpoints programmatically. Integrations use these keys to authenticate when invoking your agents.

## Purpose

API keys let external systems and scripts call your agents securely. Generate a key, share it with the integration, and revoke it when no longer needed.

## The table

The page shows a table of API keys with columns such as:

- **Name** — the key's name.
- **Status** — whether the key is **Active**, **Expired**, or **Revoked**.
- **Key Prefix** — the masked prefix of the key value.
- **Expires At** — when the key expires.
- **Last Used At** — when the key was last used.
- **Permissions** — the access permissions granted to the key.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **View** — open the key details.
- **Edit** — change the key's name (only for active keys).
- **Delete** — remove the key.

## Creating an API key

Click the **Create** button. Fill in:

- **Name** — a descriptive name for the key.
- **Expires At** — optional; leave blank to keep the key active indefinitely.

After creating the key, copy the generated value and store it securely. It is shown only once.

## Tips

- Scope keys to the minimum privileges your integration needs.
- Revoke or delete keys that are no longer in use.
