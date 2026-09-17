/**
 * Represents the available types of controls that can be used in the dynamic config panel.
 *
 * - `"text"`: A single-line text input.
 * - `"number"`: A numeric input field.
 * - `"password"`: A password input field.
 * - `"email"`: An email address input field.
 * - `"file"`: A file upload input.
 * - `"color"`: A color picker input.
 * - `"time"`: A time picker input.
 * - `"otp"`: An input for one-time passwords.
 * - `"phone"`: A phone number input field.
 * - `"select"`: A dropdown select input.
 * - `"multi-selector"`: A multi-select dropdown input.
 * - `"tag-input"`: An input for entering tags.
 * - `"combobox"`: A combo box input (combination of input and select).
 * - `"checkbox"`: A checkbox input.
 * - `"switch"`: A toggle switch input.
 * - `"radio-group"`: A group of radio buttons.
 * - `"date"`: A date picker input.
 * - `"slider"`: A slider input for selecting a value or range.
 * - `"textarea"`: A multi-line text input.
 */
export type DCPControlType =
  | "text"
  | "number"
  | "password"
  | "email"
  | "file"
  | "color"
  | "time"
  | "otp"
  | "phone"
  | "select"
  | "multi-selector"
  | "tag-input"
  | "combobox"
  | "checkbox"
  | "switch"
  | "radio-group"
  | "date"
  | "slider"
  | "textarea"
  | "condition-groups"
  | "config-panel-output"
  | "model-select"
  | "credentials-select"
  | "config-panel-model-output"
  | "model-config-select"
  | "tools-config-select"
  | "voice-config-select"
  | "prompt-input"
  | "prompt-input-v2"
  | "knowledge-base-config"
  | "skills-config"
  | "memory-config"
  | "json-editor"
  | "queue-select"
  | "queue-status-select"
  | "queue-conditional-group"
  | "queue-priority-group"
  | "string-array"
  | "suggestions"
  | "code-editor";
