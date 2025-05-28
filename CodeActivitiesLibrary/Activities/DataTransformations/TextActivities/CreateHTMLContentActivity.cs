using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Create HTML Content")]
    [Description("Generates rich HTML content and stores it in a variable.")]
    public class CreateHtmlContentActivity : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var title = Title.Get(context);
                var bodyContent = BodyContent.Get(context);

                if (string.IsNullOrWhiteSpace(title))
                    throw new ArgumentException("Title cannot be empty.");

                if (string.IsNullOrWhiteSpace(bodyContent))
                    throw new ArgumentException("BodyContent cannot be empty.");

                var htmlContent = $@"
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>{title}</title>
                    </head>
                    <body>
                        {bodyContent}
                    </body>
                </html>";

                ResultHtml.Set(context, htmlContent);
                StatusMessage.Set(context, "HTML content generated successfully.");
            }
            catch (Exception ex)
            {
                ResultHtml.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }

        #region Arguments

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Title")]
        [Description("The title of the HTML document.")]
        public InArgument<string> Title { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Body Content")]
        [Description("The body content of the HTML document.")]
        public InArgument<string> BodyContent { get; set; }

        [Category("Output")]
        [DisplayName("Result HTML")]
        [Description("The generated HTML content.")]
        public OutArgument<string> ResultHtml { get; set; }

        [Category("Output")]
        [Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion
    }
}