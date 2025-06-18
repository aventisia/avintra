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
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var attributeName = AttributeName.Get(context);
            string updatedXmlContent = null;

            try
            {
                if (string.IsNullOrEmpty(xmlContent))
                    throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath)) throw new ArgumentException("XPath cannot be null or empty.");

                if (string.IsNullOrEmpty(attributeName))
                    throw new ArgumentException("Attribute name cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null) throw new ArgumentException($"No element found at XPath: {xpath}");

                var attr = node.Attributes?[attributeName];
                if (attr != null) node.Attributes?.Remove(attr);

                updatedXmlContent = xmlDoc.OuterXml;
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