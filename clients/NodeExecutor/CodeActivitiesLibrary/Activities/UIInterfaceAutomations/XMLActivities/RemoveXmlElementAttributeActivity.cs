using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.XmlActivities
{
    // Activity: Remove XML Element Attribute
    [DisplayName("Remove XML Element Attribute")]
    [Description("Removes an attribute from an XML element.")]
    [ActivityMetaData(nodeImg: "/assets/XML.svg")]
    public class RemoveXmlElementAttributeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("XML Content")]
        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [DisplayName("XPath Expression")]
        [Description("The XPath expression to locate the element.")]
        public InArgument<string> XPath { get; set; }

        [RequiredArgument]
        [DisplayName("Attribute Name")]
        [Description("The name of the attribute to remove.")]
        public InArgument<string> AttributeName { get; set; }

        [DisplayName("Updated XML Content")]
        [Description("Returns the updated XML content.")]
        public OutArgument<string> UpdatedXmlContent { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                var xmlContent = XmlContent.Get(context);
                var xpath = XPath.Get(context);
                var attributeName = AttributeName.Get(context);

                // Validate inputs
                if (string.IsNullOrEmpty(xmlContent))
                    throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath))
                    throw new ArgumentException("XPath cannot be null or empty.");

                if (string.IsNullOrEmpty(attributeName))
                    throw new ArgumentException("Attribute name cannot be null or empty.");

                // Load XML into XmlDocument
                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                // Locate the element using XPath
                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null)
                    throw new ArgumentException($"No element found at XPath: {xpath}");

                // Remove the attribute
                var attr = node.Attributes?[attributeName];
                if (attr != null)
                {
                    node.Attributes?.Remove(attr);
                }
                else
                {
                    StatusMessage.Set(context, $"Attribute '{attributeName}' not found on the element.");
                }

                // Return the updated XML content
                var updatedXmlContent = xmlDoc.OuterXml;
                UpdatedXmlContent.Set(context, updatedXmlContent);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Attribute removed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error removing XML element attribute: {ex.Message}");
            }
        }
    }
}