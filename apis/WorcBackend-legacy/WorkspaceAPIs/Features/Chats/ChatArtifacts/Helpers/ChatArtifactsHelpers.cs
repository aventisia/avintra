using ClosedXML.Excel;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using A = DocumentFormat.OpenXml.Drawing;
using P = DocumentFormat.OpenXml.Presentation;
using W = DocumentFormat.OpenXml.Wordprocessing;

namespace WorkspaceAPIs.Helpers;

public static class ChatArtifactsHelpers
{
    /// <summary>
    /// Maximum number of files accepted on a single chat message.
    /// </summary>
    public const int MaxFilesPerMessage = 3;

    /// <summary>
    /// Maximum accepted file size in bytes (10 MB).
    /// </summary>
    public const long MaxFileBytes = 10 * 1024 * 1024;

    /// <summary>
    /// Blob-name prefix of chat artifacts kept in Azure Blob Storage; other blob paths are data URLs.
    /// </summary>
    public const string BlobPrefix = "chat-artifacts/";

    private static readonly Dictionary<string, (string Name, string ContentType)> FileFences = new(StringComparer.OrdinalIgnoreCase)
    {
        ["html"] = ("Generated UI.html", "text/html"),
        ["svg"] = ("Image.svg", "image/svg+xml"),
        ["csv"] = ("Data.csv", "text/csv"),
        ["tsv"] = ("Data.tsv", "text/tab-separated-values"),
        ["markdown"] = ("Document.md", "text/markdown"),
        ["md"] = ("Document.md", "text/markdown"),
    };

    // IMPORTANT NOTE: mirrors findChatFile in @avplatform/chat; the browser matches a stored file to its reply by type and UTF-8 size, so both must extract the same body.
    private static readonly Regex FileFencePattern = new(
        @"^```(html|svg|csv|tsv|markdown|md)[ \t]*\n([\s\S]*?)^```[ \t]*$",
        RegexOptions.Multiline | RegexOptions.IgnoreCase);

    private static readonly Regex BareHtmlPattern = new(@"^(<!doctype html|<html[\s>])[\s\S]*</html>$", RegexOptions.IgnoreCase);
    private static readonly Regex TitlePattern = new(@"<title[^>]*>([^<]*)</title>", RegexOptions.IgnoreCase);
    private static readonly Regex MarkdownTitlePattern = new(@"^#[ \t]+(.+)$", RegexOptions.Multiline);
    private static readonly Regex UnsafeNameCharacters = new(@"[\\/:*?""<>|#]");

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".txt", ".md",
        ".csv", ".tsv", ".json", ".xml",
        ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp",
        ".xls", ".xlsx", ".ppt", ".pptx",
    };

    private static readonly HashSet<string> DeniedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "text/html",
        "text/javascript",
        "application/javascript",
    };

    // Model-generated files are platform output, not user uploads, so code
    // documents are allowed for them while uploads stay on the strict list.
    // Phase 2 extends this to the document/spreadsheet/presentation/PDF types
    // the workspace chat promises, reusing the text preview + summary fallback.
    private static readonly HashSet<string> AllowedGeneratedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".html", ".css", ".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".txt", ".svg",
        ".csv", ".tsv", ".xml",
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp",
    };

    /// <summary>
    /// Validates chat file references against the phase-1 upload limits, returning an error message or null.
    /// </summary>
    /// <param name="files">Data URLs or http(s) URLs attached to the message.</param>
    /// <returns></returns>
    public static string? ValidateFiles(IEnumerable<string>? files)
    {
        if (files is null)
            return null;

        var fileList = files.Where(f => !string.IsNullOrWhiteSpace(f)).ToList();

        if (fileList.Count > MaxFilesPerMessage)
            return $"A maximum of {MaxFilesPerMessage} files can be attached to a message.";

        foreach (var file in fileList)
        {
            var error = ValidateFile(file);
            if (error is not null)
                return error;
        }

        return null;
    }

    /// <summary>
    /// Checks a file extension against the phase-1 allowlist.
    /// </summary>
    /// <param name="extension">File extension including the leading dot.</param>
    /// <returns></returns>
    public static bool IsAllowedExtension(string extension) => AllowedExtensions.Contains(extension);

    /// <summary>
    /// Checks a file extension against the generated-artifact allowlist.
    /// </summary>
    /// <param name="extension">File extension including the leading dot.</param>
    /// <returns></returns>
    public static bool IsAllowedGeneratedExtension(string extension) => AllowedGeneratedExtensions.Contains(extension);

    /// <summary>
    /// Checks a media type against the generated-artifact allowlist.
    /// </summary>
    /// <param name="mimeType">Media type without parameters.</param>
    /// <returns></returns>
    public static bool IsAllowedGeneratedMimeType(string mimeType)
    {
        return mimeType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/json", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/xml", StringComparison.OrdinalIgnoreCase) ||
            mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("officedocument", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("msword", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-excel", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-powerpoint", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Checks a media type against the phase-1 allowlist.
    /// </summary>
    /// <param name="mimeType">Media type without parameters.</param>
    /// <returns></returns>
    public static bool IsAllowedMimeType(string mimeType)
    {
        if (DeniedMimeTypes.Contains(mimeType))
            return false;

        return mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/json", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/xml", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("officedocument", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("msword", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-excel", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-powerpoint", StringComparison.OrdinalIgnoreCase);
    }

    private static string? ValidateFile(string file)
    {
        if (file.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            return ValidateDataUrl(file);

        if (Uri.TryCreate(file, UriKind.Absolute, out var uri) &&
            (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
        {
            var extension = Path.GetExtension(uri.AbsolutePath);
            return IsAllowedExtension(extension)
                ? null
                : $"File type '{extension}' is not supported.";
        }

        return "Unsupported file reference. Attach a file or an http(s) URL.";
    }

    private static string? ValidateDataUrl(string dataUrl)
    {
        var commaIndex = dataUrl.IndexOf(',');
        if (commaIndex < 0)
            return "Unsupported file reference. Attach a file or an http(s) URL.";

        var header = dataUrl.Substring("data:".Length, commaIndex - "data:".Length);
        var mimeType = header.Split(';')[0].Trim();
        if (!IsAllowedMimeType(mimeType))
            return $"File type '{mimeType}' is not supported.";

        return TryGetDataUrlSizeBytes(dataUrl, out var sizeBytes) && sizeBytes > MaxFileBytes
            ? "Each file must be 10 MB or smaller."
            : null;
    }

    /// <summary>
    /// Estimates the decoded byte size of a data URL without fully decoding it.
    /// </summary>
    /// <param name="dataUrl">Data URL to measure.</param>
    /// <param name="sizeBytes">Estimated decoded size in bytes.</param>
    /// <returns></returns>
    public static bool TryGetDataUrlSizeBytes(string dataUrl, out long sizeBytes)
    {
        sizeBytes = 0;
        var commaIndex = dataUrl.IndexOf(',');
        if (commaIndex < 0)
            return false;

        var base64 = dataUrl[(commaIndex + 1)..];
        var padding = base64.EndsWith("==") ? 2 : base64.EndsWith('=') ? 1 : 0;
        sizeBytes = base64.Length * 3L / 4 - padding;
        return true;
    }

    /// <summary>
    /// Finds the first complete file a landing reply wrote as a fenced block, or a reply that is a whole HTML page.
    /// </summary>
    /// <param name="replyText">The reply's full text.</param>
    /// <returns>The file, or null when the reply holds none.</returns>
    public static GeneratedChatFile? FindGeneratedFile(string replyText)
    {
        var trimmed = replyText.Trim();
        if (BareHtmlPattern.IsMatch(trimmed))
            return new GeneratedChatFile(NameFromContent(trimmed, FileFences["html"]), "text/html", trimmed);

        var match = FileFencePattern.Match(replyText);
        if (!match.Success)
            return null;

        var fence = FileFences[match.Groups[1].Value];
        var body = match.Groups[2].Value.Trim();
        return new GeneratedChatFile(NameFromContent(body, fence), fence.ContentType, body);
    }

    private static string NameFromContent(string body, (string Name, string ContentType) fence)
    {
        var titleMatch = fence.ContentType switch
        {
            "text/html" or "image/svg+xml" => TitlePattern.Match(body),
            "text/markdown" => MarkdownTitlePattern.Match(body),
            _ => Match.Empty,
        };
        var title = UnsafeNameCharacters.Replace(titleMatch.Success ? titleMatch.Groups[1].Value : string.Empty, string.Empty).Trim();
        if (title.Length > 60)
            title = title[..60];
        return title.Length > 0 ? title + Path.GetExtension(fence.Name) : fence.Name;
    }

    private static readonly Dictionary<string, (string Name, string ContentType)> SpecFences = new(StringComparer.OrdinalIgnoreCase)
    {
        ["doc-spec"] = ("Document.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        ["sheet-spec"] = ("Data.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        ["slide-spec"] = ("Slides.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
    };

    private static readonly Regex SpecFencePattern = new(
        @"^```(sheet-spec|slide-spec)[ \t]*\n([\s\S]*?)^```[ \t]*$",
        RegexOptions.Multiline | RegexOptions.IgnoreCase);

    // IMPORTANT NOTE: doc-spec bodies hold markdown that can itself contain fenced code blocks,
    // so the reply's last fence closes the spec; sheet and slide specs are single JSON blocks.
    private static readonly Regex DocSpecFencePattern = new(
        @"^```doc-spec[ \t]*\n([\s\S]*)^```[ \t]*$",
        RegexOptions.Multiline | RegexOptions.IgnoreCase);

    private const int MaxSpecColumns = 64;
    private const int MaxSpecRows = 10000;
    private const int MaxSpecSlides = 50;
    private const int MaxSpecBullets = 12;
    private const int MaxExcelCellChars = 32767;

    /// <summary>
    /// Builds a real binary office file from the first spec block a landing reply wrote, or null when the reply holds no valid spec.
    /// </summary>
    /// <param name="replyText">The reply's full text, or a lone fenced spec block.</param>
    /// <returns>The synthesized file, or null when no spec fence parses and validates.</returns>
    public static SynthesizedChatFile? TrySynthesizeSpecFile(string replyText)
    {
        var specMatch = SpecFencePattern.Match(replyText);
        string kind;
        string body;
        if (specMatch.Success)
        {
            kind = specMatch.Groups[1].Value.ToLowerInvariant();
            body = specMatch.Groups[2].Value.Trim();
        }
        else
        {
            var docMatch = DocSpecFencePattern.Match(replyText);
            if (!docMatch.Success)
                return null;
            kind = "doc-spec";
            body = docMatch.Groups[1].Value.Trim();
        }
        if (body.Length == 0)
            return null;

        var spec = SpecFences[kind];
        var bytes = kind switch
        {
            "doc-spec" => BuildDocx(body),
            "sheet-spec" => BuildXlsx(body),
            "slide-spec" => BuildPptx(body),
            _ => null,
        };
        if (bytes is null || bytes.Length == 0 || bytes.Length > MaxFileBytes)
            return null;

        return new SynthesizedChatFile(SpecFileName(kind, body, spec.Name), spec.ContentType, bytes);
    }

    private static string SpecFileName(string kind, string body, string fallback)
    {
        var title = kind == "doc-spec"
            ? MarkdownTitlePattern.Match(body).Groups[1].Value
            : SpecJsonTitle(body);
        title = UnsafeNameCharacters.Replace(title ?? string.Empty, string.Empty).Trim();
        if (title.Length > 60)
            title = title[..60];
        return title.Length > 0 ? title + Path.GetExtension(fallback) : fallback;
    }

    private static string SpecJsonTitle(string body)
    {
        try
        {
            return JsonNode.Parse(body)?["title"]?.GetValue<string>() ?? string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    private static byte[]? BuildXlsx(string body)
    {
        var sheet = ParseSheetSpec(body);
        if (sheet is null)
            return null;

        using var workbook = new XLWorkbook();
        var worksheet = workbook.AddWorksheet("Sheet1");
        for (var c = 0; c < sheet.Columns.Count; c++)
            worksheet.Cell(1, c + 1).Value = sheet.Columns[c];
        worksheet.Row(1).Style.Font.Bold = true;
        for (var r = 0; r < sheet.Rows.Count; r++)
            for (var c = 0; c < sheet.Columns.Count; c++)
                SetCellValue(worksheet.Cell(r + 2, c + 1), sheet.Rows[r][c]);
        worksheet.Columns().AdjustToContents();
        worksheet.SheetView.FreezeRows(1);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static SheetSpec? ParseSheetSpec(string body)
    {
        JsonNode? root;
        try
        {
            root = JsonNode.Parse(body);
        }
        catch
        {
            return null;
        }

        var columnsNode = root?["columns"] as JsonArray;
        if (columnsNode is null || columnsNode.Count == 0 || columnsNode.Count > MaxSpecColumns)
            return null;

        var columns = new List<string>(columnsNode.Count);
        foreach (var column in columnsNode)
        {
            var name = (column as JsonValue)?.TryGetValue<string>(out var text) == true ? text : null;
            if (string.IsNullOrWhiteSpace(name) || name.Length > MaxExcelCellChars)
                return null;
            columns.Add(name);
        }

        var rowsNode = root?["rows"] as JsonArray;
        if (rowsNode is null || rowsNode.Count > MaxSpecRows)
            return null;

        var rows = new List<List<SheetCell>>(rowsNode.Count);
        foreach (var rowNode in rowsNode)
        {
            if (rowNode is not JsonArray cells)
                return null;
            var row = new List<SheetCell>(columns.Count);
            for (var c = 0; c < columns.Count; c++)
                row.Add(ParseSheetCell(c < cells.Count ? cells[c] : null));
            if (row.Any(cell => cell.Kind == SheetCellKind.Invalid))
                return null;
            rows.Add(row);
        }

        return new SheetSpec(columns, rows);
    }

    private static SheetCell ParseSheetCell(JsonNode? node)
    {
        if (node is null || node.GetValueKind() == JsonValueKind.Null)
            return new SheetCell(SheetCellKind.Blank, null);
        if (node is JsonValue value)
        {
            if (value.TryGetValue<bool>(out var boolean))
                return new SheetCell(SheetCellKind.Boolean, boolean);
            if (value.TryGetValue<double>(out var number))
                return new SheetCell(SheetCellKind.Number, number);
            if (value.TryGetValue<string>(out var text))
                return text.Length <= MaxExcelCellChars
                    ? new SheetCell(SheetCellKind.Text, text)
                    : new SheetCell(SheetCellKind.Invalid, null);
        }
        return new SheetCell(SheetCellKind.Invalid, null);
    }

    private static void SetCellValue(IXLCell cell, SheetCell sheetCell)
    {
        switch (sheetCell.Kind)
        {
            case SheetCellKind.Number when sheetCell.Value is double number:
                cell.Value = number;
                break;
            case SheetCellKind.Boolean when sheetCell.Value is bool boolean:
                cell.Value = boolean;
                break;
            case SheetCellKind.Text when sheetCell.Value is string text:
                cell.Value = text;
                break;
        }
    }

    private enum SheetCellKind { Blank, Text, Number, Boolean, Invalid }

    private sealed record SheetCell(SheetCellKind Kind, object? Value);

    private sealed record SheetSpec(List<string> Columns, List<List<SheetCell>> Rows);

    private static byte[]? BuildPptx(string body)
    {
        var deck = ParseSlideSpec(body);
        if (deck is null)
            return null;

        using var stream = new MemoryStream();
        using (var document = PresentationDocument.Create(stream, PresentationDocumentType.Presentation))
        {
            var presentationPart = document.AddPresentationPart();
            var slideIds = new P.SlideIdList();
            uint slideId = 256;
            uint relIndex = 2;

            var masterPart = presentationPart.AddNewPart<SlideMasterPart>("rId1");
            var layoutPart = masterPart.AddNewPart<SlideLayoutPart>("rId1");
            var themePart = masterPart.AddNewPart<ThemePart>("rId2");
            layoutPart.SlideLayout = BuildSlideLayout();
            themePart.Theme = BuildTheme();
            masterPart.SlideMaster = BuildSlideMaster();

            foreach (var slide in deck.Slides)
            {
                var relId = $"rId{relIndex++}";
                var slidePart = presentationPart.AddNewPart<SlidePart>(relId);
                slidePart.Slide = BuildSlide(slide);
                slidePart.AddPart(layoutPart);
                slideIds.Append(new P.SlideId { Id = slideId++, RelationshipId = relId });
            }

            presentationPart.Presentation = new P.Presentation(
                new P.SlideMasterIdList(new P.SlideMasterId { RelationshipId = "rId1" }),
                slideIds,
                new P.SlideSize { Cx = 9144000, Cy = 6858000 },
                new P.NotesSize { Cx = 6858000, Cy = 9144000 });
        }
        return stream.ToArray();
    }

    private static SlideDeck? ParseSlideSpec(string body)
    {
        JsonNode? root;
        try
        {
            root = JsonNode.Parse(body);
        }
        catch
        {
            return null;
        }

        if (root?["slides"] is not JsonArray slidesNode || slidesNode.Count == 0 || slidesNode.Count > MaxSpecSlides)
            return null;

        var slides = new List<SlideSpec>(slidesNode.Count);
        foreach (var slideNode in slidesNode)
        {
            var title = (slideNode?["title"] as JsonValue)?.TryGetValue<string>(out var slideTitle) == true
                ? slideTitle.Trim()
                : string.Empty;
            if (title.Length > 200)
                return null;

            var bulletsNode = slideNode?["bullets"] as JsonArray;
            if (bulletsNode is not null && bulletsNode.Count > MaxSpecBullets)
                return null;

            var bullets = new List<string>();
            if (bulletsNode is not null)
                foreach (var bulletNode in bulletsNode)
                {
                    var bullet = (bulletNode as JsonValue)?.TryGetValue<string>(out var text) == true
                        ? text.Trim()
                        : null;
                    if (string.IsNullOrEmpty(bullet) || bullet.Length > 500)
                        return null;
                    bullets.Add(bullet);
                }

            var layout = (slideNode?["layout"] as JsonValue)?.TryGetValue<string>(out var layoutText) == true
                ? layoutText.Trim().ToLowerInvariant()
                : "title-bullets";
            if (layout is not ("title" or "bullets" or "title-bullets"))
                return null;
            if (string.IsNullOrEmpty(title) && bullets.Count == 0)
                return null;

            slides.Add(new SlideSpec(title, bullets, layout));
        }

        return new SlideDeck(slides);
    }

    private sealed record SlideSpec(string Title, List<string> Bullets, string Layout);

    private sealed record SlideDeck(List<SlideSpec> Slides);

    private static P.Slide BuildSlide(SlideSpec slide)
    {
        var tree = new P.ShapeTree(
            new P.NonVisualGroupShapeProperties(
                new P.NonVisualDrawingProperties { Id = 1, Name = string.Empty },
                new P.NonVisualGroupShapeDrawingProperties(),
                new P.ApplicationNonVisualDrawingProperties()),
            new P.GroupShapeProperties(new A.TransformGroup()));
        uint shapeId = 2;
        if (slide.Layout != "bullets" && slide.Title.Length > 0)
            tree.Append(BuildTextBox(shapeId++, 457200, 274320, 8229600, 1005840, [new SlideLine(slide.Title, true, 0)], 3200));
        if (slide.Layout != "title" && slide.Bullets.Count > 0)
            tree.Append(BuildTextBox(shapeId++, 457200, 1463040, 8229600, 4926240, slide.Bullets.Select(bullet => new SlideLine(bullet, false, 1)).ToList(), 2000));
        return new P.Slide(new P.CommonSlideData(tree));
    }

    private sealed record SlideLine(string Text, bool IsTitle, int Indent);

    private static P.Shape BuildTextBox(uint id, long x, long y, long width, long height, List<SlideLine> lines, int fontSize)
    {
        var textBody = new P.TextBody(new A.BodyProperties(), new A.ListStyle());
        foreach (var line in lines)
        {
            var paragraphProperties = line.IsTitle
                ? new A.ParagraphProperties(new A.DefaultRunProperties { FontSize = fontSize, Bold = true }) { Alignment = A.TextAlignmentTypeValues.Center }
                : new A.ParagraphProperties(new A.CharacterBullet { Char = "•" }, new A.DefaultRunProperties { FontSize = fontSize }) { Indent = -228600, LeftMargin = line.Indent * 342900 };
            textBody.Append(new A.Paragraph(paragraphProperties, new A.Run(new A.RunProperties { FontSize = fontSize }, new A.Text(line.Text))));
        }
        return new P.Shape(
            new P.NonVisualShapeProperties(
                new P.NonVisualDrawingProperties { Id = id, Name = $"TextBox {id}" },
                new P.NonVisualShapeDrawingProperties(new A.ShapeLocks { NoGrouping = true }),
                new P.ApplicationNonVisualDrawingProperties()),
            new P.ShapeProperties(new A.Transform2D(new A.Offset { X = x, Y = y }, new A.Extents { Cx = width, Cy = height })),
            textBody);
    }

    private static P.SlideMaster BuildSlideMaster()
    {
        return new P.SlideMaster(
            new P.CommonSlideData(new P.ShapeTree(
                new P.NonVisualGroupShapeProperties(
                    new P.NonVisualDrawingProperties { Id = 1, Name = string.Empty },
                    new P.NonVisualGroupShapeDrawingProperties(),
                    new P.ApplicationNonVisualDrawingProperties()),
                new P.GroupShapeProperties(new A.TransformGroup()))),
            new P.ColorMap
            {
                Background1 = A.ColorSchemeIndexValues.Light1,
                Text1 = A.ColorSchemeIndexValues.Dark1,
                Background2 = A.ColorSchemeIndexValues.Light2,
                Text2 = A.ColorSchemeIndexValues.Dark2,
                Accent1 = A.ColorSchemeIndexValues.Accent1,
                Accent2 = A.ColorSchemeIndexValues.Accent2,
                Accent3 = A.ColorSchemeIndexValues.Accent3,
                Accent4 = A.ColorSchemeIndexValues.Accent4,
                Accent5 = A.ColorSchemeIndexValues.Accent5,
                Accent6 = A.ColorSchemeIndexValues.Accent6,
                Hyperlink = A.ColorSchemeIndexValues.Hyperlink,
                FollowedHyperlink = A.ColorSchemeIndexValues.FollowedHyperlink
            },
            new P.SlideLayoutIdList(new P.SlideLayoutId { Id = 2147483649, RelationshipId = "rId1" }),
            new P.TextStyles(new P.TitleStyle(), new P.BodyStyle(), new P.OtherStyle()));
    }

    private static P.SlideLayout BuildSlideLayout()
    {
        return new P.SlideLayout(
            new P.CommonSlideData(new P.ShapeTree(
                new P.NonVisualGroupShapeProperties(
                    new P.NonVisualDrawingProperties { Id = 1, Name = string.Empty },
                    new P.NonVisualGroupShapeDrawingProperties(),
                    new P.ApplicationNonVisualDrawingProperties()),
                new P.GroupShapeProperties(new A.TransformGroup()))),
            new P.ColorMapOverride(new A.MasterColorMapping()));
    }

    private static A.Theme BuildTheme()
    {
        return new A.Theme(
            new A.ThemeElements(
                new A.ColorScheme(
                    new A.Dark1Color(new A.SystemColor { Val = A.SystemColorValues.WindowText, LastColor = "000000" }),
                    new A.Light1Color(new A.SystemColor { Val = A.SystemColorValues.Window, LastColor = "FFFFFF" }),
                    new A.Dark2Color(new A.RgbColorModelHex { Val = "1F497D" }),
                    new A.Light2Color(new A.RgbColorModelHex { Val = "EEECE1" }),
                    new A.Accent1Color(new A.RgbColorModelHex { Val = "4F81BD" }),
                    new A.Accent2Color(new A.RgbColorModelHex { Val = "C0504D" }),
                    new A.Accent3Color(new A.RgbColorModelHex { Val = "9BBB59" }),
                    new A.Accent4Color(new A.RgbColorModelHex { Val = "806000" }),
                    new A.Accent5Color(new A.RgbColorModelHex { Val = "4BACC6" }),
                    new A.Accent6Color(new A.RgbColorModelHex { Val = "F79646" }),
                    new A.Hyperlink(new A.RgbColorModelHex { Val = "0000FF" }),
                    new A.FollowedHyperlinkColor(new A.RgbColorModelHex { Val = "800080" })) { Name = "Office" },
                new A.FontScheme(
                    new A.MajorFont(
                        new A.LatinFont { Typeface = "Calibri Light" },
                        new A.EastAsianFont { Typeface = "Calibri Light" },
                        new A.ComplexScriptFont { Typeface = "Calibri Light" }),
                    new A.MinorFont(
                        new A.LatinFont { Typeface = "Calibri" },
                        new A.EastAsianFont { Typeface = "Calibri" },
                        new A.ComplexScriptFont { Typeface = "Calibri" })) { Name = "Office" },
                new A.FormatScheme(
                    new A.FillStyleList(
                        new A.SolidFill(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }),
                        new A.GradientFill(new A.GradientStopList(
                            new A.GradientStop(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }) { Position = 0 },
                            new A.GradientStop(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }) { Position = 100000 })),
                        new A.GradientFill(new A.GradientStopList(
                            new A.GradientStop(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }) { Position = 0 },
                            new A.GradientStop(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }) { Position = 100000 }))),
                    new A.LineStyleList(
                        new A.Outline(),
                        new A.Outline(),
                        new A.Outline()),
                    new A.EffectStyleList(
                        new A.EffectStyle(new A.EffectList()),
                        new A.EffectStyle(new A.EffectList()),
                        new A.EffectStyle(new A.EffectList())),
                    new A.BackgroundFillStyleList(
                        new A.SolidFill(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }),
                        new A.SolidFill(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }),
                        new A.SolidFill(new A.SchemeColor { Val = A.SchemeColorValues.PhColor }))) { Name = "Office" })) { Name = "Office" };
    }

    private static byte[]? BuildDocx(string body)
    {
        var blocks = ParseMarkdownBlocks(body);
        if (blocks.Count == 0)
            return null;

        using var stream = new MemoryStream();
        using (var document = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document))
        {
            var mainPart = document.AddMainDocumentPart();
            var stylesPart = mainPart.AddNewPart<StyleDefinitionsPart>();
            stylesPart.Styles = BuildDocxStyles();
            mainPart.Document = new W.Document(new W.Body(blocks.SelectMany(BuildDocxBlock)));
        }
        return stream.ToArray();
    }

    private static List<DocBlock> ParseMarkdownBlocks(string body)
    {
        var blocks = new List<DocBlock>();
        var lines = body.Split('\n');
        var paragraph = new List<string>();
        var bullets = new List<(int Level, string Text, bool Ordered, int Number)>();
        var table = new List<List<string>>();
        var code = new List<string>();
        var isCode = false;

        void FlushParagraph()
        {
            if (paragraph.Count > 0)
            {
                blocks.Add(new DocBlock(DocBlockKind.Paragraph, string.Join("\n", paragraph), 0, 0));
                paragraph.Clear();
            }
        }

        void FlushBullets()
        {
            if (bullets.Count > 0)
            {
                foreach (var bullet in bullets)
                    blocks.Add(new DocBlock(DocBlockKind.Bullet, bullet.Text, bullet.Level, bullet.Number));
                bullets.Clear();
            }
        }

        void FlushTable()
        {
            if (table.Count > 0)
            {
                blocks.Add(new DocBlock(DocBlockKind.Table, string.Empty, 0, 0) { Rows = new List<List<string>>(table) });
                table.Clear();
            }
        }

        foreach (var rawLine in lines)
        {
            var line = rawLine.TrimEnd();
            if (line.TrimStart().StartsWith("```"))
            {
                if (isCode)
                    blocks.Add(new DocBlock(DocBlockKind.Code, string.Join("\n", code), 0, 0));
                code.Clear();
                isCode = !isCode;
                continue;
            }
            if (isCode)
            {
                code.Add(rawLine);
                continue;
            }

            var trimmed = line.Trim();
            if (trimmed.Length == 0)
            {
                FlushParagraph();
                FlushBullets();
                FlushTable();
                continue;
            }

            var heading = Regex.Match(trimmed, @"^(#{1,3})\s+(.+)$");
            if (heading.Success)
            {
                FlushParagraph();
                FlushBullets();
                FlushTable();
                blocks.Add(new DocBlock(DocBlockKind.Heading, heading.Groups[2].Value.Trim(), heading.Groups[1].Value.Length, 0));
                continue;
            }

            var bullet = Regex.Match(line, @"^(\s*)([-*])\s+(.+)$");
            var ordered = Regex.Match(line, @"^(\s*)(\d+)[.)]\s+(.+)$");
            if (bullet.Success || ordered.Success)
            {
                FlushParagraph();
                FlushTable();
                var match = bullet.Success ? bullet : ordered;
                var level = Math.Min(match.Groups[1].Value.Replace("\t", "    ").Length / 2, 8);
                var number = ordered.Success && int.TryParse(ordered.Groups[2].Value, out var parsed) ? parsed : 0;
                bullets.Add((level, match.Groups[3].Value.Trim(), ordered.Success, number));
                continue;
            }

            if (trimmed.StartsWith('|') && trimmed.EndsWith('|'))
            {
                FlushParagraph();
                FlushBullets();
                var cells = trimmed.Trim('|').Split('|').Select(cell => cell.Trim()).ToList();
                if (cells.All(cell => Regex.IsMatch(cell, @"^:?-{1,}:?$")))
                    continue;
                table.Add(cells);
                continue;
            }

            if (trimmed.StartsWith("> "))
            {
                FlushParagraph();
                FlushBullets();
                FlushTable();
                blocks.Add(new DocBlock(DocBlockKind.Quote, trimmed[2..].Trim(), 0, 0));
                continue;
            }

            if (Regex.IsMatch(trimmed, @"^(-{3,}|\*{3,})$"))
                continue;

            FlushBullets();
            FlushTable();
            paragraph.Add(trimmed);
        }

        FlushParagraph();
        FlushBullets();
        FlushTable();
        return blocks.FindAll(block => block.Kind != DocBlockKind.Paragraph || block.Text.Length > 0);
    }

    private enum DocBlockKind { Paragraph, Heading, Bullet, Table, Code, Quote }

    private sealed class DocBlock
    {
        public DocBlock(DocBlockKind kind, string text, int level, int number)
        {
            Kind = kind;
            Text = text;
            Level = level;
            Number = number;
        }

        public DocBlockKind Kind { get; }

        public string Text { get; }

        public int Level { get; }

        public int Number { get; }

        public List<List<string>>? Rows { get; set; }
    }

    private static IEnumerable<OpenXmlElement> BuildDocxBlock(DocBlock block)
    {
        if (block.Kind == DocBlockKind.Table && block.Rows is not null)
            return [BuildDocxTable(block.Rows)];
        if (block.Kind == DocBlockKind.Code)
            return [DocParagraph([new W.ParagraphProperties(new W.SpacingBetweenLines { After = "160" })], DocRuns(block.Text, true))];
        if (block.Kind == DocBlockKind.Bullet)
        {
            var prefix = block.Number > 0 ? $"{block.Number}. " : "• ";
            return [DocParagraph(
                [new W.ParagraphProperties(new W.Indentation { Left = (720 + block.Level * 360).ToString() })],
                DocRuns(prefix + block.Text, false))];
        }
        var style = block.Kind switch
        {
            DocBlockKind.Heading when block.Level == 1 => "Heading1",
            DocBlockKind.Heading => "Heading2",
            DocBlockKind.Quote => "Quote",
            _ => "Normal",
        };
        return [DocParagraph(
            [new W.ParagraphProperties(new W.ParagraphStyleId { Val = style })],
            DocRuns(block.Text, block.Kind == DocBlockKind.Code))];
    }

    private static W.Paragraph DocParagraph(IEnumerable<OpenXmlElement> properties, List<W.Run> runs)
    {
        var children = new List<OpenXmlElement>(properties);
        children.AddRange(runs);
        return new W.Paragraph(children);
    }

    private static List<W.Run> DocRuns(string text, bool isCode)
    {
        var runs = new List<W.Run>();
        var pattern = new Regex(@"(\*\*.+?\*\*|\*[^*\n]+?\*|_[^_\n]+_|`[^`\n]+?`)");
        var position = 0;
        foreach (Match match in pattern.Matches(text))
        {
            if (match.Index > position)
                runs.Add(DocTextRun(text[position..match.Index], false, false, isCode));
            var token = match.Value;
            if (token.StartsWith("**") && token.EndsWith("**"))
                runs.Add(DocTextRun(token[2..^2], true, false, isCode));
            else if (token.StartsWith('`') && token.EndsWith('`'))
                runs.Add(DocTextRun(token[1..^1], false, false, true));
            else
                runs.Add(DocTextRun(token[1..^1], false, true, isCode));
            position = match.Index + match.Length;
        }
        if (position < text.Length)
            runs.Add(DocTextRun(text[position..], false, false, isCode));
        if (runs.Count == 0)
            runs.Add(DocTextRun(string.Empty, false, false, isCode));
        return runs;
    }

    private static W.Run DocTextRun(string text, bool bold, bool italic, bool isCode)
    {
        var properties = new W.RunProperties();
        if (bold)
            properties.Append(new W.Bold());
        if (italic)
            properties.Append(new W.Italic());
        if (isCode)
            properties.Append(new W.RunFonts { Ascii = "Consolas", HighAnsi = "Consolas" }, new W.FontSize { Val = "20" });
        var run = new W.Run(properties);
        var xmlSpace = text.StartsWith(' ') || text.EndsWith(' ') ? SpaceProcessingModeValues.Preserve : SpaceProcessingModeValues.Default;
        run.Append(new W.Text(text) { Space = xmlSpace });
        return run;
    }

    private static W.Table BuildDocxTable(List<List<string>> rows)
    {
        var width = rows.Max(row => row.Count);
        var grid = new W.TableGrid();
        for (var c = 0; c < width; c++)
            grid.Append(new W.GridColumn());
        var table = new W.Table(
            new W.TableProperties(
                new W.TableBorders(
                    new W.TopBorder { Val = W.BorderValues.Single, Size = 4 },
                    new W.LeftBorder { Val = W.BorderValues.Single, Size = 4 },
                    new W.BottomBorder { Val = W.BorderValues.Single, Size = 4 },
                    new W.RightBorder { Val = W.BorderValues.Single, Size = 4 },
                    new W.InsideHorizontalBorder { Val = W.BorderValues.Single, Size = 4 },
                    new W.InsideVerticalBorder { Val = W.BorderValues.Single, Size = 4 })),
            grid);
        var isHeader = true;
        foreach (var cells in rows)
        {
            var row = new W.TableRow();
            for (var c = 0; c < width; c++)
            {
                var cell = c < cells.Count ? cells[c] : string.Empty;
                var cellRuns = DocRuns(cell, false);
                var cellChildren = new List<OpenXmlElement>();
                if (isHeader)
                    foreach (var run in cellRuns)
                        run.RunProperties?.PrependChild(new W.Bold());
                cellChildren.AddRange(cellRuns);
                var cellProperties = new W.TableCellProperties();
                if (isHeader)
                    cellProperties.Append(new W.Shading { Fill = "D9E2F3", Val = W.ShadingPatternValues.Clear });
                row.Append(new W.TableCell(cellProperties, new W.Paragraph(cellChildren)));
            }
            table.Append(row);
            isHeader = false;
        }
        return table;
    }

    private static W.Styles BuildDocxStyles()
    {
        W.StyleRunProperties RunProps(string size, bool bold, bool italic, string color)
        {
            var runProperties = new W.StyleRunProperties(new W.RunFonts { Ascii = "Calibri", HighAnsi = "Calibri" });
            if (bold)
                runProperties.Append(new W.Bold());
            if (italic)
                runProperties.Append(new W.Italic());
            if (color.Length > 0)
                runProperties.Append(new W.Color { Val = color });
            runProperties.Append(new W.FontSize { Val = size });
            return runProperties;
        }

        W.Style Style(string id, string name, string size, bool bold, string color, W.StyleParagraphProperties? paragraphProperties = null)
        {
            var style = new W.Style(new W.StyleName { Val = name }) { StyleId = id };
            if (paragraphProperties is not null)
                style.Append(paragraphProperties);
            style.Append(RunProps(size, bold, false, color));
            return style;
        }

        W.Style Based(string id, string name, string size, bool bold, string color, W.StyleParagraphProperties? paragraphProperties = null)
        {
            var style = Style(id, name, size, bold, color, paragraphProperties);
            style.InsertAfter(new W.BasedOn { Val = "Normal" }, style.GetFirstChild<W.StyleName>());
            return style;
        }

        return new W.Styles(
            Style("Normal", "Normal", "22", false, string.Empty, new W.StyleParagraphProperties(new W.SpacingBetweenLines { After = "160" })),
            Based("Heading1", "heading 1", "32", true, "1F497D"),
            Based("Heading2", "heading 2", "26", true, "1F497D"),
            Based("Heading3", "heading 3", "24", true, "1F497D"),
            Based("Quote", "Quote", "22", false, "595959", new W.StyleParagraphProperties(new W.Indentation { Left = "432" })));
    }
}

/// <summary>
/// A file a landing reply wrote, ready to store as a generated chat artifact.
/// </summary>
/// <param name="Name">File name shown to the user.</param>
/// <param name="ContentType">File media type.</param>
/// <param name="Body">File text.</param>
public sealed record GeneratedChatFile(string Name, string ContentType, string Body);

/// <summary>
/// A binary office file synthesized server-side from a spec block a landing reply wrote.
/// </summary>
/// <param name="Name">File name shown to the user.</param>
/// <param name="ContentType">File media type.</param>
/// <param name="Bytes">File bytes.</param>
public sealed record SynthesizedChatFile(string Name, string ContentType, byte[] Bytes);
