using NodeLibrary.Office;

namespace NodeLibrary.WordNodes;

[DisplayName("Find And Replace Words In Word Document"), Description("Finds text and replaces it with another in the active document of a Word instance.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class FindAndReplaceWordsInWordDocumentNode : BaseNode
{
    [DisplayName("Word Instance"), Description("The specific Word instance to use.")]
    public required InArgument<object> WordInstance { get; set; }

    [DisplayName("All Matches"), Description("Specifies whether to replace all occurrences or just the first one.")]
    public InArgument<bool> AllMatches { get; set; } = new InArgument<bool>(false);

    [DisplayName("Text to Find"), Description("The text to search for in the document.")]
    public required InArgument<string> TextToFind { get; set; }

    [DisplayName("Text to Replace With"), Description("The text to replace the found text with.")]
    public required InArgument<string> TextToReplaceWith { get; set; }

    [DisplayName("Use Wildcards"), Description("Specifies whether to use wildcard patterns for the search.")]
    public InArgument<bool> UseWildcards { get; set; } = new InArgument<bool>(false);

    [DisplayName("Match Case"), Description("Specifies whether the search should be case-sensitive.")]
    [RenderIfCondition(nameof(UseWildcards), true)]
    public InArgument<bool> MatchCase { get; set; } = new InArgument<bool>(true);

    [DisplayName("Match Whole Words Only"), Description("Specifies whether to match whole words only.")]
    [RenderIfCondition(nameof(UseWildcards), true)]
    public InArgument<bool> MatchWholeWordsOnly { get; set; } = new InArgument<bool>(true);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var wordAppArg = WordInstance.Get(context);
            var allMatches = AllMatches.Get(context);
            var textToFind = TextToFind.Get(context);
            var textToReplaceWith = TextToReplaceWith.Get(context);
            var useWildcards = UseWildcards.Get(context);
            var matchCase = MatchCase.Get(context);
            var matchWholeWordsOnly = MatchWholeWordsOnly.Get(context);

            if (wordAppArg == null)
                throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");

            dynamic wordApp = wordAppArg;

            if (wordApp.Documents.Count == 0)
                throw new InvalidOperationException("No active Word document found.");

            dynamic activeDocument = wordApp.ActiveDocument;

            dynamic findObject = activeDocument.Content.Find;
            findObject.ClearFormatting();
            findObject.Text = textToFind;
            findObject.Replacement.Text = textToReplaceWith;
            findObject.Forward = true;
            findObject.Wrap = OfficeConstants.WdFindContinue;
            findObject.MatchCase = matchCase;
            findObject.MatchWholeWord = matchWholeWordsOnly;
            findObject.MatchWildcards = useWildcards;

            if (allMatches)
            {
                findObject.Execute(
                    Replace: OfficeConstants.WdReplaceAll,
                    Format: false,
                    Wrap: OfficeConstants.WdFindContinue);
            }
            else
            {
                findObject.Execute(
                    Replace: OfficeConstants.WdReplaceOne,
                    Format: false,
                    Wrap: OfficeConstants.WdFindContinue);
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text replaced successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error performing find and replace: {ex.Message}");
        }
    }
}
