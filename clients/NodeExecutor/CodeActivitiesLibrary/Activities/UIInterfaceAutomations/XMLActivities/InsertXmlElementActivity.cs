using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.XmlActivities
{
    [DisplayName("Insert XML Element")]
    [Description("Inserts a new XML element into an existing XML document.")]
    [ActivityMetaData(nodeImg: "/assets/XML.svg")]
    public class InsertXmlElementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("XML Content")]
        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [DisplayName("XPath Expression")]
        [Description("The XPath expression to locate the insertion point.")]
        public InArgument<string> XPath { get; set; }

        [RequiredArgument]
        [DisplayName("XML Element To Insert")]
        [Description("The XML content of the element to insert.")]
        public InArgument<string> XmlElementToInsert { get; set; }

        [DisplayName("Updated XML Content")]
        [Description("Returns the updated XML content after inserting the new element.")]
        public OutArgument<string> UpdatedXmlContent { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var xmlElementToInsert = XmlElementToInsert.Get(context);
            string updatedXmlContent = null;

            try
            {
                if (string.IsNullOrEmpty(xmlContent))
                    throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath))
                    throw new ArgumentException("XPath cannot be null or empty.");

                if (string.IsNullOrEmpty(xmlElementToInsert))
                    throw new ArgumentException("XML element to insert cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var targetNode = xmlDoc.SelectSingleNode(xpath);
                if (targetNode == null)
                    throw new ArgumentException($"No node found at XPath: {xpath}");

                var newElementDoc = new XmlDocument();
                newElementDoc.LoadXml(xmlElementToInsert);
                var newElement = newElementDoc.DocumentElement;

                // ✅ Import node into the main document
                var importedNode = xmlDoc.ImportNode(newElement, true);

                // Now append the imported node
                targetNode.AppendChild(importedNode);

                updatedXmlContent = xmlDoc.OuterXml;
                UpdatedXmlContent.Set(context, updatedXmlContent);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "XML element inserted successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting XML element: {ex.Message}");
            }
        }
    }
}