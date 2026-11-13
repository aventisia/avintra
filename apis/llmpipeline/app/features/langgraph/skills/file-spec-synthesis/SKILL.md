---
name: file-spec-synthesis
description: Emit a doc-spec, sheet-spec or slide-spec fenced block so the chat can build a real .docx, .xlsx or .pptx binary from the spec.
providers: []
license:
  name: MIT
  url: https://opensource.org/licenses/MIT
  terms: ""
references:
  - title: File Spec Synthesis Skill Source
    url: ./
    type: source
tags:
  - documents
  - spreadsheets
  - presentations
---

# File Spec Synthesis

Applies when the user asks for a real Word document, Excel spreadsheet, or PowerPoint deck.
Write exactly one fenced spec block and a sentence of reasoning outside the fence.
Never emit binary content; the chat builds the file bytes server-side and stores the artifact.
Off-schema specs are dropped, so keep every spec inside the schemas below.

## License

This skill is released under the MIT license. See `license.url` above.

## References

- Source code is located in the same package as this `SKILL.md` file.

## doc-spec (Word)

A fenced block tagged `doc-spec` holding the document's markdown.
The first `# heading` names the `.docx` file.

```doc-spec
# Q3 review

Intro paragraph with **bold**, *italic* and `code`.

- Bullet one
- Bullet two

| Metric | Value |
|--------|-------|
| Spend  | 128k  |
```

Headings (`#`, `##`, `###`), bullets (`-`, `*`, `1.`), tables, ```` ``` ```` code
fences and `>` quotes are supported. Keep it under 10 MB of text.

## sheet-spec (Excel)

A fenced block tagged `sheet-spec` holding one JSON object with `columns`
(non-empty strings, at most 64) and `rows` (arrays of string, number, boolean
or null, at most 10000 rows). `title` is optional and names the `.xlsx` file.

```sheet-spec
{"title": "Q3 spend", "columns": ["Category", "Amount", "Paid"], "rows": [["Cloud", 128000, true], ["Travel", 18000, false]]}
```

## slide-spec (PowerPoint)

A fenced block tagged `slide-spec` holding one JSON object with `slides`
(1 to 50). Each slide has an optional `title`, optional `bullets` (at most 12
non-empty strings) and optional `layout` (`title`, `bullets` or
`title-bullets`, default `title-bullets`); every slide needs a title, a
bullet, or both. The top-level `title` is optional and names the `.pptx` file.

```slide-spec
{"title": "Launch", "slides": [{"title": "Goal", "bullets": ["Ship it", "Measure"]}, {"title": "Thanks", "layout": "title"}]}
```
