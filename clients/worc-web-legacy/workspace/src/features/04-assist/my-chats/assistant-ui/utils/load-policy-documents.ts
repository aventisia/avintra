/**
 * Eagerly loads every .txt file inside the test-policy-documents folder using
 * Vite's import.meta.glob and concatenates their contents into a single
 * policy context string separated by a labelled divider.
 *
 * The resulting string is intended to be sent as a second system message on
 * every chat request so the LLM is aware of company policies at all times.
 */
const policyModules = import.meta.glob<string>(
  ["../policy-documents-sample/*.txt"],
  { eager: true, query: "?raw", import: "default" },
);

export const loadPolicyDocuments = (): string => {
  const sections = Object.entries(policyModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([filePath, content]) => {
      const fileName = filePath.split("/").pop() ?? filePath;
      const docName = fileName
        .replace(/\.txt$/i, "")
        .replace(/-/g, " ")
        .toUpperCase();
      return `[POLICY DOCUMENT: ${docName}]\n${content}`;
    });

  return sections.join("\n\n" + "=".repeat(60) + "\n\n");
};
