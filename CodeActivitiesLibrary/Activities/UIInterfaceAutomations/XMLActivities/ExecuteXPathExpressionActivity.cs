using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    [DisplayName("Execute XPath Expression")]
    [Description("Executes an XPath expression on the provided XML content and returns the result.")]
    public class ExecuteXPathExpressionActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The XML content to query with XPath.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The XPath expression to execute.")]
        public InArgument<string> XPathExpression { get; set; }

        [Category("Output")]
        [Description("Returns the value of the first matching node or null if not found.")]
        public OutArgument<string> ResultValue { get; set; }

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var xml = XmlContent.Get(context);
            var xpath = XPathExpression.Get(context);
            string result = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xml))
                {
                    throw new ArgumentException("XML content cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(xpath))
                {
                    throw new ArgumentException("XPath expression cannot be null or empty.");
                }

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xml);

                var nav = xmlDoc.CreateNavigator();
                var expr = nav.Compile(xpath);
                var iterator = nav.Select(expr);

                if (iterator.MoveNext())
                {
                    result = iterator.Current.Value;
                }
                else
                {
                    result = null;
                    status = "No nodes matched the XPath expression.";
                }

                StatusMessage.Set(context, "XPath executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error executing XPath: {ex.Message}";
            }

            ResultValue.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}