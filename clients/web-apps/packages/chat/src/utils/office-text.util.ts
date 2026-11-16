// IMPORTANT NOTE: extracted text goes into the prompt, so a huge workbook is cut to keep the request within model limits.
const MAX_TEXT_LENGTH = 200_000;

const XML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

const decodeXml = (text: string) =>
  text.replace(/&(amp|lt|gt|quot|apos|#x[\da-f]+|#\d+);/giu, (_, entity: string) =>
    entity.startsWith("#x") || entity.startsWith("#X")
      ? String.fromCodePoint(parseInt(entity.slice(2), 16))
      : entity.startsWith("#")
        ? String.fromCodePoint(parseInt(entity.slice(1), 10))
        : (XML_ENTITIES[entity.toLowerCase()] ?? ""),
  );

/** Reads the paragraphs of a Word `word/document.xml` as plain text, one per line. */
export const docxXmlToText = (xml: string) =>
  xml
    .split(/<\/w:p>/u)
    .map((paragraph) =>
      [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:(tab|br|cr)\b[^>]*\/>/gu)]
        .map(([, text, tag]) => (tag === "tab" ? "\t" : tag ? "\n" : decodeXml(text ?? "")))
        .join(""),
    )
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();

const truncate = (text: string) =>
  text.length > MAX_TEXT_LENGTH ? `${text.slice(0, MAX_TEXT_LENGTH)}\n[Truncated]` : text;

/** Extracts the text of a Word document, or each sheet of a workbook as CSV. */
export const extractOfficeText = async (file: File) => {
  const XLSX = await import("xlsx");
  const data = new Uint8Array(await file.arrayBuffer());
  if (/\.docx$/iu.test(file.name)) {
    const document = XLSX.CFB.find(XLSX.CFB.read(data, { type: "array" }), "/word/document.xml");
    if (!document) throw new Error(`${file.name} isn't a readable Word document.`);
    return truncate(docxXmlToText(new TextDecoder().decode(document.content)));
  }
  const workbook = XLSX.read(data, { type: "array" });
  return truncate(
    workbook.SheetNames.map((name) => {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]!, { blankrows: false }).trim();
      return csv && `Sheet: ${name}\n${csv}`;
    })
      .filter(Boolean)
      .join("\n\n"),
  );
};
