import { CopyJsonAction } from "./CopyJsonAction";

/** Convenience builder for a header copy action, returning undefined for empty JSON. */
export const createCopyJsonAction = (
  json: string | undefined | null,
  options: { skipEmpty?: boolean } = {},
): JSX.Element | undefined => {
  const { skipEmpty = true } = options;

  if (skipEmpty && (!json || json === "{}")) {
    return undefined;
  }

  return <CopyJsonAction json={json ?? "{}"} />;
};
