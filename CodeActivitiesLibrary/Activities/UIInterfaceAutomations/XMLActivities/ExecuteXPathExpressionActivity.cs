using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.XmlActivities
{
    [DisplayName("Execute XPath Expression")]
    [Description("Executes an XPath expression on the provided XML content and returns the result.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/XML.svg")]
    public class ExecuteXPathExpressionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("XML Content")]
        [Description("The XML content to query with XPath.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [DisplayName("XPath Expression")]
        [Description("The XPath expression to execute.")]
        public InArgument<string> XPathExpression { get; set; }


        [DisplayName("Get First Value Only")]
        [Description("If true, only the first matching node will be returned. If false, all matching nodes will be returned as a list.")]
        [DefaultValue(false)]
        public InArgument<bool> GetFirstValueOnly { get; set; }

        [DisplayName("XPath Result")]
        [Description("Returns the value of the first matching node or null if not found.")]
        public OutArgument<string> XPathResult { get; set; }

        [DisplayName("XPath Results")]
        [Description("Returns all matching nodes as a list of strings.")]
        public OutArgument<List<string>> XPathResults { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var xml = XmlContent.Get(context);
            var xpath = XPathExpression.Get(context);
            var getFirstValueOnly = GetFirstValueOnly.Get(context);

            string result = null;
            List<string> results = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xml)) throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath))
                    throw new ArgumentException("XPath expression cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xml);

                var nav = xmlDoc.CreateNavigator();
                var expr = nav.Compile(xpath);
                var iterator = nav.Select(expr);

                if (getFirstValueOnly)
                {
                    // Get only the first matching node
                    if (iterator.MoveNext())
                    {
                        result = iterator.Current.Value;
                    }
                    else
                    {
                        result = null;
                        status = "No nodes matched the XPath expression.";
                    }
                }
                else
                {
                    // Get all matching nodes
                    var nodeList = new List<string>();
                    while (iterator.MoveNext()) nodeList.Add(iterator.Current.Value);

                    if (nodeList.Count == 0)
                    {
                        results = new List<string>();
                        status = "No nodes matched the XPath expression.";
                    }
                    else
                    {
                        results = nodeList;
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "XPath executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error executing XPath: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

            // Set outputs based on GetFirstValueOnly
            if (getFirstValueOnly)
            {
                XPathResult.Set(context, result);
                XPathResults.Set(context, null); // No need to set XPathResults when GetFirstValueOnly is true
            }
            else
            {
                XPathResult.Set(context, null); // No need to set XPathResult when GetFirstValueOnly is false
                XPathResults.Set(context, results);
            }

            StatusMessage.Set(context, status);
        }
    }
}