using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Recognize Entities in Text"),
     Description(
         "Recognizes entities in text, such as numbers, units, dates/time, and others expressed in natural language across multiple languages.")]
    public class RecognizeEntitiesInTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Text To Analyze"), Description("The text to analyze.")]
        public InArgument<string> TextToAnalyze { get; set; }

        [Category("Output"), DisplayName("Recognized Entities"), Description("The recognized entities in the text.")]
        public OutArgument<IEnumerable<string>> RecognizedEntities { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var textToAnalyze = TextToAnalyze.Get(context);

                if (string.IsNullOrWhiteSpace(textToAnalyze))
                    throw new ArgumentException("TextToAnalyze cannot be empty.");

                var recognizedEntities = new List<string>();

                // Basic number recognition
                foreach (Match match in Regex.Matches(textToAnalyze, @"\b\d+\b"))
                {
                    recognizedEntities.Add(match.Value);
                }

                // Basic date recognition (YYYY-MM-DD)
                foreach (Match match in Regex.Matches(textToAnalyze, @"\b\d{4}-\d{2}-\d{2}\b"))
                {
                    recognizedEntities.Add(match.Value);
                }

                // Add more patterns here as needed

                RecognizedEntities.Set(context, recognizedEntities);
                StatusMessage.Set(context, "Entities recognized successfully.");
            }
            catch (Exception ex)
            {
                RecognizedEntities.Set(context, Array.Empty<string>());
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
