/**
 * Represents a manually authored tool operation. Manual operations are
 * synthesized into a standard OpenAPI specification by the backend before
 * persistence, so manual tools flow through the same pipeline as spec tools.
 */
export interface ManualToolOperation {
  /**
   * Display name of the operation.
   */
  name: string;

  /**
   * Long-form description of the operation.
   */
  description?: string;

  /**
   * HTTP method of the operation.
   */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  /**
   * Endpoint path template (e.g. /users/{id}).
   */
  endpoint: string;

  /**
   * Static headers applied to every request of this operation.
   */
  headers?: ManualToolOperationHeader[];

  /**
   * User-defined parameters (query, header) of the operation.
   */
  parameters?: ManualToolOperationParameter[];

  /**
   * JSON payload sample used to infer the request body schema.
   */
  jsonPayload?: string | null;
}

/**
 * Represents a static header of a manually authored operation.
 */
export interface ManualToolOperationHeader {
  key: string;
  value?: string;
}

/**
 * Represents a user-defined parameter of a manually authored operation.
 */
export interface ManualToolOperationParameter {
  name: string;
  in: "query" | "header";
  required?: boolean;
  description?: string;
  type?: string;
}
