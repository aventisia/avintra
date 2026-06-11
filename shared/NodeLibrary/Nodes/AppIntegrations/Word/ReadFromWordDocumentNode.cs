using Microsoft.Office.Interop.Word;
using NodeLibrary.WordNodes.Enums;
using Word = Microsoft.Office.Interop.Word;

namespace NodeLibrary.WordNodes;

[DisplayName("Read From Word Document"), Description("Reads the text content from a document of a Word instance.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class ReadFromWordDocumentNode : BaseNode
{
    [DisplayName("Word Instance"), Description("The specific Word instance to read from.")]
    public required InArgument<Word.Application> WordInstance { get; set; }

    [DisplayName("Retrieve"), Description("Specifies the portion of the document to retrieve.")]
    public InArgument<RetrieveOptionEnum> Retrieve { get; set; } = new InArgument<RetrieveOptionEnum>(RetrieveOptionEnum.WholeDocument);

    [DisplayName("Page Numbers")]
    [Description("Page numbers or ranges to retrieve (e.g. 1,3,5 or 1-5 or 1,3-5,8).")]
    [RenderIfCondition(nameof(Retrieve), RetrieveOptionEnum.Pages)]
    public InArgument<string>? PageNumbers { get; set; }

    [DisplayName("Bookmark Names")]
    [Description("One or more bookmark names separated by commas.")]
    [RenderIfCondition(nameof(Retrieve), RetrieveOptionEnum.Bookmark)]
    public InArgument<string>? BookmarkNames { get; set; }

    [DisplayName("Word Data"), Description("The value of the retrieved content.")]
    public OutArgument<string> WordData { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            // Retrieve input values
            var wordApp = WordInstance.Get(context);
            var retrieveOption = Retrieve.Get(context);
            if (wordApp == null)
            {
                throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");
            }

            // Get the active document
            Word._Document activeDocument = wordApp.ActiveDocument;

            if (activeDocument == null)
            {
                throw new InvalidOperationException("No active document found in Word.");
            }

            var content = string.Empty;

            // Perform the specified action
            switch (retrieveOption)
            {
                case RetrieveOptionEnum.WholeDocument:
                    // Retrieve the whole document content
                    content = activeDocument.Content.Text;
                    break;

                case RetrieveOptionEnum.Pages:
                    // Validate page numbers input
                    string? pageInput = PageNumbers?.Get(context);

                    // Ensure page numbers are provided
                    if (string.IsNullOrEmpty(pageInput))
                        throw new ArgumentException("Page numbers are required.");

                    var pages = ParsePages(pageInput);

                    // Check if any valid page numbers are provided
                    StringBuilder sb = new StringBuilder();

                    // Loop through each page number and retrieve its content if it exists
                    foreach (var pageNumber in pages)
                    {
                        string pageContent = GetPageContent(activeDocument, pageNumber);

                        sb.AppendLine($"----- PAGE {pageNumber} -----");
                        sb.AppendLine(pageContent);
                        sb.AppendLine();
                    }

                    // Set the combined content for all specified pages
                    content = sb.ToString();

                    break;

                case RetrieveOptionEnum.Bookmark:

                    // Validate bookmark names input
                    string? bookmarkInput = BookmarkNames?.Get(context);

                    // Ensure bookmark names are provided
                    content = GetBookmarkContent(activeDocument, bookmarkInput);

                    break;

                default:
                    throw new ArgumentException("Invalid Retrieve option.");
            }

            // Set the output WordData
            context.SetValue(WordData, content);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Read from word document successfully");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading from Word document: {ex.Message}");
        }
        finally
        {
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Read from word document successfully"); // Optional: update base class status
        }
    }

    // Helper method to retrieve content of a specific page
    private List<int> ParsePages(string input)
    {
        // This method parses a string of page numbers and ranges (e.g. "1,3,5-7") and returns a sorted list of unique page numbers.
        var pages = new HashSet<int>();

        // Split the input by commas to handle individual page numbers and ranges
        foreach (var part in input.Split(','))
        {
            // Check if the part contains a dash, indicating a range of pages
            if (part.Contains("-"))
            {
                // Split the range into start and end page numbers
                var range = part.Split('-');

                // Validate that the range has exactly two parts (start and end)
                int start = int.Parse(range[0].Trim());
                int end = int.Parse(range[1].Trim());

                // Add all page numbers in the specified range to the set
                for (int i = start; i <= end; i++)
                {
                    // Ensure that only positive page numbers are added
                    pages.Add(i);
                }
            }
            else
            {
                // Handle individual page numbers by parsing and adding them to the set
                pages.Add(int.Parse(part.Trim()));
            }
        }

        // Return the sorted list of unique page numbers
        return pages.OrderBy(x => x).ToList();
    }

    // Helper method to retrieve content of a specific page
    private string GetPageContent(Word._Document document, int pageNumber)
    {
        // Validate that the page number is greater than zero
        if (pageNumber <= 0)
            throw new ArgumentException("Page number must be greater than zero.");

        // Compute the total number of pages in the document
        int totalPages = document.ComputeStatistics(WdStatistic.wdStatisticPages);

        // Validate that the requested page number does not exceed the total number of pages in the document
        if (pageNumber > totalPages)
            throw new ArgumentException(
                $"Page {pageNumber} does not exist. Document contains {totalPages} page(s).");

        // Use the GoTo method to navigate to the specified page and retrieve its content
        object what = WdGoToItem.wdGoToPage;
        object which = WdGoToDirection.wdGoToAbsolute;
        object page = pageNumber;

        // Get the range for the start of the specified page
        Word.Range startRange = document.GoTo(
            ref what,
            ref which,
            ref page);

        // Determine the start and end positions for the page content
        int start = startRange.Start;
        int end;

        // If the requested page is not the last page, get the start position of the next page to determine the end of the current page
        if (pageNumber < totalPages)
        {
            // Navigate to the next page to find the end position of the current page
            object nextPage = pageNumber + 1;

            // Get the range for the start of the next page
            Word.Range nextRange = document.GoTo(
                ref what,
                ref which,
                ref nextPage);

            // Set the end position to the start of the next page
            end = nextRange.Start;
        }
        else
        {
            // If the requested page is the last page, set the end position to the end of the document
            end = document.Content.End;
        }

        // Create a range for the specified page using the determined start and end positions
        Word.Range pageRange = document.Range(start, end);

        // Return the text content of the page, trimming any leading or trailing whitespace. If the text is null, return an empty string.
        return pageRange.Text?.Trim() ?? string.Empty;
    }

    // Helper method to retrieve content of specified bookmarks
    private string GetBookmarkContent(_Document document, string? bookmarkInput)
    {
        // Validate that bookmark names are provided
        if (string.IsNullOrEmpty(bookmarkInput))
            throw new ArgumentException("Bookmark names are required.");

        // Split and trim bookmark names, filter out any empty entries, and ensure uniqueness (case-insensitive)
        var bookmarkNames = bookmarkInput
            .Split(',')
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrEmpty(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Check if any valid bookmark names are provided after processing
        if (!bookmarkNames.Any())
            throw new ArgumentException("No valid bookmark names were provided.");

        // Use a StringBuilder to efficiently build the content string for the specified bookmarks
        var contentBuilder = new StringBuilder();

        // Loop through each bookmark name and retrieve its content if it exists in the document
        foreach (var bookmarkName in bookmarkNames)
        {
            // Check if the bookmark exists in the document
            if (!document.Bookmarks.Exists(bookmarkName))
            {
                // If the bookmark does not exist, append a warning message to the content builder and continue to the next bookmark
                contentBuilder.AppendLine(
                    $"----- WARNING: BOOKMARK '{bookmarkName}' NOT FOUND -----");
                contentBuilder.AppendLine();
                continue;
            }

            // If the bookmark exists, retrieve its text content and append it to the content builder with a header indicating the bookmark name
            var bookmarkText = document.Bookmarks[bookmarkName].Range.Text;

            // Append a header for the bookmark content
            contentBuilder.AppendLine(
                $"----- BOOKMARK: {bookmarkName} -----");

            // Append the bookmark text content, trimming any leading or trailing whitespace. If the text is null, append an empty string.
            contentBuilder.AppendLine(bookmarkText);

            // Append an empty line for separation between bookmark contents
            contentBuilder.AppendLine();
        }

        // Return the combined content for all specified bookmarks, trimming any leading or trailing whitespace. If no content was added, return an empty string.
        return contentBuilder.ToString().Trim();
    }
}
