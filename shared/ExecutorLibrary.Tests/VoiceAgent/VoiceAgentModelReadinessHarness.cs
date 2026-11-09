using System.Text.Json;
using ExecutorLibrary.Models;

namespace ExecutorLibrary.Tests.VoiceAgent;

/// <summary>
/// Validates the VoiceAgent publish-time tenant model readiness rule in <see cref="VoiceAgentGraphHelpers"/>.
/// Run with: dotnet run --project shared/ExecutorLibrary.Tests
/// </summary>
public static class VoiceAgentModelReadinessHarness
{
    private static readonly (string Provider, string Model, string? Capability)[] EnabledPipelineModels =
    [
        ("OpenAI", "gpt-4o-mini", "Text"),
        ("ElevenLabs", "scribe_v2", "Stt"),
        ("ElevenLabs", "eleven_multilingual_v2", "Tts")
    ];

    public static int Run()
    {
        var failures = 0;

        failures += Run("M1 enabled pipeline models pass", () =>
            AssertNull(Validate(BuildPipelineFlow(), EnabledPipelineModels)));

        failures += Run("M2 realtime engine mode skips the pipeline model check", () =>
            AssertNull(Validate(BuildRealtimeFlow(), [])));

        failures += Run("M3 speech-to-text requires the Stt capability", () =>
        {
            var textCapabilityError = Validate(
                BuildPipelineFlow(),
                [EnabledPipelineModels[0], ("ElevenLabs", "scribe_v2", "Text"), EnabledPipelineModels[2]]);
            AssertContains("speech-to-text", textCapabilityError);
            AssertContains("scribe_v2", textCapabilityError);

            var nullCapabilityError = Validate(
                BuildPipelineFlow(),
                [EnabledPipelineModels[0], ("ElevenLabs", "scribe_v2", null), EnabledPipelineModels[2]]);
            AssertContains("speech-to-text", nullCapabilityError);
        });

        failures += Run("M4 missing text-to-speech model fails with a useful message", () =>
        {
            var error = Validate(BuildPipelineFlow(), [EnabledPipelineModels[0], EnabledPipelineModels[1]]);
            AssertContains("text-to-speech", error);
            AssertContains("eleven_multilingual_v2", error);
            AssertContains("not enabled for this tenant", error);
        });

        failures += Run("M5 provider aliases match the tenant provider names", () =>
        {
            (string StudioProvider, string TenantProvider)[] aliases =
            [
                ("googlegemini", "Gemini"),
                ("elevenlabs", "ElevenLabs"),
                ("openai", "OpenAI"),
                ("vertex_ai", "VertexAi")
            ];

            foreach (var (studioProvider, tenantProvider) in aliases)
            {
                AssertNull(Validate(
                    BuildPipelineFlow(
                        llmProvider: studioProvider,
                        llmModel: "shared-model",
                        sttProvider: studioProvider,
                        sttModel: "shared-model",
                        ttsProvider: studioProvider,
                        ttsModel: "shared-model"),
                    [
                        (tenantProvider, "shared-model", "Text"),
                        (tenantProvider, "shared-model", "Stt"),
                        (tenantProvider, "shared-model", "Tts")
                    ]));
            }
        });

        failures += Run("M6 model identifiers are trimmed and compared ordinally", () =>
        {
            var mismatch = Validate(
                BuildPipelineFlow(llmModel: "gpt-4o-mini"),
                [("OpenAI", "gpt-4o", "Text"), EnabledPipelineModels[1], EnabledPipelineModels[2]]);
            AssertContains("language model", mismatch);
            AssertContains("gpt-4o-mini", mismatch);

            var caseMismatch = Validate(
                BuildPipelineFlow(llmModel: "gpt-4o-mini"),
                [("OpenAI", "GPT-4o-mini", "Text"), EnabledPipelineModels[1], EnabledPipelineModels[2]]);
            AssertContains("language model", caseMismatch);

            AssertNull(Validate(
                BuildPipelineFlow(llmModel: "gpt-4o-mini"),
                [("OpenAI", " gpt-4o-mini ", "Text"), EnabledPipelineModels[1], EnabledPipelineModels[2]]));
        });

        failures += Run("M7 legacy null capability satisfies Text only", () =>
        {
            AssertNull(Validate(
                BuildPipelineFlow(),
                [("OpenAI", "gpt-4o-mini", null), EnabledPipelineModels[1], EnabledPipelineModels[2]]));

            var error = Validate(
                BuildPipelineFlow(),
                [EnabledPipelineModels[0], EnabledPipelineModels[1], ("ElevenLabs", "eleven_multilingual_v2", null)]);
            AssertContains("text-to-speech", error);
        });

        failures += Run("M8 unknown capabilities do not satisfy Stt or Tts", () =>
        {
            var sttError = Validate(
                BuildPipelineFlow(),
                [EnabledPipelineModels[0], ("ElevenLabs", "scribe_v2", "Embedding"), EnabledPipelineModels[2]]);
            AssertContains("speech-to-text", sttError);

            var ttsError = Validate(
                BuildPipelineFlow(),
                [EnabledPipelineModels[0], EnabledPipelineModels[1], ("ElevenLabs", "eleven_multilingual_v2", "Realtime")]);
            AssertContains("text-to-speech", ttsError);
        });

        Console.WriteLine($"\nResults: {(failures == 0 ? "ALL PASSED" : $"{failures} FAILED")}");
        return failures;
    }

    private static string? Validate(
        ReactFlowDataModel flow,
        IEnumerable<(string Provider, string Model, string? Capability)> enabledModels) =>
        VoiceAgentGraphHelpers.ValidateVoiceAgentModelsEnabled(flow, enabledModels);

    private static ReactFlowDataModel BuildPipelineFlow(
        string llmProvider = "openai",
        string llmModel = "gpt-4o-mini",
        string sttProvider = "elevenlabs",
        string sttModel = "scribe_v2",
        string ttsProvider = "elevenlabs",
        string ttsModel = "eleven_multilingual_v2") =>
        BuildFlow(
        [
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.EngineModeKey, Value = StringValue("pipeline") },
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.PipelineLlmKey, Value = ObjectValue(llmProvider, llmModel) },
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.PipelineSpeechToTextKey, Value = ObjectValue(sttProvider, sttModel) },
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.PipelineTextToSpeechKey, Value = ObjectValue(ttsProvider, ttsModel) }
        ]);

    private static ReactFlowDataModel BuildRealtimeFlow() =>
        BuildFlow(
        [
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.EngineModeKey, Value = StringValue("realtime") },
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.RealtimeVoiceKey, Value = ObjectValue("openai", "gpt-realtime") }
        ]);

    private static ReactFlowDataModel BuildFlow(List<ReactFlowNodeInput> inputs) =>
        new()
        {
            Nodes =
            [
                new ReactFlowNodeModel
                {
                    Id = "voice-node-1",
                    Type = "aiNode",
                    Data = new ReactFlowNodeData
                    {
                        Name = VoiceAgentGraphHelpers.VoiceAgentNodeName,
                        Inputs = inputs
                    }
                }
            ],
            Edges = []
        };

    private static JsonElement StringValue(string value) =>
        JsonDocument.Parse(JsonSerializer.Serialize(value)).RootElement.Clone();

    private static JsonElement ObjectValue(string? provider, string? model) =>
        JsonDocument.Parse(JsonSerializer.Serialize(
            new Dictionary<string, string?> { ["provider"] = provider, ["model"] = model })).RootElement.Clone();

    private static int Run(string name, Action test)
    {
        try
        {
            test();
            Console.WriteLine($"  PASS: {name}");
            return 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  FAIL: {name}");
            Console.WriteLine($"        {ex.Message}");
            return 1;
        }
    }

    private static void AssertNull(object? actual)
    {
        if (actual is not null)
            throw new InvalidOperationException($"Expected null, got '{actual}'.");
    }

    private static void AssertContains(string expected, string? actual)
    {
        if (actual is null || !actual.Contains(expected, StringComparison.Ordinal))
            throw new InvalidOperationException($"Expected a value containing '{expected}', got '{actual}'.");
    }
}
