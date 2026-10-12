using System.Reflection;
using System.Text.Json;
using ExecutorLibrary.FlowProcessor;
using ExecutorLibrary.FlowProcessor.Interfaces;
using ExecutorLibrary.Models;

namespace ExecutorLibrary.Tests.FlowProcessor;

/// <summary>
/// Regression harness for custom-tool node routing in <see cref="NodeProcessor"/>.
/// </summary>
public static class CustomToolNodeRoutingTestHarness
{
    private const string PreprocessCloudConnectorNode = "PreprocessCloudConnectorNode";

    public static int Run()
    {
        var failures = 0;

        failures += Run("CustomToolNodeRoutesToCustomToolExecutor", () =>
        {
            var (executor, inputs) = PreprocessCloudConnector(
                "CustomTool/WeatherTool.getWeather",
                CredentialInput("WeatherCredential"),
                new ReactFlowNodeInput { Key = "Headers", Value = """{"X-Trace":"abc"}""" },
                new ReactFlowNodeInput { Key = "Parameters", Value = """{"q":"london"}""" },
                new ReactFlowNodeInput { Key = "RequestPayload", Value = """{"city":"london"}""" });

            AssertEqual("ProcessCustomToolRequestNode", executor);
            AssertEqual("WeatherTool.getWeather", InputValue(inputs, "Action"));
            AssertEqual("WeatherCredential", InputValue(inputs, "CredentialName"));

            var payload = InputValue(inputs, "Payload");
            using var document = JsonDocument.Parse(payload!);
            AssertTrue(document.RootElement.TryGetProperty("headers", out _), "payload must carry the headers section");
            AssertEqual("abc", document.RootElement.GetProperty("headers").GetProperty("X-Trace").GetString());
            AssertTrue(document.RootElement.TryGetProperty("parameters", out _), "payload must carry the parameters section");
            AssertTrue(document.RootElement.TryGetProperty("requestPayload", out _), "payload must carry the request body section");
        });

        failures += Run("CustomToolNodeRejectsLookalikeProviderName", () =>
        {
            var (executor, _) = PreprocessCloudConnector("CustomToolbox/SendConnector", CredentialInput("AnyCredential"));

            AssertEqual("ProcessConnectorRequestNode", executor);
        });

        failures += Run("CustomToolNodeOmitsEmptyCredential", () =>
        {
            var (_, inputs) = PreprocessCloudConnector("CustomTool/WeatherTool.getWeather", CredentialInput(string.Empty));

            AssertTrue(inputs.All(input => input.Key != "CredentialName"), "an empty credential must not be forwarded");
        });

        failures += Run("CustomToolNodeDropsUnparseableSection", () =>
        {
            var (_, inputs) = PreprocessCloudConnector(
                "CustomTool/WeatherTool.getWeather",
                new ReactFlowNodeInput { Key = "Parameters", Value = "{not-json" });

            var payload = InputValue(inputs, "Payload");
            using var document = JsonDocument.Parse(payload!);
            AssertTrue(
                !document.RootElement.TryGetProperty("parameters", out _),
                "an unparseable section must be omitted rather than forwarded as a string");
        });

        return failures;
    }

    private static ReactFlowNodeInput CredentialInput(string value) =>
        new() { Key = "credential__CredentialName__", Value = value };

    private static (string Executor, List<ReactFlowNodeInput> Inputs) PreprocessCloudConnector(
        string rawName,
        params ReactFlowNodeInput[] inputs)
    {
        var method = typeof(NodeProcessor).GetMethod(
            PreprocessCloudConnectorNode,
            BindingFlags.NonPublic | BindingFlags.Static)
            ?? throw new InvalidOperationException($"{PreprocessCloudConnectorNode} was not found on NodeProcessor.");

        var arguments = new object[] { rawName, inputs.ToList(), new FlowExecutionContext() };
        var result = method.Invoke(null, arguments)
            ?? throw new InvalidOperationException($"{PreprocessCloudConnectorNode} returned null.");

        return ((string, List<ReactFlowNodeInput>))result;
    }

    private static string? InputValue(List<ReactFlowNodeInput> inputs, string key) =>
        inputs.FirstOrDefault(input => input.Key == key)?.Value?.ToString();

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

    private static void AssertTrue(bool condition, string message)
    {
        if (!condition)
            throw new InvalidOperationException(message);
    }
}
