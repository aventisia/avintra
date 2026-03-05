using System.Collections.Generic;

namespace CodeActivityToJSON.Models
{
    internal class NodeAction
    {
        public string Type { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public string DocsLink { get; set; }
        public string Icon { get; set; }
        public string Img { get; set; }
        public List<string> SupportedPlatforms { get; set; }
        public List<string> DoNotRenderIf { get; set; }
    }
}
