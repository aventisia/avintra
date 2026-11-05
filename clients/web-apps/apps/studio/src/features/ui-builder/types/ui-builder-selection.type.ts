/** A single element picked from the rendered builder preview via the bridge script. */
export type UiBuilderSelection = {
  selector: string;
  outerHtml: string;
  textContent: string;
  /** Index of the JSX tag the element was rendered from, when the version is React. */
  sourceId?: string;
  /** Opening JSX tag text of that element, for prompts. */
  sourceTag?: string;
};
