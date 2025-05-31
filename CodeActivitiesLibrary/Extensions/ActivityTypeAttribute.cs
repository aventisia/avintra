using System;

namespace CodeActivitiesLibrary.Extensions
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class NodeTypeAttribute : Attribute
    {
        public string NodeType { get; }
        public NodeTypeAttribute(string nodeType) 
        {
            NodeType = nodeType;
        }
    }
}
