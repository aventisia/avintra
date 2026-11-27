export const PROJECT_MAX_FILES = 10;
export const PROJECT_MAX_FILE_BYTES = 51200;
export const PROJECT_MAX_TOTAL_BYTES = 102400;
export const PROJECT_INSTRUCTIONS_LIMIT = 4000;
export const PROJECT_FILE_NAME_MAX_LENGTH = 200;

export const PROJECT_FILE_EXTENSIONS = [
  "txt",
  "md",
  "csv",
  "json",
  "xml",
  "yaml",
  "html",
  "css",
  "js",
  "ts",
  "tsx",
  "py",
  "cs",
  "java",
  "sql",
  "log",
] as const;

export const PROJECT_FILE_ACCEPT = PROJECT_FILE_EXTENSIONS.map((extension) => `.${extension}`).join(
  ",",
);
