using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.Activities.Statements;
using System.ComponentModel;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Find and Replace Words in Word Document")]
    [Description("Finds text and replaces it with another in the active document of a Word instance.")]
    public class FindAndReplaceWordsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to use.")]
        public InArgument<Word.Application> WordInstance { get; set; }

        [DisplayName("All Matches")]
        [Description("Specifies whether to replace all occurrences or just the first one.")]
        [DefaultValue(false)]
        public InArgument<bool> AllMatches { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Find")]
        [Description("The text to search for in the document.")]

        public InArgument<string> TextToFind { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Replace With")]
        [Description("The text to replace the found text with.")]

        public InArgument<string> TextToReplaceWith { get; set; }

        [DisplayName("Use Wildcards")]
        [Description("Specifies whether to use wildcard patterns for the search.")]
        [DefaultValue(false)]
        public InArgument<bool> UseWildcards { get; set; }

        [DisplayName("Match Case")]
        [Description("Specifies whether the search should be case-sensitive.")]
        [DefaultValue(true)]
        [RenderIfCondition(nameof(UseWildcards), true)]
        public InArgument<bool> MatchCase { get; set; }

        [DisplayName("Match Whole Words Only")]
        [Description("Specifies whether to match whole words only.")]
        [DefaultValue(true)]
        [RenderIfCondition(nameof(UseWildcards), true)]
        public InArgument<bool> MatchWholeWordsOnly { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var allMatches = context.GetValue(AllMatches);
                var textToFind = context.GetValue(TextToFind);
                var textToReplaceWith = context.GetValue(TextToReplaceWith);
                var useWildcards = context.GetValue(UseWildcards);
                var matchCase = context.GetValue(MatchCase);
                var matchWholeWordsOnly = context.GetValue(MatchWholeWordsOnly);

                // Ensure Word is open and has at least one document
                if (wordApp == null || wordApp.Documents.Count == 0)
                {
                    throw new InvalidOperationException("No active Word document found.");
                }

                // Get the active document
                _Document activeDocument = wordApp.ActiveDocument;

                // Prepare the Find object
                var findObject = activeDocument.Content.Find;

                // Configure find options
                findObject.ClearFormatting();
                findObject.Text = textToFind;
                findObject.Replacement.Text = textToReplaceWith;
                findObject.Forward = true;
                findObject.Wrap = WdFindWrap.wdFindContinue;
                findObject.MatchCase = matchCase;
                findObject.MatchWholeWord = matchWholeWordsOnly;
                findObject.MatchWildcards = useWildcards;

                // Perform the find-and-replace operation
                if (allMatches)
                {
                    // Replace all occurrences
                    findObject.Execute(
                    Replace: WdReplace.wdReplaceAll,
                    Format: false,
                    Wrap: WdFindWrap.wdFindContinue);
                }
                else
                {
                    // Replace the first occurrence
                    findObject.Execute(
                    Replace: WdReplace.wdReplaceOne,
                    Format: false,
                    Wrap: WdFindWrap.wdFindContinue);
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
}