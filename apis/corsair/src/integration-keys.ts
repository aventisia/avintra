/**
 * Integration-row operations for per-credential OAuth plugin instances.
 *
 * The vault credential id is the Corsair tenant id and its alias id
 * (`<base-plugin>__<credential-id>`) addresses the integration row that holds
 * that credential's own OAuth app settings and refresh state.
 */
import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { createIntegrationKeyManager } from "corsair/core";
import { createCorsairDatabase } from "corsair/db";
import { setupCorsair } from "corsair";
import {
  corsair,
  ensureAliasPlugin,
  plugins,
  pool,
  resolveBasePluginId,
} from "./corsair.js";
import { isAliasId, toAliasId } from "./alias.js";

export type BackfillResult = {
  aliasId: string;
  copied: boolean;
};

type Queryable = Pick<PoolClient, "query">;

async function findIntegrationRowId(
  client: Queryable,
  name: string,
): Promise<string | undefined> {
  const { rows } = await client.query<{ id: string }>(
    "SELECT id FROM corsair_integrations WHERE name = $1 ORDER BY created_at ASC LIMIT 1",
    [name],
  );
  return rows[0]?.id;
}

/**
 * Writes the OAuth app settings for one plugin instance. The write is keyed by
 * the instance id, so saving one credential never touches another's row.
 */
export async function writeIntegrationKeys(
  pluginInstanceId: string,
  clientId: string,
  clientSecret: string,
  redirectUrl: string,
): Promise<void> {
  if (isAliasId(pluginInstanceId) && !ensureAliasPlugin(pluginInstanceId)) {
    throw new Error(`Unknown plugin instance: ${pluginInstanceId}`);
  }

  // Ensures the integration row and its DEK exist for the registered instance.
  await setupCorsair(corsair, { silent: true });

  const keyManager = createIntegrationKeyManager({
    authType: "oauth_2",
    integrationName: pluginInstanceId,
    kek: process.env.CORSAIR_KEK!,
    database: createCorsairDatabase(pool),
  });

  await keyManager.set_client_id(clientId);
  await keyManager.set_client_secret(clientSecret);
  await keyManager.set_redirect_url(redirectUrl);
}

function unregisterAliasPlugin(aliasId: string): void {
  const index = plugins.findIndex((plugin) => plugin.id === aliasId);
  if (index >= 0) plugins.splice(index, 1);
}

/**
 * Removes a credential's connection data. Alias rows are per credential, so the
 * row, its accounts and their child rows are deleted; base rows are shared and
 * are only cleared, never dropped.
 */
export async function deleteIntegrationCredentials(
  pluginId: string,
  tenantId: string,
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const integrationRowId = await findIntegrationRowId(client, pluginId);
    if (!integrationRowId) {
      await client.query("ROLLBACK");
      return false;
    }

    if (isAliasId(pluginId)) {
      await client.query(
        `DELETE FROM corsair_events
         WHERE account_id IN (
           SELECT id FROM corsair_accounts WHERE tenant_id = $1 AND integration_id = $2
         )`,
        [tenantId, integrationRowId],
      );
      await client.query(
        `DELETE FROM corsair_entities
         WHERE account_id IN (
           SELECT id FROM corsair_accounts WHERE tenant_id = $1 AND integration_id = $2
         )`,
        [tenantId, integrationRowId],
      );
      await client.query(
        "DELETE FROM corsair_accounts WHERE tenant_id = $1 AND integration_id = $2",
        [tenantId, integrationRowId],
      );
      await client.query("DELETE FROM corsair_integrations WHERE id = $1", [
        integrationRowId,
      ]);
    } else {
      // IMPORTANT NOTE: base rows are shared by legacy family credentials and by
      // consent links minted before the alias change; never drop them.
      await client.query(
        `UPDATE corsair_accounts
         SET dek = NULL, config = '{}', updated_at = NOW()
         WHERE tenant_id = $1 AND integration_id = $2`,
        [tenantId, integrationRowId],
      );
    }

    await client.query("COMMIT");
    if (isAliasId(pluginId)) unregisterAliasPlugin(pluginId);
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Copies a credential's existing integration row and account rows from the base
 * plugin row to its alias row. Both rows share one KEK and the encrypted values
 * are copied verbatim, so tokens keep working without being decrypted.
 * Idempotent: an alias row and its accounts are created only when absent.
 */
export async function backfillIntegrationAlias(
  basePluginId: string,
  tenantId: string,
): Promise<BackfillResult> {
  const base = resolveBasePluginId(basePluginId);
  const aliasId = toAliasId(base, tenantId);
  if (!ensureAliasPlugin(aliasId)) {
    throw new Error(`Unknown OAuth plugin: ${basePluginId}`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const baseRowId = await findIntegrationRowId(client, base);
    if (!baseRowId) {
      await client.query("ROLLBACK");
      throw new Error(`Base integration row not found: ${base}`);
    }

    let aliasRowId = await findIntegrationRowId(client, aliasId);
    if (!aliasRowId) {
      aliasRowId = randomUUID();
      await client.query(
        `INSERT INTO corsair_integrations (id, name, config, dek)
         SELECT $1, $2, config, dek FROM corsair_integrations WHERE id = $3`,
        [aliasRowId, aliasId, baseRowId],
      );
    }

    const { rows: baseAccounts } = await client.query<{
      id: string;
      config: unknown;
      dek: string | null;
    }>(
      "SELECT id, config, dek FROM corsair_accounts WHERE tenant_id = $1 AND integration_id = $2 ORDER BY created_at ASC",
      [tenantId, baseRowId],
    );

    let copied = 0;
    for (const account of baseAccounts) {
      const { rows: existing } = await client.query(
        "SELECT 1 FROM corsair_accounts WHERE tenant_id = $1 AND integration_id = $2 LIMIT 1",
        [tenantId, aliasRowId],
      );
      if (existing.length > 0) break;

      await client.query(
        `INSERT INTO corsair_accounts (id, tenant_id, integration_id, config, dek)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), tenantId, aliasRowId, account.config, account.dek],
      );
      copied += 1;
    }

    await client.query("COMMIT");
    return { aliasId, copied: copied > 0 };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
