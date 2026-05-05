using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Remove XML Element"), Description("Removes one or more XML elements from an XML document.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class RemoveXmlElementNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content as a string.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to locate the element(s) to remove.")]
    public required InArgument<string> XPath { get; set; }

    [DisplayName("Updated XML Content"), Description("Returns the updated XML content.")]
    public OutArgument<string> UpdatedXmlContent { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Element(s) removed successfully.";

        try
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);

            if (string.IsNullOrEmpty(xmlContent))
                throw new ArgumentException("XML content cannot be null or empty.");

            if (string.IsNullOrEmpty(xpath))
                throw new ArgumentException("XPath cannot be null or empty.");

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xmlContent);

            var nodesToRemove = xmlDoc.SelectNodes(xpath);
            if (nodesToRemove == null || nodesToRemove.Count == 0)
                throw new ArgumentException($"No elements found at XPath: {xpath}");

            foreach (XmlNode node in nodesToRemove)
                node.ParentNode?.RemoveChild(node);

            UpdatedXmlContent.Set(context, xmlDoc.OuterXml);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error removing XML element(s): {ex.Message}");
        }
    }
}
