namespace NodeLibrary.TextNodes;

[DisplayName("Create HTML Content"), Description("Generates rich HTML content and stores it in a variable.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class CreateHtmlContentNode : BaseNode
{
    [DisplayName("Title"), Description("The title of the HTML document.")]
    public required InArgument<string> Title { get; set; }

    [DisplayName("Body Content"), Description("The body content of the HTML document.")]
    public required InArgument<string> BodyContent { get; set; }

    [DisplayName("Result HTML"), Description("The generated HTML content.")]
    public OutArgument<string> ResultHtml { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
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
