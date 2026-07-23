export type LLModelType = {
  /* Official value of the model that can be passed to llmpipeline apis */
  value: string;

  /* Display name (which is officially used) of the model
   * It is optional. If label is not provided, value will be used as label by default
   */
  label?: string;

  /* Associated voices for the model, if it has the capability to respond in voice */
  voices?: { label: string; value: string }[];

  /* Specialty of the model. TODO: We need to define better naming for this.
   * This property defines that where can this model be used. Will set this later.
   * For now, we are keeping it optional
   */
  specialty?: (
    "text" | "vision" | "image" | "tts" | "stt" | "video" | "realtime" | "deep-search"
  )[];
};
