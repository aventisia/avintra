
The **Vault** page lets you store and manage encrypted secrets that are protected and audited. Use the Vault for sensitive credentials that should not be stored in plain text.

## Purpose

The Vault provides a secure home for secrets such as passwords, tokens, and other sensitive data. Values are encrypted at rest and access is audited, giving you a safe way to reference secrets from your agents.

## The table

The page shows a table of secrets with columns such as:

- **Name** — the secret's name.
- **Type** — the kind of secret (e.g. password, token).
- **Description** — what the secret is used for.
- **Created / Modified** — when the secret was created and last changed.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **Edit** — update the secret's value or description.
- **Delete** — remove the secret.

## Creating a secret

Click the **Create Secret** button. Fill in:

- **Name** — a unique name you will reference in agents.
- **Value** — the secret value.
- **Description** — optional, but recommended.

> **Note:** Secrets in the Vault are encrypted and audited. For non-sensitive configuration values, use the **Key Store**.
