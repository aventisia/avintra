import { useEffect, useMemo, useRef } from "react";

import {
  type UiBuilderDataConnection,
  type UiBuilderDataRequest,
  type UiBuilderDataRequestOperation,
  type UiBuilderQueryResultEvent,
  type UiBuilderRuntimeError,
} from "./ui-builder-host.types";
import {
  UI_BUILDER_HOST_SOURCE,
  UI_BUILDER_RUNTIME_SOURCE,
  prepareUiBuilderDocument,
} from "./ui-builder-runtime";

const DATA_OPERATIONS: ReadonlyArray<UiBuilderDataRequestOperation> = [
  "list",
  "get",
  "add",
  "update",
  "query",
];

const isOperationAllowed = (
  connection: UiBuilderDataConnection,
  operation: UiBuilderDataRequestOperation,
) =>
  operation === "query"
    ? connection.operations.includes("list")
    : connection.operations.includes(operation);
const MAX_REQUEST_ID_LENGTH = 64;
const MAX_PARAMS_LENGTH = 64000;

type UiBuilderHostFrameProps = {
  html: string;
  title: string;
  className?: string;
  /** Connections the interface may use; requests for any other key are refused. */
  connections?: UiBuilderDataConnection[];
  /** Runs an allowed data request on the interface's behalf. */
  onDataRequest?: (request: UiBuilderDataRequest) => Promise<unknown>;
  onRuntimeError?: (error: UiBuilderRuntimeError) => void;
  onReady?: () => void;
  /** Receives every other message the frame posts, for host-specific bridges. */
  onFrameMessage?: (data: unknown) => void;
  /** Receives each successful query with its spec, so the host can explain the calculations. */
  onQueryResult?: (event: UiBuilderQueryResultEvent) => void;
  /** Project images, by name, that the interface reads with `Avintra.asset(name)`. */
  assets?: Record<string, string>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const describeError = (error: unknown) => {
  if (isRecord(error)) {
    const response = error.response;
    if (isRecord(response) && isRecord(response.data)) {
      const message = response.data.message ?? response.data.title;
      if (typeof message === "string" && message) return message;
    }
    if (typeof error.message === "string" && error.message) return error.message;
  }
  return "The data request failed.";
};

/**
 * Renders a generated interface in an `allow-scripts`-only sandbox with the Avintra
 * runtime injected, answering its data requests against the allowed connections.
 */
export const UiBuilderHostFrame = ({
  html,
  title,
  className,
  connections = [],
  onDataRequest,
  onRuntimeError,
  onReady,
  onFrameMessage,
  onQueryResult,
  assets,
}: UiBuilderHostFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlersRef = useRef({
    connections,
    onDataRequest,
    onRuntimeError,
    onReady,
    onFrameMessage,
    onQueryResult,
  });
  handlersRef.current = {
    connections,
    onDataRequest,
    onRuntimeError,
    onReady,
    onFrameMessage,
    onQueryResult,
  };

  const srcDoc = useMemo(() => prepareUiBuilderDocument(html, { assets }), [html, assets]);

  useEffect(() => {
    const respond = (id: string, payload: { ok: boolean; data?: unknown; error?: string }) => {
      iframeRef.current?.contentWindow?.postMessage(
        { source: UI_BUILDER_HOST_SOURCE, type: "data:response", id, ...payload },
        "*",
      );
    };

    const handleDataRequest = (data: Record<string, unknown>) => {
      const id = data.id;
      if (typeof id !== "string" || !id || id.length > MAX_REQUEST_ID_LENGTH) return;

      const { connections: allowed, onDataRequest: run } = handlersRef.current;
      const connection = allowed.find((candidate) => candidate.key === data.connection);
      const operation = data.operation as UiBuilderDataRequestOperation;
      const params = isRecord(data.params) ? data.params : {};

      if (!run) {
        respond(id, { ok: false, error: "Data connections are not available here." });
        return;
      }
      if (!connection) {
        respond(id, { ok: false, error: `No data connection named "${String(data.connection)}".` });
        return;
      }
      if (!DATA_OPERATIONS.includes(operation) || !isOperationAllowed(connection, operation)) {
        respond(id, {
          ok: false,
          error: `The "${connection.key}" connection does not allow "${String(operation)}".`,
        });
        return;
      }
      if (JSON.stringify(params).length > MAX_PARAMS_LENGTH) {
        respond(id, { ok: false, error: "The data request is too large." });
        return;
      }

      run({ connection, operation, params }).then(
        (result) => {
          respond(id, { ok: true, data: result });
          if (operation === "query") {
            handlersRef.current.onQueryResult?.({ connection, spec: params, result });
          }
        },
        (error: unknown) => respond(id, { ok: false, error: describeError(error) }),
      );
    };

    const handleMessage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const data: unknown = event.data;
      if (!isRecord(data)) return;

      if (data.source !== UI_BUILDER_RUNTIME_SOURCE) {
        handlersRef.current.onFrameMessage?.(data);
        return;
      }

      if (data.type === "data:request") handleDataRequest(data);
      else if (data.type === "runtime:error") {
        handlersRef.current.onRuntimeError?.({
          message: typeof data.message === "string" ? data.message : "Unknown error",
          stack: typeof data.stack === "string" ? data.stack : undefined,
        });
      } else if (data.type === "runtime:ready") handlersRef.current.onReady?.();
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // IMPORTANT NOTE: generated documents must only ever run inside a sandbox limited to
  // `allow-scripts`; adding `allow-same-origin` (or any other token) would let the
  // generated document reach the host origin and its session.
  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      className={className}
    />
  );
};
