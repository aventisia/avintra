using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Insert XML Element"), Description("Inserts a new XML element into an existing XML document.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class InsertXmlElementNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content as a string.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to locate the insertion point.")]
    public required InArgument<string> XPath { get; set; }

    [DisplayName("XML Element To Insert"), Description("The XML content of the element to insert.")]
    public required InArgument<string> XmlElementToInsert { get; set; }

    [DisplayName("Updated XML Content"), Description("Returns the updated XML content after inserting the new element.")]
    public OutArgument<string> UpdatedXmlContent { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "XML element inserted successfully.";

        try
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var xmlElementToInsert = XmlElementToInsert.Get(context);

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

            var importedNode = xmlDoc.ImportNode(newElement!, true);
            targetNode.AppendChild(importedNode);

            UpdatedXmlContent.Set(context, xmlDoc.OuterXml);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error inserting XML element: {ex.Message}");
        }
    }
}
