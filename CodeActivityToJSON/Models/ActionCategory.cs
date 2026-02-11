using System.Collections.Generic;

namespace CodeActivityToJSON.Models
{
    internal class ActionCategory
    {
        public string Label { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Img { get; set; }
        public string ListType { get; set; }
        public List<string> DoNotRenderIf { get; set; }
        public List<NodeAction> Actions { get; set; }
    }
}
