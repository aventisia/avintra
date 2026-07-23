/**
 * It defines options for the header' searchbox. Like show/hide and position etc
 * @interface ISearchBoxOptions
 */
interface ISearchBoxOptions {
  /**
   * Shows or hide the searchbox
   * @type {boolean}
   */
  show: boolean;

  /**
   * Sets the position of searchbox in center or right side of the header
   * @type {"center" | "right"}
   */
  position?: "center" | "right";
}

export { type ISearchBoxOptions };
