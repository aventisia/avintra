/**
 * Tint classes for an HTTP method badge, for example green for GET and red for DELETE.
 */
export const getHttpMethodBadgeClass = (method: string): string => {
  switch (method) {
    case "GET":
      return "bg-ok/10 text-ok";
    case "POST":
      return "bg-selected text-primary-text";
    case "PUT":
      return "bg-warn/10 text-warn";
    case "PATCH":
      return "bg-selected text-primary-text";
    case "DELETE":
      return "bg-bad/10 text-bad";
    default:
      return "bg-primary/10 text-primary";
  }
};
