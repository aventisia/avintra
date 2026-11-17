### Cloud Connectors

This feature provides a unified way to interact with various cloud service providers (like Microsoft 365, SendGrid, OpenAI, etc.) through connectors. Each connector is defined by its provider, unique name, and associated credentials stored in a secure vault.

### Authentication errors in the execution log

When a connector step cannot use its stored credential, the step's execution log states which of the following happened and names the credential, so the person can fix it without guessing:

- Credential not found: `Credential 'GitHub PAT' was not found.`
- Credential disabled: `Credential 'GitHub PAT' is disabled.`
- Credential the runner cannot access: `You do not have access to credential 'GitHub PAT'.`
- Required value missing from the credential: `Credential 'SendGrid' has no 'ApiKey' value.`
- Rejected by the external system (expired, revoked, refused): `The external system rejected credential 'SendGrid': <short redacted reason>.`

Secret values never reach the log. Each connector service redacts the secret values it already knows (keys, tokens, passwords, connection strings) before building the message, a provider's rejection detail has secret-like `key=value` pairs removed and is shortened to 200 characters, and the executor's log helper masks secret-like keys and `password=`/`Authorization:` shapes as a last defense before anything is saved. Credential, provider, action and required field names stay visible on purpose.

Two rules follow from that: on the direct-vault and Corsair paths a disabled credential is reported before its values are decrypted (the Camel connector reads the vault detail record, which decrypts first), and the Camel harness path fails fast with the same message instead of placing an unauthenticated call. Non-authentication failures (network errors, bad payloads, upstream outages) keep their previous messages.
