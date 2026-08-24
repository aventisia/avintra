-- Corsair Postgres schema.
-- Run this once against the Corsair database, then start the sidecar.
-- Source: https://docs.corsair.dev/concepts/database

CREATE TABLE IF NOT EXISTS corsair_integrations (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  dek TEXT
);

CREATE TABLE IF NOT EXISTS corsair_accounts (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL,
  integration_id TEXT NOT NULL REFERENCES corsair_integrations(id),
  config JSONB NOT NULL DEFAULT '{}',
  dek TEXT
);

CREATE TABLE IF NOT EXISTS corsair_entities (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  account_id TEXT NOT NULL REFERENCES corsair_accounts(id),
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  version TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  UNIQUE(account_id, entity_id, entity_type, version)
);

CREATE TABLE IF NOT EXISTS corsair_events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  account_id TEXT NOT NULL REFERENCES corsair_accounts(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT
);

-- Future-proofing: approval flow table required by Corsair when permissions are enabled.
-- Permission policies remain `open`/none for now; adding the table now avoids a missed future migration.
-- Source: https://docs.corsair.dev/concepts/permissions
CREATE TABLE IF NOT EXISTS corsair_permissions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  token TEXT NOT NULL,
  plugin TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  args TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TEXT NOT NULL,
  error TEXT
);
