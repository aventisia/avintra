/**
 * Alias-isolation check for per-credential OAuth app registrations (AC1/AC2).
 *
 * Two plugin instances over one base plugin, each with its own client id/secret,
 * must write to distinct integration rows; saving the second must leave the
 * first row byte-identical, and each instance's key manager must read back its
 * own client id (the value a token refresh runs against).
 *
 * Runs against the sidecar database from the local env. Skips with a warning
 * when no database/KEK is configured unless ALIAS_TEST_REQUIRE_DB=1.
 */
import "./corsair.js";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

async function main() {
  const { pool, plugins } = await import("./corsair.js");
  const { corsair, resolveRegisteredPluginId } = await import("./corsair.js");
  const { createIntegrationKeyManager, createAccountKeyManager, getOAuthAccessToken, initializeAccountDEK } =
    await import("corsair/core");
  const { createCorsairDatabase } = await import("corsair/db");
  const { writeIntegrationKeys, deleteIntegrationCredentials, backfillIntegrationAlias } =
    await import("./integration-keys.js");
  const { toAliasId, parseAliasId } = await import("./alias.js");
  const { randomUUID } = await import("node:crypto");
  const http = await import("node:http");

  try {
    await pool.query("SELECT 1");
  } catch (err) {
    const message = `SKIP: sidecar database unreachable (${(err as Error).message})`;
    if (process.env.ALIAS_TEST_REQUIRE_DB === "1") throw new Error(message);
    console.warn(message);
    await pool.end().catch(() => {});
    return;
  }

  const basePlugin = "gmail";
  const longestBaseId = plugins
    .map((plugin) => plugin.id)
    .reduce((longest, id) => (id.length > longest.length ? id : longest), "");
  const longestAlias = toAliasId(longestBaseId, randomUUID().replaceAll("-", ""));
  assert(
    longestAlias.length <= 64,
    `longest alias id is ${longestAlias.length} chars (${longestBaseId})`,
  );
  assert(parseAliasId(longestAlias)?.basePluginId === longestBaseId, "longest alias does not round-trip");

  const credentialA = randomUUID();
  const credentialB = randomUUID();
  const aliasA = toAliasId(basePlugin, credentialA);
  const aliasB = toAliasId(basePlugin, credentialB);

  const database = createCorsairDatabase(pool);
  const readRow = async (name: string) => {
    const { rows } = await pool.query(
      `SELECT id, name, config::text AS config, dek, updated_at
       FROM corsair_integrations WHERE name = $1`,
      [name],
    );
    return rows[0];
  };
  const clientIdFor = async (name: string) =>
    createIntegrationKeyManager({
      authType: "oauth_2",
      integrationName: name,
      kek: process.env.CORSAIR_KEK!,
      database,
    }).get_client_id();

  try {
    const baseBefore = await readRow(basePlugin);
    assert(!!baseBefore, `base integration row is missing: ${basePlugin}`);

    await writeIntegrationKeys(aliasA, "client-a", "secret-a", "https://redirect");
    const rowAFirst = await readRow(aliasA);
    assert(!!rowAFirst, "first alias row was not created");
    assert(rowAFirst.name === aliasA, "first alias row name mismatch");

    await writeIntegrationKeys(aliasB, "client-b", "secret-b", "https://redirect");
    const rowASecond = await readRow(aliasA);
    const rowB = await readRow(aliasB);
    assert(!!rowB, "second alias row was not created");

    assert(
      JSON.stringify(rowAFirst) === JSON.stringify(rowASecond),
      "saving the second alias changed the first alias row",
    );
    assert(
      rowAFirst.id !== rowB.id && rowAFirst.dek !== rowB.dek,
      "aliases share an integration row or DEK",
    );

    const baseAfter = await readRow(basePlugin);
    assert(
      JSON.stringify(baseBefore) === JSON.stringify(baseAfter),
      "saving alias rows changed the base plugin row",
    );

    assert((await clientIdFor(aliasA)) === "client-a", "alias A client id is not its own");
    assert((await clientIdFor(aliasB)) === "client-b", "alias B client id is not its own");

    // Token refresh: a stub provider records which OAuth app each alias refreshes with.
    const refreshedWith: Record<string, { clientId?: string; clientSecret?: string }> = {};
    const server = http.createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const params = new URLSearchParams(body);
        refreshedWith[params.get("refresh_token") ?? ""] = {
          clientId: params.get("client_id") ?? undefined,
          clientSecret: params.get("client_secret") ?? undefined,
        };
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ access_token: "access-from-stub", expires_in: 3600 }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const stubUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}/token`;

    try {
      const accountKeys = (aliasId: string, tenantId: string) =>
        createAccountKeyManager({
          authType: "oauth_2",
          integrationName: aliasId,
          tenantId,
          kek: process.env.CORSAIR_KEK!,
          database,
        });
      const createAccount = async (aliasId: string, tenantId: string) => {
        const { rows } = await pool.query(
          "SELECT id FROM corsair_integrations WHERE name = $1",
          [aliasId],
        );
        await pool.query(
          "INSERT INTO corsair_accounts (id, tenant_id, integration_id) VALUES ($1, $2, $3)",
          [randomUUID(), tenantId, rows[0].id],
        );
        await initializeAccountDEK(database, aliasId, tenantId, process.env.CORSAIR_KEK!);
      };

      const keysA = accountKeys(aliasA, credentialA);
      const keysB = accountKeys(aliasB, credentialB);
      await createAccount(aliasA, credentialA);
      await createAccount(aliasB, credentialB);
      await keysA.set_refresh_token("refresh-a");
      await keysB.set_refresh_token("refresh-b");

      await getOAuthAccessToken(
        { keys: keysA, tenantId: credentialA },
        { plugin: aliasA, tokenUrl: stubUrl },
      );
      await getOAuthAccessToken(
        { keys: keysB, tenantId: credentialB },
        { plugin: aliasB, tokenUrl: stubUrl },
      );

      assert(
        refreshedWith["refresh-a"]?.clientId === "client-a" &&
          refreshedWith["refresh-a"]?.clientSecret === "secret-a",
        "alias A refreshed with the wrong OAuth app credentials",
      );
      assert(
        refreshedWith["refresh-b"]?.clientId === "client-b" &&
          refreshedWith["refresh-b"]?.clientSecret === "secret-b",
        "alias B refreshed with the wrong OAuth app credentials",
      );

      // Invocation must address the instance row, because that is where the
      // account (tokens) lives; otherwise the tenant sees "Account not found".
      assert(
        resolveRegisteredPluginId(basePlugin, credentialA) === aliasA,
        "invocation for credential A does not resolve to its instance",
      );
      assert(
        resolveRegisteredPluginId(basePlugin, credentialB) === aliasB,
        "invocation for credential B does not resolve to its instance",
      );
      assert(
        resolveRegisteredPluginId(basePlugin, randomUUID()) === basePlugin,
        "invocation without a registered instance does not fall back to the base plugin",
      );
      const tenantA = corsair.withTenant(credentialA) as any;
      assert(
        (await tenantA[aliasA].keys.get_refresh_token()) === "refresh-a",
        "instance tenant client cannot read the credential's own account",
      );
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }

    assert(
      await deleteIntegrationCredentials(aliasA, credentialA),
      "alias A delete was not acknowledged",
    );
    assert(!(await readRow(aliasA)), "alias A row was not deleted");
    assert(!!(await readRow(aliasB)), "deleting alias A removed alias B");

    // Pre-flattening credentials kept their tokens on the base plugin's account.
    // The startup backfill must copy them onto the credential's instance row.
    const credentialC = randomUUID();
    const baseRow = await readRow(basePlugin);
    const baseAccountId = randomUUID();
    await pool.query(
      "INSERT INTO corsair_accounts (id, tenant_id, integration_id) VALUES ($1, $2, $3)",
      [baseAccountId, credentialC, baseRow.id],
    );
    await initializeAccountDEK(database, basePlugin, credentialC, process.env.CORSAIR_KEK!);
    const baseKeys = createAccountKeyManager({
      authType: "oauth_2",
      integrationName: basePlugin,
      tenantId: credentialC,
      kek: process.env.CORSAIR_KEK!,
      database,
    });
    await baseKeys.set_refresh_token("refresh-legacy");

    const firstBackfill = await backfillIntegrationAlias(basePlugin, credentialC);
    assert(firstBackfill.copied, "backfill did not copy the base account");
    assert(firstBackfill.aliasId === toAliasId(basePlugin, credentialC), "backfill alias id mismatch");
    const aliasC = firstBackfill.aliasId;
    const backfilledKeys = createAccountKeyManager({
      authType: "oauth_2",
      integrationName: aliasC,
      tenantId: credentialC,
      kek: process.env.CORSAIR_KEK!,
      database,
    });
    assert(
      (await backfilledKeys.get_refresh_token()) === "refresh-legacy",
      "backfilled instance lost the legacy refresh token",
    );
    assert(
      (await baseKeys.get_refresh_token()) === "refresh-legacy",
      "backfill cleared the base account token",
    );
    const secondBackfill = await backfillIntegrationAlias(basePlugin, credentialC);
    const { rows: aliasAccounts } = await pool.query(
      "SELECT id FROM corsair_accounts WHERE tenant_id = $1 AND integration_id = $2",
      [credentialC, (await readRow(aliasC)).id],
    );
    assert(!secondBackfill.copied && aliasAccounts.length === 1, "backfill is not idempotent");

    assert(
      await deleteIntegrationCredentials(aliasC, credentialC),
      "backfilled alias delete was not acknowledged",
    );
    await deleteIntegrationCredentials(basePlugin, credentialC);

    console.log(
      "PASS: two aliases over one base plugin keep distinct integration rows and independent client ids.",
    );
    console.log("PASS: startup backfill copies legacy base tokens onto the instance row, idempotently.");
  } finally {
    await deleteIntegrationCredentials(aliasB, credentialB).catch(() => false);
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
