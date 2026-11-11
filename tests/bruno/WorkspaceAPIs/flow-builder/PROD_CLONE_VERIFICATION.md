# Prod clone verification (issue #273)

Manual verification checklist for the publish-time resource cloning fix.
Publishing a Dev flow version must clone every referenced resource into
`EnvType = Prod` atomically; a missing or un-clonable source must fail the
publish instead of silently producing a broken Prod agent.

Run the steps against a **non-production** Workspace DB.

## 1. Publish

1. Author a Dev (`EnvType = Dev`) Agent flow that references:
   - a credential (by name) and a config store,
   - a queue,
   - a custom tool,
   - a **pgvector** knowledge base with at least one file, plus at least two
     vectors written for it,
   - a skill with at least one file.
2. Send the request with `X-Env-Type: dev` and note the Dev resource names.
3. Publish with [`update-flow-publish.bru`](./update-flow-publish.bru)
   (`PUT /flow/publish`). The response must be `200`.

## 2. SQL assertions (Workspace DB)

Bind `:tenant_id` and the Dev resource names before running each block. All
clones inherit the Dev source `SpaceId`; uniqueness is
`(TenantId, SpaceId, EnvType, Name)`.

### 2.1 Credentials (VaultCredentials + EncryptedKeyValues)

```sql
-- A Prod twin must exist for every referenced Dev credential, and must never
-- carry the Dev credential's Id.
SELECT d."Name",
       d."Id"   AS dev_id,
       d."EnvType" AS dev_env,
       d."SpaceId" AS dev_space,
       p."Id"   AS prod_id,
       p."EnvType" AS prod_env,
       p."SpaceId" AS prod_space
FROM "vault_Credentials" d
LEFT JOIN "vault_Credentials" p
       ON p."TenantId" = d."TenantId"
      AND p."Name" = d."Name"
      AND p."EnvType" = 'Prod'
WHERE d."TenantId" = :tenant_id
  AND d."EnvType" = 'Dev'
  AND d."Name" IN (:credential_names);

-- Expect: prod_env = 'Prod', prod_id <> dev_id, prod_space = dev_space for
-- every row. A NULL prod_id means the clone is missing and the publish should
-- have failed.

-- Encrypted key-value pairs must be copied 1:1.
SELECT d."Name",
       count(dkv."Id") AS dev_kv,
       count(pkv."Id") AS prod_kv
FROM "vault_Credentials" d
LEFT JOIN "vault_EncryptedKeyValues" dkv ON dkv."VaultCredentialId" = d."Id"
JOIN "vault_Credentials" p
     ON p."TenantId" = d."TenantId" AND p."Name" = d."Name" AND p."EnvType" = 'Prod'
LEFT JOIN "vault_EncryptedKeyValues" pkv ON pkv."VaultCredentialId" = p."Id"
WHERE d."TenantId" = :tenant_id
  AND d."EnvType" = 'Dev'
  AND d."Name" IN (:credential_names)
GROUP BY d."Name";

-- Expect: prod_kv = dev_kv for every credential.
```

### 2.2 Queues

```sql
SELECT d."Name", d."SpaceId" AS dev_space, p."Id" AS prod_id, p."SpaceId" AS prod_space
FROM "run_Queues" d
LEFT JOIN "run_Queues" p
       ON p."TenantId" = d."TenantId" AND p."Name" = d."Name" AND p."EnvType" = 'Prod'
WHERE d."TenantId" = :tenant_id
  AND d."EnvType" = 'Dev'
  AND d."Name" IN (:queue_names);
-- Expect a Prod row per queue with the inherited SpaceId.

SELECT count(*) FROM "worc_QueueUsers" qu
JOIN "run_Queues" q ON q."Id" = qu."QueueId"
WHERE q."TenantId" = :tenant_id AND q."EnvType" = 'Prod' AND q."Name" IN (:queue_names);
-- Expect: matches the Dev queue's worc_QueueUsers count (mirrored, no duplicates).

SELECT count(*) FROM "agent_ResourceFlowAccess" rfa
JOIN "run_Queues" q ON q."Id" = rfa."ResourceId"
WHERE rfa."ResourceType" = 'Queue'
  AND q."TenantId" = :tenant_id AND q."EnvType" = 'Prod' AND q."Name" IN (:queue_names);
-- Expect: matches the Dev queue's agent_ResourceFlowAccess grant count (mirrored per-flow, no duplicates).
```

### 2.3 Tools

```sql
SELECT "Name", "SpaceId", "EnvType", "IsDisabled"
FROM "ai_Tools"
WHERE "TenantId" = :tenant_id
  AND "Name" IN (:tool_names)
ORDER BY "Name", "EnvType";
-- Expect: a Dev and a Prod row per configured *custom* tool, same Name/SpaceId.
-- Platform library tools (Type = 'Platform') must never get a Prod clone (see §2.7).
```

### 2.4 Knowledge bases (header, files, vectors)

```sql
SELECT d."Name", d."SpaceId" AS dev_space, p."Id" AS prod_id,
       p."SpaceId" AS prod_space, p."VectorStore"
FROM "ai_KnowledgeBases" d
LEFT JOIN "ai_KnowledgeBases" p
       ON p."TenantId" = d."TenantId" AND p."Name" = d."Name" AND p."EnvType" = 'Prod'
WHERE d."TenantId" = :tenant_id
  AND d."EnvType" = 'Dev'
  AND d."Name" IN (:kb_names);
-- Expect a Prod header per KB; VectorStore must remain 'pgvector'.

-- File metadata mirrored onto the Prod KB, skipping names already present.
SELECT d."FileName",
       (SELECT count(*) FROM "ai_KnowledgeBaseFiles" f
         WHERE f."KnowledgeBaseId" = p."Id" AND f."FileName" = d."FileName") AS prod_matches
FROM "ai_KnowledgeBaseFiles" d
JOIN "ai_KnowledgeBases"  dev ON dev."Id" = d."KnowledgeBaseId"
JOIN "ai_KnowledgeBases"  p   ON p."TenantId" = dev."TenantId"
                    AND p."Name" = dev."Name" AND p."EnvType" = 'Prod'
WHERE dev."TenantId" = :tenant_id AND dev."EnvType" = 'Dev'
  AND dev."Name" IN (:kb_names)
  AND d."IsDisabled" = false;
-- Expect: prod_matches = 1 for every source file name.

-- Vectors are physically copied with Metadata.env_type rewritten to 'prod'.
SELECT
  (SELECT count(*) FROM "ai_VectorStore" v
    WHERE v."TenantId" = :tenant_id
      AND (v."Metadata" ->> 'kb_name') = :kb_name
      AND COALESCE(v."Metadata" ->> 'env_type', 'dev') = 'dev')  AS dev_vectors,
  (SELECT count(*) FROM "ai_VectorStore" v
    WHERE v."TenantId" = :tenant_id
      AND (v."Metadata" ->> 'kb_name') = :kb_name
      AND COALESCE(v."Metadata" ->> 'env_type', 'dev') = 'prod') AS prod_vectors;
-- Expect: prod_vectors = dev_vectors for each referenced KB.

-- Prod vectors must not be shared with Dev (distinct Ids, no Dev ids present).
SELECT count(*) FROM "ai_VectorStore" v
JOIN "ai_VectorStore" d ON d."Id" = v."Id"
WHERE v."TenantId" = :tenant_id
  AND COALESCE(v."Metadata" ->> 'env_type', 'dev') = 'prod';
-- Expect: 0 (a Prod vector Id can never equal a Dev vector Id).
```

### 2.5 Skills

```sql
SELECT d."Name", d."SpaceId" AS dev_space, p."Id" AS prod_id, p."SpaceId" AS prod_space
FROM "ai_Skills" d
LEFT JOIN "ai_Skills" p
       ON p."TenantId" = d."TenantId" AND p."Name" = d."Name" AND p."EnvType" = 'Prod'
WHERE d."TenantId" = :tenant_id
  AND d."EnvType" = 'Dev'
  AND d."Name" IN (:skill_names);
-- Expect a Prod skill per referenced *custom* skill, inherited SpaceId.
-- Platform library skills (Type = 'Platform') are shipped with the runtime and
-- must never get a Prod clone (see §2.7).

SELECT d."FileName",
       (SELECT count(*) FROM "ai_SkillFiles" f
         WHERE f."SkillId" = p."Id" AND f."FileName" = d."FileName") AS prod_matches
FROM "ai_SkillFiles" d
JOIN "ai_Skills" dev ON dev."Id" = d."SkillId"
JOIN "ai_Skills" p   ON p."TenantId" = dev."TenantId"
                      AND p."Name" = dev."Name" AND p."EnvType" = 'Prod'
WHERE dev."TenantId" = :tenant_id AND dev."EnvType" = 'Dev'
  AND dev."Name" IN (:skill_names);
-- Expect: prod_matches = 1 for every source skill file name.
```

### 2.6 Config stores

```sql
SELECT d."Name", d."SpaceId" AS dev_space, p."Id" AS prod_id, p."SpaceId" AS prod_space
FROM "run_ConfigStore" d
LEFT JOIN "run_ConfigStore" p
       ON p."TenantId" = d."TenantId" AND p."Name" = d."Name" AND p."EnvType" = 'Prod'
WHERE d."TenantId" = :tenant_id
  AND d."EnvType" = 'Dev'
  AND d."Name" IN (:config_store_names);
-- Expect a Prod config store per referenced config store.
```

### 2.7 Platform library resources (no clone)

Platform library tools and skills are tenant-agnostic / runtime-provided and are
available in every environment, so publishing a flow that references them must **not**
create Prod clones and must **not** fail the publish.

```sql
-- Platform tools are seeded with TenantId = guid-empty, SpaceId = null.
SELECT "Name", "Type", "TenantId", "SpaceId", "EnvType"
FROM "ai_Tools"
WHERE "Name" IN (:platform_tool_names)
  AND "Type" = 'Platform';
-- Expect: exactly one row per platform tool, TenantId = '00000000-0000-0000-0000-000000000000',
-- SpaceId IS NULL, EnvType = 'Dev', and no matching 'Prod' row exists for that name.

-- Platform skills are seeded Type = 'Platform', SpaceId = null.
SELECT "Name", "Type", "SpaceId", "EnvType"
FROM "ai_Skills"
WHERE "Name" IN (:platform_skill_names)
  AND "Type" = 'Platform';
-- Expect: the seeded platform skill only (usually EnvType = 'Dev'); no 'Prod' clone.
```

### 2.8 Corsair credential mirror (CorsairDb)

Platform tools invoke through the Corsair sidecar, which keys connections by the
vault credential **Id** (`corsair_accounts.tenant_id`). Runtime resolves the credential
**name** in the active env to that Id, so every Prod credential clone must be
mirrored or tool calls fail with "credential is not mirrored to Corsair".

Run against **CorsairDb** (not WorkspaceDb), binding the Prod clone Ids from §2.1:

```sql
-- One account per (Prod vault credential Id, integration) the credential maps to.
SELECT a.tenant_id, i.name AS integration, a.updated_at
FROM corsair_accounts a
JOIN corsair_integrations i ON i.id = a.integration_id
WHERE a.tenant_id IN (:prod_credential_ids)
ORDER BY a.tenant_id, i.name;

-- Expect: a row for the plugin the credential type maps to (e.g. `openai` for an
-- OpenAI credential), keyed by the *Prod* vault credential Id — never the Dev Id.
-- Re-publishing must upsert, not duplicate.
```

### 2.9 People-sharing rows (ResourceUserAccess)

Every Dev share on a cloned resource must exist on its Prod clone for the same user
(`user_ResourceUserAccess`, `ResourceType` matching the cloned type). Repeat the check
per resource type by swapping the queue join for the type's table.

```sql
SELECT d."Name", ds."UserId", ds."AccessLevel" AS dev_level, ps."AccessLevel" AS prod_level
FROM "user_ResourceUserAccess" ds
JOIN "run_Queues" d ON d."Id" = ds."ResourceId"
LEFT JOIN "run_Queues" p
       ON p."TenantId" = d."TenantId" AND p."Name" = d."Name" AND p."EnvType" = 'Prod'
      AND p."SpaceId" IS NOT DISTINCT FROM d."SpaceId"
LEFT JOIN "user_ResourceUserAccess" ps
       ON ps."ResourceType" = ds."ResourceType" AND ps."ResourceId" = p."Id" AND ps."UserId" = ds."UserId"
WHERE ds."ResourceType" = 'Queue'
  AND d."TenantId" = :tenant_id
  AND d."EnvType" = 'Dev'
  AND d."Name" IN (:queue_names);
-- Expect one row per Dev share with prod_level = dev_level. A NULL prod_level means
-- publish did not migrate the share.
```

## 3. Idempotency (repair path)

Re-publish the same flow version and re-run §2. Every count must be unchanged
(no duplicate inserts, no unique-constraint errors). A publish that previously
failed partway must be repairable by re-running it.

## 4. Failure modes (must fail loudly)

| Scenario | Expected |
| --- | --- |
| Referenced Dev resource does not exist | `PUT /flow/publish` returns 5xx listing the missing reference; no partial Prod rows survive (transaction rolled back). |
| Referenced KB uses a non-pgvector store (e.g. qdrant) | Publish fails with the "vectors cannot be copied to Production" message. |
| KB header references a credential missing its Prod twin and the clone fails | Publish fails; no Prod record points at the Dev credential GUID. |
| Corsair sidecar unreachable while mirroring a Prod credential | Publish fails with the "failed to mirror credential … to the Corsair sidecar" message; transaction rolls back. |

## 5. Runtime parity (llmpipeline)

- Requests carry `X-Env-Type: prod`; `resolve_and_inject_skill_context`,
  the tool/skill selector and the chat custom-tool loader must resolve only
  Prod resources.
- Custom tools load by configured root name (`ai_Tools.Name`) for the request
  env.
- pgvector retrieval/delete filters vectors with
  `COALESCE("Metadata" ->> 'env_type', 'dev') = :env_type`, so legacy rows count
  as Dev and Prod never sees Dev chunks.
