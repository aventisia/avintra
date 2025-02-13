/** Generic wrapper for web api response */
interface IHttpResponse<T> {
  /** API response data object */
  data: T;

  /** API response status code */
  statusCode: number;

  /** API response execution's result message. Max length is 255 char. */
  message: string;
}

export { type IHttpResponse };
