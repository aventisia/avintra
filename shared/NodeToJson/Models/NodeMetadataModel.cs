namespace NodeToJson.Models;

internal class NodeMetadataModel
{
    public required string Type { get; set; }
    public required string Name { get; set; }
    public required string Label { get; set; }
    public required string Description { get; set; }
    // TODO: Keep only Icon instead of Icon and Img once migration from NodeExecutor to RunnerApp is complete
    public string? Icon { get; set; }
    public string? Img { get; set; }
    public string? DocsLink { get; set; }
    public List<string>? SupportedPlatforms { get; set; }
    public List<string>? DoNotRenderIf { get; set; }
    public string? Badge { get; set; }
}

// ["name"] = nodeType.Name,
//             ["label"] = nodeDisplayNameAttr.DisplayName,
//             ["description"] = nodeDescriptionAttr.Description,
//             ["version"] = nodeMetaDataAttr.Version,
//             ["author"] = nodeMetaDataAttr.Author,
//             ["supportedPlatforms"] = supportedPlatforms,
//             ["errorHandling"] = nodeMetaDataAttr.ErrorHandling,
//             ["testScreenType"] = nodeMetaDataAttr.TestScreenType

// var field = new Dictionary<string, object>
//             {
//                 ["direction"] = direction,
//                 ["type"] = "text",
//                 ["name"] = prop.Name,
//                 ["label"] = displayName,
//                 ["description"] = description,
//                 ["placeholder"] = "",
//                 ["defaultValue"] = "",
//                 ["required"] = isRequired
//             };

// field["selectOptions"] = GetEnumOptions(genericType);

// field["renderIf"] = new { conditions };


// type: CustomNodeType;
//   category?: string;
//   name: string;
//   label: string;
//   description: string;
//   docsLink?: string;
//   icon?: string;
//   img?: string;
//   supportedPlatforms?: string[];
//   fieldValues?: { [key: string]: any };
//   inputs?: NodeInputType[];
//   outputs?: NodeOutputType[];
//   disabled?: boolean;
//   hidden?: boolean;
//   doNotRenderIf?: DoNotRenderIfType;
//   formType?: "custom" | "dynamic";
//   isGroupHead?: boolean;
//   groupId?: string;
//   isExpanded?: boolean;
//   count?: number;
//   color?: string;
//   isBlock?: boolean;
//   isDisabled?: boolean;
//   isCut?: boolean;
//   clipboardGroupId?:string
//   clipboardGroupHead?:boolean