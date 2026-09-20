namespace WorkspaceAPIs.Features.FlowVersion.Utils;

public static class InitialNodesAndEdgesUtil
{
    /// <summary>
    /// Retrieves the initial nodes for the specified flow type.
    /// </summary>
    /// <param name="flowType">The type of flow being initialized.</param>
    /// <returns>A serialized JSON string representing the initial nodes.</returns>
    public static string GetInitialNodesAndEdges(FlowTypesEnum flowType)
    {
        try
        {
            return flowType == FlowTypesEnum.ChatAgent
                ? GetInitialChatAgentNodesAndEdges()
                : GetInitialAgentNodesAndEdges();
        }
        catch
        {
            return "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";
        }
    }

    private static string GetInitialAgentNodesAndEdges()
    {
        // Create ids of trigger and plus node
        var triggerNodeId = Guid.NewGuid();
        var plusNodeId = Guid.NewGuid();

        var initialNodesList = new List<object>
        {
            // Manual trigger node
            new
            {
                Id = triggerNodeId,
                Type = "triggerNode",
                Data = new
                {
                    Type = "triggerNode",
                    Category = "Triggers",
                    Name = "manualTrigger",
                    Label = "Manual trigger",
                    Description = "Start your flow clicking the execute button",
                    Icon = "ManualTriggerIcon",
                },
                Position = new { X = 0, Y = 0 },
                SourcePosition = "bottom",
                Deletable = false,
                DragHandle = ".custom-drag-handle",
            },

            // Plus node without source position
            new
            {
                Id = plusNodeId,
                Type = "plusFirstNode",
                Position = new { X = 0, Y = 150 },
                Deletable = false,
                Draggable = true,
            },
        };

        var initialEdgesList = new List<object>
        {
            new
            {
                Id = Guid.NewGuid(),
                Type = "customStepEdge",
                Source = triggerNodeId,
                Target = plusNodeId,
                Deletable = false,
                Selectable = false,
                Style = new
                {
                    StrokeDasharray = "5,5",
                    StrokeWidth = 1.5
                }
            },
        };

        return SerializeReactFlowObject(initialNodesList, initialEdgesList);
    }

    private static string GetInitialChatAgentNodesAndEdges()
    {
        var chatNodeId = Guid.NewGuid();
        var modelNodeId = Guid.NewGuid();

        var chatInputs = new[]
        {
            new { Key = "__Prompt__Conversation", Value = (object?)"" },
            new
            {
                Key = "__ModelConfig__Conversation",
                Value = (object?)new
                {
                    is_byok_enabled = false,
                    provider = "openai",
                    credential_name = "",
                    model = "gpt-4o-mini",
                    temperature = 1,
                    top_p = 1,
                    max_output_tokens = (int?)null
                }
            },
            new { Key = "Files", Value = (object?)"" },
            new
            {
                Key = "__KbConfig__Conversation",
                Value = (object?)new
                {
                    knowledgeBase = Array.Empty<object>(),
                    sourceThreshold = 0.1,
                    numberOfChunks = 5
                }
            },
            new
            {
                Key = "__SkillsConfig__Conversation",
                Value = (object?)new { skills = Array.Empty<object>() }
            },
            new
            {
                Key = "__MemoryConfig__Conversation",
                Value = (object?)new
                {
                    memoryProvider = "Memory Provider 1",
                    maxDataStored = 20
                }
            },
            new { Key = "__ToolsConfig__Conversation", Value = (object?)Array.Empty<object>() },
            new
            {
                Key = "__RecommendedActionsConfig__Conversation",
                Value = (object?)new
                {
                    defaultActions = Array.Empty<object>(),
                    enableDynamicActions = false,
                    followUpMessagePrompt = "You are a helpful AI assistant.\n\nReturn only valid JSON that matches the provided schema.\n\nRules:\n- Put the complete response in the \"text\" field.\n- Any question, clarification request, or information request for the user must appear only in the \"text\" field.\n- The \"followup_messages\" field is only for standalone actions the user can take without replying to the assistant.\n- Never include questions, follow-ups, or prompts in \"followup_messages\".\n- If the user must provide additional information to continue, \"followup_messages\" must be an empty array ([]).\n- Include at most 5 recommended actions.\n- Recommended actions should use clear, natural, user-facing language.\n- Do not include code, IDs, internal references, or technical jargon in recommended actions.\n- Return only JSON with no additional text or markdown."
                }
            },
            new { Key = "__OnError__EnableAutoRetry", Value = (object?)false },
            new { Key = "__OnError__FallbackBehavior", Value = (object?)"abort" }
        };

        var initialNodesList = new object[]
        {
            new
            {
                Id = chatNodeId,
                Type = "aiNode",
                DragHandle = ".custom-drag-handle",
                Data = new
                {
                    Type = "aiNode",
                    Name = "CreateConversationAIAgent",
                    Label = "Chat AI",
                    Description = "Manages multi-turn interactions with human-like understanding and memory to guide users through complex tasks.",
                    DocsLink = (string?)null,
                    Icon = "",
                    Img = "/assets/ConversationModel.svg",
                    SupportedPlatforms = new[] { "cloud", "windows" },
                    Inputs = chatInputs,
                    Outputs = new[]
                    {
                        new
                        {
                            Key = "Result",
                            Value = new { Value = "Result", Enabled = true }
                        }
                    }
                },
                Position = new { X = 0, Y = 0 },
                Deletable = false,
                Draggable = true,
                Selectable = true,
                TargetPosition = "left",
                SourcePosition = "right"
            },
            new
            {
                Id = modelNodeId,
                Type = "modelNode",
                Position = new { X = 64, Y = 112 },
                Deletable = false,
                Draggable = true,
                ClassName = "nodrag",
                Selectable = false,
                ParentId = chatNodeId,
                Hidden = false,
                Data = new { Label = "openai" }
            }
        };

        var initialEdgesList = new object[]
        {
            new
            {
                Id = Guid.NewGuid(),
                Source = modelNodeId,
                Target = chatNodeId,
                Deletable = false,
                Selectable = false,
                Style = new
                {
                    StrokeDasharray = "5,5",
                    StrokeWidth = 1
                },
                TargetHandle = "model-node"
            }
        };

        return SerializeReactFlowObject(initialNodesList, initialEdgesList);
    }

    private static string SerializeReactFlowObject(object nodes, object edges)
    {
        var reactFlowObject = new
        {
            Nodes = nodes,
            Edges = edges,
            Viewport = new { X = 0, Y = 0, Zoom = 1 }
        };

        var camelCaseOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        return System.Text.Json.JsonSerializer.Serialize(reactFlowObject, camelCaseOptions);
    }
}
