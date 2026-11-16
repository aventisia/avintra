using System.Text.Json.Nodes;
using ExecutorLibrary.Models;
using WorkspaceAPIs.Features.VoiceSessions.Service;
using WorkspaceAPIs.Helpers;

namespace ExecutorLibrary.Tests.VoiceAgent;

/// <summary>
/// Validates pure VoiceAgent settings resolution.
/// Run with: dotnet run --project shared/ExecutorLibrary.Tests
/// </summary>
public static class VoiceAgentSettingsFactoryHarness
{
    public static int Run()
    {
        var failures = 0;

        failures += Run("AI-first introduction and spoken guidance", () =>
        {
            var settings = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""
                {
                  "__FirstSpeaker__Voice": "ai",
                  "__Introduction__Voice": "Hello {{name}}.",
                  "__Goal__Voice": "Help {{name}}.",
                  "__VariablesEnabled__Voice": true,
                  "__Variables__Voice": { "name": "Aventisia" }
                }
                """));

            AssertEqual("ai", settings.FirstSpeaker);
            AssertEqual("Hello Aventisia.", settings.Introduction);
            AssertContains("Goal:\nHelp Aventisia.", settings.Persona.SystemPrompt);
            AssertContains(VoiceAgentSettingsFactory.SpokenStyleGuidance, settings.Persona.SystemPrompt);
        });

        failures += Run("Human-first sessions do not introduce themselves", () =>
        {
            var settings = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""
                {
                  "__FirstSpeaker__Voice": "human",
                  "__Introduction__Voice": "Do not speak yet."
                }
                """));

            AssertEqual("human", settings.FirstSpeaker);
            AssertEqual(null, settings.Introduction);
        });

        failures += Run("Variables resolve unless explicitly disabled", () =>
        {
            var disabled = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""{ "__Goal__Voice": "Hello {{name}}", "__VariablesEnabled__Voice": false, "__Variables__Voice": { "name": "Ada" } }"""));
            var enabledByDefault = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""{ "__Goal__Voice": "Hello {{name}}", "__Variables__Voice": { "name": "Ada" } }"""));
            var missing = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""
                {
                  "__VariablesEnabled__Voice": true,
                  "__Goal__Voice": "Hello {{name}} and {{missing}}",
                  "__Variables__Voice": { "name": "Ada" }
                }
                """));

            var noVariables = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("{ \"__Goal__Voice\": \"Hello {{name}}\" }"));

            AssertEqual("Hello {{name}}", disabled.Persona.Goal);
            AssertEqual("Hello Ada", enabledByDefault.Persona.Goal);
            AssertEqual("Hello Ada and {{missing}}", missing.Persona.Goal);
            AssertEqual("Hello {{name}}", noVariables.Persona.Goal);
        });

        failures += Run("Engine latency and noise settings resolve with conservative defaults", () =>
        {
            var defaults = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("{}"));

            AssertEqual(false, defaults.PreemptiveGeneration);
            AssertEqual("none", defaults.NoiseCancellation);

            var configured = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""{ "__PreemptiveGeneration__Voice": true, "__NoiseCancellation__Voice": " Auto " }"""));

            AssertEqual(true, configured.PreemptiveGeneration);
            AssertEqual("auto", configured.NoiseCancellation);

            var unknown = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""{ "__NoiseCancellation__Voice": "aggressive" }"""));

            AssertEqual("none", unknown.NoiseCancellation);

            var enhanced = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""{ "__NoiseCancellation__Voice": " Standard " }"""));

            AssertEqual("none", enhanced.NoiseCancellation);
        });

        failures += Run("Malformed pronunciation entries are ignored", () =>
        {
            var settings = VoiceAgentSettingsFactory.Create(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "Reception",
                Parse("""
                {
                  "__PronunciationEnabled__Voice": true,
                  "__Pronunciation__Voice": [
                    { "term": "API", "pronunciation": "A P I" },
                    { "term": "", "pronunciation": "missing term" },
                    { "term": "missing pronunciation" },
                    "not an object"
                  ]
                }
                """));

            AssertEqual(1, settings.Pronunciations.Count);
            AssertEqual("API", settings.Pronunciations[0].Term);
        });

        failures += Run("Voice node extraction fails closed when missing", () =>
        {
            var parsed = new ReactFlowDataModel
            {
                Nodes =
                [
                    new ReactFlowNodeModel
                    {
                        Id = "chat-node",
                        Type = "aiNode",
                        Data = new ReactFlowNodeData { Name = "CreateConversationAIAgent" },
                    }
                ]
            };

            AssertEqual(null, VoiceAgentGraphHelpers.GetVoiceAgentNodeConfig(parsed));
        });

        Console.WriteLine($"\nVoice settings results: {(failures == 0 ? "ALL PASSED" : $"{failures} FAILED")}");
        return failures;
    }

    private static JsonObject Parse(string json) => JsonNode.Parse(json)!.AsObject();

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

    private static void AssertContains(string expected, string? actual)
    {
        if (actual is null || !actual.Contains(expected, StringComparison.Ordinal))
            throw new InvalidOperationException($"Expected a value containing '{expected}', got '{actual}'.");
    }
}
