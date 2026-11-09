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

        failures += FlowProcessorMatrixTestHarness.Run();

        failures += VoiceAgent.VoiceAgentEngineValidationHarness.Run();
        failures += VoiceAgent.VoiceAgentSettingsFactoryHarness.Run();

        failures += CustomToolNodeRoutingTestHarness.Run();

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

        failures += Run("MissingStringIndexerLeavesPlaceholder", () =>
        {
            // A missing key must NOT fail the whole node: ResolvePlaceholdersToString
            // catches KeyNotFoundException and leaves the original placeholder in place
            // so users see the template as-is.
            var ctx = new FlowExecutionContext();
            ctx.Set("data", JsonDocument.Parse("""{"present":"yes"}""").RootElement);
            var result = ctx.ResolveTemplate("""{{data["missing"]}}""");
            AssertEqual("""{{data["missing"]}}""", result);
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

        // ------------------------------------------------------------------
        // Coverage for the four supported value types handled by
        // ObjectToString / NodeArgumentHelper.ConvertToType:
        //   1. DynamicJson
        //   2. ExpandoObject
        //   3. IDictionary<string, object?>
        //   4. IEnumerable (excluding string)
        // Each must serialize to JSON without throwing.
        // ------------------------------------------------------------------

        // --- 1. DynamicJson ---
        failures += Run("DynamicJsonSimpleSerializesToJson", () =>
        {
            var dyn = new DynamicJson { ["x"] = 1, ["y"] = "two" };
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(dyn, typeof(string));
            AssertEqual("""{"x":1,"y":"two"}""", result);
        });

        failures += Run("DynamicJsonNestedWithArraySerializesToJson", () =>
        {
            var dyn = new DynamicJson
            {
                ["name"] = "Aventisia",
                ["tags"] = new List<object?> { "rpa", "automation" },
                ["meta"] = new DynamicJson { ["active"] = true }
            };
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(dyn, typeof(string));
            AssertEqual("""{"name":"Aventisia","tags":["rpa","automation"],"meta":{"active":true}}""", result);
        });

        failures += Run("DynamicJsonEmptySerializesToEmptyObject", () =>
        {
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(new DynamicJson(), typeof(string));
            AssertEqual("{}", result);
        });

        // --- 2. ExpandoObject ---
        failures += Run("ExpandoObjectSimpleSerializesToJson", () =>
        {
            dynamic expando = new ExpandoObject();
            expando.Key = "value";
            expando.Count = 3;
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType((object)expando, typeof(string));
            AssertEqual("""{"Key":"value","Count":3}""", result);
        });

        failures += Run("ExpandoObjectNestedSerializesToJson", () =>
        {
            dynamic outer = new ExpandoObject();
            outer.Name = "Aventisia";
            dynamic inner = new ExpandoObject();
            inner.Count = 5;
            inner.Enabled = true;
            outer.Details = inner;
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType((object)outer, typeof(string));
            AssertEqual("""{"Name":"Aventisia","Details":{"Count":5,"Enabled":true}}""", result);
        });

        failures += Run("ExpandoObjectEmptySerializesToEmptyObject", () =>
        {
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(new ExpandoObject(), typeof(string));
            AssertEqual("{}", result);
        });

        // --- 3. IDictionary<string, object?> ---
        failures += Run("DictionarySimpleSerializesToJson", () =>
        {
            var dict = new Dictionary<string, object?>
            {
                ["First Name"] = "Jane",
                ["Last Name"] = "Doe"
            };
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(dict, typeof(string));
            AssertEqual("""{"First Name":"Jane","Last Name":"Doe"}""", result);
        });

        failures += Run("DictionaryNestedSerializesToJson", () =>
        {
            var dict = new Dictionary<string, object?>
            {
                ["user"] = new Dictionary<string, object?> { ["id"] = 42L, ["role"] = "admin" },
                ["active"] = true
            };
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(dict, typeof(string));
            AssertEqual("""{"user":{"id":42,"role":"admin"},"active":true}""", result);
        });

        failures += Run("DictionaryMixedValuesSerializesToJson", () =>
        {
            var dict = new Dictionary<string, object?>
            {
                ["int"] = 7,
                ["double"] = 1.5,
                ["bool"] = false,
                ["null"] = null,
                ["str"] = "text"
            };
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(dict, typeof(string));
            AssertEqual("""{"int":7,"double":1.5,"bool":false,"null":null,"str":"text"}""", result);
        });

        failures += Run("DictionaryEmptySerializesToEmptyObject", () =>
        {
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(new Dictionary<string, object?>(), typeof(string));
            AssertEqual("{}", result);
        });

        // --- 4. IEnumerable (excluding string) ---
        failures += Run("ListOfStringsSerializesToJsonArray", () =>
        {
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(new List<string> { "a", "b", "c" }, typeof(string));
            AssertEqual("""["a","b","c"]""", result);
        });

        failures += Run("ListOfDynamicJsonSerializesToJsonArray", () =>
        {
            var list = new List<DynamicJson>
            {
                new() { ["item"] = "A", ["qty"] = 2L },
                new() { ["item"] = "B", ["qty"] = 3L }
            };
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(list, typeof(string));
            AssertEqual("""[{"item":"A","qty":2},{"item":"B","qty":3}]""", result);
        });

        failures += Run("IntArraySerializesToJsonArray", () =>
        {
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(new[] { 1, 2, 3 }, typeof(string));
            AssertEqual("""[1,2,3]""", result);
        });

        failures += Run("HashSetOfIntsSerializesToJsonArray", () =>
        {
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(new HashSet<int> { 1, 2, 3 }, typeof(string));
            AssertEqual("""[1,2,3]""", result);
        });

        failures += Run("ListOfMixedObjectsSerializesToJsonArray", () =>
        {
            var list = new List<object?> { 1, "two", true, null };
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(list, typeof(string));
            AssertEqual("""[1,"two",true,null]""", result);
        });

        failures += Run("EmptyListSerializesToEmptyArray", () =>
        {
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType(new List<object?>(), typeof(string));
            AssertEqual("[]", result);
        });

        failures += Run("PlainStringIsNotTreatedAsEnumerable", () =>
        {
            // A string is IEnumerable<char> but must NOT be serialized as a JSON array.
            var result = ExecutorLibrary.Helpers.NodeArgumentHelper.ConvertToType("hello", typeof(string));
            AssertEqual("hello", result);
        });

        // --- End-to-end: template resolution renders each type as JSON ---
        failures += Run("TemplateResolvesDynamicJsonToJson", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("data", new DynamicJson { ["name"] = "Aventisia", ["count"] = 2L });
            var result = ctx.ResolveTemplate("{{data}}");
            AssertEqual("""{"name":"Aventisia","count":2}""", result);
        });

        failures += Run("TemplateResolvesExpandoObjectToJson", () =>
        {
            var ctx = new FlowExecutionContext();
            dynamic expando = new ExpandoObject();
            expando.Key = "value";
            ctx.Set("obj", (object)expando);
            var result = ctx.ResolveTemplate("{{obj}}");
            AssertEqual("""{"Key":"value"}""", result);
        });

        failures += Run("TemplateResolvesDictionaryToJson", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("person", new Dictionary<string, object?> { ["First Name"] = "Jane", ["Last Name"] = "Doe" });
            var result = ctx.ResolveTemplate("{{person}}");
            AssertEqual("""{"First Name":"Jane","Last Name":"Doe"}""", result);
        });

        failures += Run("TemplateResolvesListToJson", () =>
        {
            var ctx = new FlowExecutionContext();
            ctx.Set("items", new List<string> { "a", "b" });
            var result = ctx.ResolveTemplate("{{items}}");
            AssertEqual("""["a","b"]""", result);
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
