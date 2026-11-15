using System.Text.Json;
using ExecutorLibrary.Models;
using WorkspaceAPIs.Helpers;

namespace ExecutorLibrary.Tests.VoiceAgent;

/// <summary>
/// Validates the VoiceAgent publish-time engine rules in <see cref="VoiceAgentGraphHelpers"/>.
/// Run with: dotnet run --project shared/ExecutorLibrary.Tests
/// </summary>
public static class VoiceAgentEngineValidationHarness
{
    private const string GeminiLiveModel = "gemini-2.5-flash-native-audio-latest";
    private const string OpenAiRealtimeModel = "gpt-realtime";

    private static readonly (string Provider, string Model)[] AcceptedRealtimeProviders =
    [
        ("googlegemini", GeminiLiveModel),
        ("GoogleGemini", GeminiLiveModel),
        ("google", GeminiLiveModel),
        ("openai", OpenAiRealtimeModel),
        ("azure", OpenAiRealtimeModel),
        ("gemini", GeminiLiveModel)
    ];

    public static int Run()
    {
        var failures = 0;

        failures += Run("V1 stored realtime spellings are absent from the allowlist", () =>
        {
            AssertTrue(!VoiceAgentGraphHelpers.AllowedRealtimeProviders.Contains("googlegemini"));
            AssertTrue(!VoiceAgentGraphHelpers.AllowedRealtimeProviders.Contains("amazon_nova"));
        });

        failures += Run("V2 stored spellings and aliases accepted for realtime", () =>
        {
            foreach (var accepted in AcceptedRealtimeProviders)
            {
                AssertNull(VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                    BuildVoiceFlow("realtime", accepted.Provider, accepted.Model)));
            }
        });

        failures += Run("V3 ultravox rejected on the raw and normalized legs", () =>
        {
            var rawError = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("realtime", "ultravox", OpenAiRealtimeModel));
            AssertContains("not supported", rawError);
            AssertContains("'ultravox'", rawError);

            var upperError = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("realtime", "ULTRAVOX", OpenAiRealtimeModel));
            AssertContains("not supported", upperError);
            AssertContains("'ULTRAVOX'", upperError);

            AssertEqual(3, VoiceAgentGraphHelpers.AllowedRealtimeProviders.Count);
            AssertTrue(!VoiceAgentGraphHelpers.AllowedRealtimeProviders.Contains("ultravox"));
        });

        failures += Run("V4 unsupported realtime provider and engine mode reported to the caller", () =>
        {
            var providerError = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("realtime", "elevenlabs", "eleven_v3"));
            AssertContains("elevenlabs", providerError);
            AssertContains("openai", providerError);
            AssertContains("gemini", providerError);
            AssertTrue(!providerError!.Contains("vertex_ai", StringComparison.Ordinal));

            var modeError = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("live", "openai", OpenAiRealtimeModel));
            AssertContains("live", modeError);
            AssertContains("not supported", modeError);
        });

        failures += Run("V5 realtime without a model reports the required fields", () =>
        {
            var error = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("realtime", "openai", string.Empty));
            AssertEqual("Realtime engine mode requires a realtime provider and model.", error);
        });

        failures += Run("V6 realtime without a BYOK credential is rejected", () =>
        {
            var error = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("realtime", "openai", OpenAiRealtimeModel, credentialName: string.Empty));
            AssertEqual("Realtime engine mode requires a BYOK credential.", error);
        });

        failures += Run("V6b realtime accepts a BYOK credential supplied as credential_id", () =>
        {
            AssertNull(VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("realtime", "openai", OpenAiRealtimeModel, credentialId: "cred-1")));
        });

        failures += Run("V7 pipeline accepted when complete and reported when text-to-speech is missing", () =>
        {
            AssertNull(VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildPipelineVoiceFlow(includeTextToSpeechModel: true)));

            var error = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildPipelineVoiceFlow(includeTextToSpeechModel: false));
            AssertEqual("Pipeline engine mode requires a text-to-speech provider and model.", error);
        });

        failures += Run("V8 every rejection carries a non-empty user-facing message", () =>
        {
            string?[] rejections =
            [
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(BuildVoiceFlow("realtime", "ultravox", OpenAiRealtimeModel)),
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(BuildVoiceFlow("realtime", "ULTRAVOX", OpenAiRealtimeModel)),
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(BuildVoiceFlow("realtime", "elevenlabs", "eleven_v3")),
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(BuildVoiceFlow("live", "openai", OpenAiRealtimeModel)),
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(BuildVoiceFlow("realtime", "openai", string.Empty)),
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                    BuildVoiceFlow("realtime", "openai", OpenAiRealtimeModel, credentialName: string.Empty)),
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                    BuildVoiceFlow("realtime", "openai", OpenAiRealtimeModel, noiseCancellation: "standard")),
                VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(BuildPipelineVoiceFlow(includeTextToSpeechModel: false))
            ];

            foreach (var rejection in rejections)
                AssertTrue(rejection is not null && !string.IsNullOrWhiteSpace(rejection));
        });

        failures += Run("V9 enhanced noise cancellation is blocked for both engine modes", () =>
        {
            foreach (var mode in new[] { "standard", "telephony", " Standard " })
            {
                var realtimeError = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                    BuildVoiceFlow("realtime", "openai", OpenAiRealtimeModel, noiseCancellation: mode));
                AssertContains("not available yet", realtimeError);
                AssertContains(mode.Trim(), realtimeError);

                var pipelineError = VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                    BuildPipelineVoiceFlow(includeTextToSpeechModel: true, noiseCancellation: mode));
                AssertContains("not available yet", pipelineError);
                AssertContains(mode.Trim(), pipelineError);
            }

            AssertNull(VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildVoiceFlow("realtime", "openai", OpenAiRealtimeModel, noiseCancellation: "auto")));
            AssertNull(VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(
                BuildPipelineVoiceFlow(includeTextToSpeechModel: true, noiseCancellation: "none")));
        });

        Console.WriteLine($"\nResults: {(failures == 0 ? "ALL PASSED" : $"{failures} FAILED")}");
        return failures;
    }

    private static ReactFlowDataModel BuildVoiceFlow(
        string engineMode,
        string? realtimeProvider,
        string? realtimeModel,
        string? credentialName = "realtime-byok",
        string? noiseCancellation = null,
        string? credentialId = null) =>
        BuildFlow(
        [
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.EngineModeKey, Value = StringValue(engineMode) },
            new ReactFlowNodeInput
            {
                Key = VoiceAgentGraphHelpers.RealtimeVoiceKey,
                Value = ObjectValue(realtimeProvider, realtimeModel, credentialName, credentialId)
            },
            .. NoiseCancellationInput(noiseCancellation)
        ]);

    private static ReactFlowDataModel BuildPipelineVoiceFlow(
        bool includeTextToSpeechModel,
        string? noiseCancellation = null) =>
        BuildFlow(
        [
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.EngineModeKey, Value = StringValue("pipeline") },
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.PipelineSpeechToTextKey, Value = ObjectValue("elevenlabs", "scribe_v2") },
            new ReactFlowNodeInput { Key = VoiceAgentGraphHelpers.PipelineLlmKey, Value = ObjectValue("openai", "gpt-4o-mini") },
            new ReactFlowNodeInput
            {
                Key = VoiceAgentGraphHelpers.PipelineTextToSpeechKey,
                Value = ObjectValue("elevenlabs", includeTextToSpeechModel ? "eleven_flash_v2" : string.Empty)
            },
            .. NoiseCancellationInput(noiseCancellation)
        ]);

    private static ReactFlowNodeInput[] NoiseCancellationInput(string? mode) =>
        mode is null
            ? []
            : [new ReactFlowNodeInput
            {
                Key = VoiceAgentGraphHelpers.NoiseCancellationKey,
                Value = StringValue(mode)
            }];

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

    private static JsonElement ObjectValue(
        string? provider,
        string? model,
        string? credentialName = null,
        string? credentialId = null) =>
        JsonDocument.Parse(JsonSerializer.Serialize(
            new Dictionary<string, string?>
            {
                ["provider"] = provider,
                ["model"] = model,
                ["credential_name"] = credentialName,
                ["credential_id"] = credentialId,
            })).RootElement.Clone();

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

    private static void AssertEqual(object? expected, object? actual)
    {
        if (!Equals(expected, actual))
            throw new InvalidOperationException($"Expected '{expected}', got '{actual}'.");
    }

    private static void AssertTrue(bool condition)
    {
        if (!condition)
            throw new InvalidOperationException("Assertion failed.");
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
