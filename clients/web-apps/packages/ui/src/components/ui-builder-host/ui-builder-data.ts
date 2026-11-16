import { type AxiosInstance } from "axios";

import {
  type UiBuilderDataRequest,
  type UiBuilderRuntimeWorkItem,
  type UiBuilderRuntimeWorkItemPage,
} from "./ui-builder-host.types";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === "string" ? value : null);

const parseWorkItemData = (value: unknown): Record<string, unknown> => {
  if (isRecord(value)) return value;
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : { value: parsed };
  } catch {
    return { value };
  }
};

const unwrapEnvelope = (value: unknown): unknown =>
  isRecord(value) && "data" in value && ("succeeded" in value || "message" in value)
    ? value.data
    : value;

/** Converts a backend work item into the shape a generated interface receives. */
export const toUiBuilderRuntimeWorkItem = (raw: unknown): UiBuilderRuntimeWorkItem => {
  const item = isRecord(raw) ? raw : {};
  return {
    id: asString(item.id) ?? "",
    status: asString(item.status) ?? "",
    data: parseWorkItemData(item.workItemData ?? item.payloadData),
    description: asString(item.description),
    assignee: asString(item.assignee),
    createdBy: asString(item.createdBy),
    createdOn: asString(item.createdOn),
    lastModifiedOn: asString(item.lastModifiedOn),
  };
};

/** Converts a backend work item list response into a runtime page. */
export const toUiBuilderRuntimeWorkItemPage = (raw: unknown): UiBuilderRuntimeWorkItemPage => {
  const payload = unwrapEnvelope(raw);
  if (Array.isArray(payload)) {
    return { items: payload.map(toUiBuilderRuntimeWorkItem), total: payload.length };
  }
  if (!isRecord(payload)) return { items: [], total: 0 };

  const list = [payload.items, payload.workItems, payload.data, payload.records].find(
    Array.isArray,
  );
  const items = (list ?? []).map(toUiBuilderRuntimeWorkItem);
  const totalCandidate = [payload.total, payload.totalCount, payload.totalRecords].find(
    (value) => typeof value === "number",
  );
  return { items, total: typeof totalCandidate === "number" ? totalCandidate : items.length };
};

const toHintList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is RawRecord =>
          isRecord(entry) && typeof entry.label === "string" && typeof entry.formula === "string",
      )
    : [];

/**
 * Completes a query result with the spec's display hints so pages can rely on one shape: every
 * named query in the spec gets `rows`, `totalRows`, `description`, `formulas`, `title`, `labels`
 * (metric name → label), and `derived` (page-computed formulas), even when the server omits them.
 */
export const withUiBuilderQueryHints = (spec: unknown, result: unknown) => {
  const specRecord = isRecord(spec) ? spec : {};
  const specQueries = isRecord(specRecord.queries) ? specRecord.queries : {};
  const base = isRecord(result) ? result : {};
  const resultQueries = isRecord(base.queries) ? base.queries : {};
  const sharedDerived = toHintList(specRecord.derived);

  const queries = Object.fromEntries(
    [...new Set([...Object.keys(specQueries), ...Object.keys(resultQueries)])].map((name) => {
      const querySpec = isRecord(specQueries[name]) ? specQueries[name] : {};
      const resultSet = isRecord(resultQueries[name]) ? resultQueries[name] : {};
      const metrics = Array.isArray(querySpec.metrics) ? querySpec.metrics.filter(isRecord) : [];
      return [
        name,
        {
          ...resultSet,
          rows: Array.isArray(resultSet.rows) ? resultSet.rows : [],
          totalRows: typeof resultSet.totalRows === "number" ? resultSet.totalRows : 0,
          description: typeof resultSet.description === "string" ? resultSet.description : "",
          formulas: isRecord(resultSet.formulas) ? resultSet.formulas : {},
          title: typeof querySpec.title === "string" ? querySpec.title : name,
          labels: Object.fromEntries(
            metrics
              .filter((metric) => typeof metric.name === "string")
              .map((metric) => [
                metric.name as string,
                typeof metric.label === "string" ? metric.label : (metric.name as string),
              ]),
          ),
          derived: toHintList(querySpec.derived),
        },
      ];
    }),
  );

  return {
    ...base,
    queries,
    derived: sharedDerived,
    scanned: typeof base.scanned === "number" ? base.scanned : 0,
    truncated: Boolean(base.truncated),
    filterDescription: typeof base.filterDescription === "string" ? base.filterDescription : "",
  };
};

const clampPageSize = (value: unknown) => {
  const size = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0;
  return size > 0 ? Math.min(size, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
};

const clampSkip = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

/**
 * Creates the data-request handler a host passes to `UiBuilderHostFrame`. Requests go
 * through the project-scoped UI builder proxy, so the project grant authorizes them.
 */
export const createUiBuilderDataRequester =
  (options: {
    http: AxiosInstance;
    apiBaseUrl: string;
    projectId: string;
    getHeaders?: () => Record<string, string>;
  }) =>
  async ({ connection, operation, params }: UiBuilderDataRequest): Promise<unknown> => {
    const url = `${options.apiBaseUrl}/ui-builder/${options.projectId}/data/${encodeURIComponent(connection.key)}`;
    const headers = { ...(options.getHeaders?.() ?? {}), "X-Env-Type": connection.envType };
    const id = asString(params.id) ?? "";

    if (operation === "list") {
      const response = await options.http.post(
        `${url}/list`,
        {
          status: asString(params.status),
          top: clampPageSize(params.top),
          skip: clampSkip(params.skip),
          conditions: Array.isArray(params.conditions) ? params.conditions : undefined,
        },
        { headers },
      );
      return toUiBuilderRuntimeWorkItemPage(response.data);
    }

    if (operation === "query") {
      const response = await options.http.post(`${url}/query`, params, { headers });
      return withUiBuilderQueryHints(params, unwrapEnvelope(response.data));
    }

    if (operation === "get") {
      const response = await options.http.get(`${url}/items/${encodeURIComponent(id)}`, {
        headers,
      });
      return toUiBuilderRuntimeWorkItem(unwrapEnvelope(response.data));
    }

    if (operation === "add") {
      const response = await options.http.post(
        `${url}/items`,
        {
          workItemData: isRecord(params.data) ? params.data : {},
          description: asString(params.description),
        },
        { headers },
      );
      return toUiBuilderRuntimeWorkItem(unwrapEnvelope(response.data));
    }

    const response = await options.http.put(
      `${url}/items`,
      {
        id,
        status: asString(params.status),
        workItemData: isRecord(params.data) ? params.data : undefined,
      },
      { headers },
    );
    return toUiBuilderRuntimeWorkItem(unwrapEnvelope(response.data));
  };

/** An uploaded project image as returned by the asset content endpoint. */
export type UiBuilderAssetContent = {
  name: string;
  contentType: string;
  dataBase64?: string | null;
};

/** Turns asset content rows into the name → data URL map the host frame injects. */
export const toUiBuilderAssetMap = (assets: UiBuilderAssetContent[] | null | undefined) =>
  Object.fromEntries(
    (assets ?? [])
      .filter((asset) => asset.dataBase64)
      .map((asset) => [asset.name, `data:${asset.contentType};base64,${asset.dataBase64}`]),
  ) as Record<string, string>;

/**
 * Fetches a project's images as the name → data URL map `UiBuilderHostFrame` injects. Resolves to an
 * empty map when the viewer cannot read them, so the interface still renders.
 */
export const fetchUiBuilderAssetMap = async (options: {
  http: AxiosInstance;
  apiBaseUrl: string;
  projectId: string;
  getHeaders?: () => Record<string, string>;
}) => {
  try {
    const response = await options.http.get<{ data?: UiBuilderAssetContent[] }>(
      `${options.apiBaseUrl}/ui-builder/${options.projectId}/assets/content`,
      { headers: options.getHeaders?.() ?? {} },
    );
    return toUiBuilderAssetMap(response.data?.data);
  } catch {
    return {};
  }
};
