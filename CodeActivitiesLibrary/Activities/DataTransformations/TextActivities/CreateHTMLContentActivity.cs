using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Create HTML Content")]
    [Description("Generates rich HTML content and stores it in a variable.")]
    [ActivityMetaData(nodeImg: "/assets/Text.svg")]
    public class CreateHtmlContentActivity : BaseCodeActivity
    {
        #region Arguments

        [RequiredArgument]
        [DisplayName("Title")]
        [Description("The title of the HTML document.")]
        public InArgument<string> Title { get; set; }

        [RequiredArgument]
        [DisplayName("Body Content")]
        [Description("The body content of the HTML document.")]
        public InArgument<string> BodyContent { get; set; }


        [DisplayName("Result HTML")]
        [Description("The generated HTML content.")]
        public OutArgument<string> ResultHtml { get; set; }

        #endregion

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
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "HTML content generated successfully.");
            }
            catch (Exception ex)
            {
                ResultHtml.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error generating HTML content: {ex.Message}");
            }
        }
    }
}