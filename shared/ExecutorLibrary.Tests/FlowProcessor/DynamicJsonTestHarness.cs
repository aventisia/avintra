using System.Dynamic;
using System.Text.Json;
using System.Text.Json.Nodes;
using ExecutorLibrary.FlowProcessor;

namespace ExecutorLibrary.Tests.FlowProcessor;

/// <summary>
/// Manual test harness for the DynamicJson / JsonToDynamicConverter changes.
/// Run with: dotnet run --project shared/ExecutorLibrary.Tests
/// (or migrate to NUnit/XUnit once a real test project exists).
/// </summary>
public static class DynamicJsonTestHarness
{
    public static int Main()
    {
        var failures = 0;

        failures += Run("DotNotationOnJsonObject", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("data", JsonDocument.Parse("""{"name":"Aventisia"}""").RootElement);
            var result = ctx.ResolveTemplate("{{data.name}}");
            AssertEqual("Aventisia", result);
        });

        failures += Run("StringIndexerOnJsonObject", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("data", JsonDocument.Parse("""{"Loan Account Number or File Number":"12345"}""").RootElement);
            var result = ctx.ResolveTemplate("""{{data["Loan Account Number or File Number"]}}""");
            AssertEqual("12345", result);
        });

        failures += Run("NestedArrayDotAndStringIndexer", () =>
        {
            var ctx = new FlowExecutionContext();
            var json = """
                [
                    {"Value":{"Loan Account Number or File Number":"first"}},
                    {"Value":{"Loan Account Number or File Number":"second"}},
                    {"Value":{"Loan Account Number or File Number":"third"}}
                ]
                """;
            ctx.Set("list", JsonDocument.Parse(json).RootElement);
            var result = ctx.ResolveTemplate("""{{list[2].Value["Loan Account Number or File Number"]}}""");
            AssertEqual("third", result);
        });

        failures += Run("NumericKeyAccessCoercesToString", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("data", JsonDocument.Parse("""{"0":"numeric-key-value"}""").RootElement);
            var result = ctx.ResolveTemplate("{{data[0]}}");
            AssertEqual("numeric-key-value", result);
        });

        failures += Run("MissingStringIndexerThrows", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("data", JsonDocument.Parse("""{"present":"yes"}""").RootElement);
            try
            {
                ctx.ResolveTemplate("""{{data["missing"]}}""");
                throw new InvalidOperationException("Expected KeyNotFoundException");
            }
            catch (KeyNotFoundException)
            {
                // Expected
            }
        });

        failures += Run("ExpandoObjectRoundTrip", () =>
        {
            var ctx = new FlowExecutionContext();
            dynamic expando = new ExpandoObject();
            expando.Key = "value";
            ctx.Set("obj", (object)expando);
            var result = ctx.ResolveTemplate("{{obj.Key}}");
            AssertEqual("value", result);
            // The raw _variables entry remains the original ExpandoObject; the interpreter
            // sees the DynamicJson wrapper. Verify the template still works via indexing too.
            var indexedResult = ctx.ResolveTemplate("""{{obj["Key"]}}""");
            AssertEqual("value", indexedResult);
        });

        failures += Run("JsonNodeConversion", () =>
        {
            var ctx = new FlowExecutionContext();
            var node = JsonNode.Parse("""{"nested":{"key":"from node"}}""");
            ctx.Set("node", node!);
            var result = ctx.ResolveTemplate("{{node.nested.key}}");
            AssertEqual("from node", result);
        });

        failures += Run("JsonSerializerRoundTrip", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("data", JsonDocument.Parse("""{"a":1,"b":[2,3]}""").RootElement);
            var evaluated = ctx.ResolveTemplateObject("{{data}}");
            AssertTrue(evaluated is DynamicJson);
            var json = JsonSerializer.Serialize(evaluated);
            using var doc = JsonDocument.Parse(json);
            AssertEqual(JsonValueKind.Object, doc.RootElement.ValueKind);
            AssertEqual(1, doc.RootElement.GetProperty("a").GetInt32());
        });

        failures += Run("DictionaryConversion", () =>
        {
            var ctx = new FlowExecutionContext();
            var dict = new Dictionary<string, object?>
            {
                ["First Name"] = "Jane",
                ["Last Name"] = "Doe"
            };
            ctx.Set("person", dict);
            var result = ctx.ResolveTemplate("""{{person["First Name"]}} {{person["Last Name"]}}""");
            AssertEqual("Jane Doe", result);
        });

        failures += Run("NodeArgumentHelperSerializesDynamicJson", () =>
        {
            var dyn = new DynamicJson();
            dyn["x"] = 1;
            dyn["y"] = "two";
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(dyn, typeof(string));
            AssertEqual("""{"x":1,"y":"two"}""", result);
        });

        failures += Run("NodeArgumentHelperSingleFilePathToList", () =>
        {
            var path = "C:\\Users\\Gaurav\\Gitea\\Aventisia\\assets\\demo-files\\sendgrid-invoice.pdf";
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(path, typeof(List<string>));
            AssertTrue(result is List<string> list && list.Count == 1 && list[0] == path);
        });

        failures += Run("NodeArgumentHelperJsonArrayStringToList", () =>
        {
            var json = """["C:\\a.pdf","C:\\b.pdf"]""";
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(json, typeof(List<string>));
            AssertTrue(result is List<string> list && list.Count == 2 && list[0] == "C:\\a.pdf" && list[1] == "C:\\b.pdf");
        });

        failures += Run("NodeArgumentHelperCommaSeparatedStringToList", () =>
        {
            var csv = "C:\\a.pdf,C:\\b.pdf";
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(csv, typeof(List<string>));
            AssertTrue(result is List<string> list && list.Count == 2 && list[0] == "C:\\a.pdf" && list[1] == "C:\\b.pdf");
        });

        // Regression: a List<DynamicJson> (e.g. {{DeserializedToken.line_items}}) must serialize
        // as JSON, not fall through to ToString() which yields the class name
        // "System.Collections.Generic.List`1[ExecutorLibrary.FlowProcessor.DynamicJson]".
        failures += Run("ListOfDynamicJsonResolvesToJson", () =>
        {
            var ctx = new FlowExecutionContext();
            var lineItems = new List<DynamicJson>
            {
                new() { ["item"] = "A", ["qty"] = 2L },
                new() { ["item"] = "B", ["qty"] = 3L }
            };
            ctx.Set("DeserializedToken", new DynamicJson { ["line_items"] = lineItems });
            var result = ctx.ResolveTemplate("{{DeserializedToken.line_items}}");
            if (result.Contains("System.Collections.Generic.List"))
                throw new InvalidOperationException($"Got class name instead of JSON: {result}");
            using var doc = JsonDocument.Parse(result);
            AssertEqual(JsonValueKind.Array, doc.RootElement.ValueKind);
            AssertEqual(2, doc.RootElement.GetArrayLength());
        });

        Console.WriteLine($"\nResults: {(failures == 0 ? "ALL PASSED" : $"{failures} FAILED")}");
        return failures;
    }

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
}
