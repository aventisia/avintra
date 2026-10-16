/** A single element picked from the rendered builder preview via the bridge script. */
export type UiBuilderSelection = {
  selector: string;
  outerHtml: string;
  textContent: string;
};
