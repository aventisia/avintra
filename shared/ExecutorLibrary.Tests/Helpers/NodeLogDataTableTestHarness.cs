using System.Data;
using System.Text.Json.Nodes;
using NodeLibrary.Helpers;
using static ExecutorLibrary.Tests.TestHarness;

namespace ExecutorLibrary.Tests.Helpers;

/// <summary>
/// Coverage for the DataTable and array branches of <see cref="NodeLogHelper.ConvertValueForLogging"/>.
/// </summary>
public static class NodeLogDataTableTestHarness
{
    private const string Key = "value";
    private const string InOrOut = "Input";

    /// <summary>Runs the NodeLogHelper cases and returns the failure count.</summary>
    public static int Run()
    {
        var failures = 0;
        failures += TestHarness.RunCase("DataTableEmptyLogsEmptyArray", EmptyTableLogsEmptyArray);
        failures += TestHarness.RunCase("DataTableLogsRowObjects", TableLogsRowObjects);
        failures += TestHarness.RunCase("DataTableMissingCellsLogNull", MissingCellsLogNull);
        failures += TestHarness.RunCase("DataTableLongCellShortenedAndValidJson", LongCellShortenedAndValidJson);
        failures += TestHarness.RunCase("DataTableCappedAt100RowsWithMarker", CappedAt100RowsWithMarker);
        failures += TestHarness.RunCase("DataTableStringCellsRoundTripAsStrings", StringCellsRoundTripAsStrings);
        failures += TestHarness.RunCase("DataTableCellArrayUsesItemCap", DataTableCellArrayUsesItemCap);
        failures += TestHarness.RunCase("DataTableUnserializableCellFallsBackToSummary", UnserializableCellFallsBackToSummary);
        failures += TestHarness.RunCase("DataSetKeepsSummary", DataSetKeepsSummary);
        failures += TestHarness.RunCase("PlatformHookTakesPrecedence", PlatformHookTakesPrecedence);
        failures += TestHarness.RunCase("ArrayCappedAt100ItemsForInputAndOutput", ArrayCappedAt100ItemsForInputAndOutput);
        failures += TestHarness.RunCase("LazyEnumerableStopsAfterCap", LazyEnumerableStopsAfterCap);
        return failures;
    }

    private static void EmptyTableLogsEmptyArray()
    {
        AssertEqual("[]", Log(BuildTable()));
    }

    private static void TableLogsRowObjects()
    {
        var table = BuildTable();
        table.Rows.Add(1, "a");
        table.Rows.Add(2, "b");
        AssertEqual("""[{"Id":1,"Name":"a"},{"Id":2,"Name":"b"}]""", Log(table));
    }

    private static void MissingCellsLogNull()
    {
        var table = BuildTable();
        table.Rows.Add(1, DBNull.Value);
        table.Rows.Add(2);
        AssertEqual("""[{"Id":1,"Name":null},{"Id":2,"Name":null}]""", Log(table));
    }

    private static void LongCellShortenedAndValidJson()
    {
        var table = BuildTable();
        var longText = new string('x', 300);
        table.Rows.Add(1, longText);

        var logged = Log(table);
        var name = JsonNode.Parse(logged)![0]!["Name"]!.GetValue<string>();
        AssertEqual(255 + "...".Length, name.Length);
        AssertTrue(name.EndsWith("..."));
        AssertTrue(!logged.Contains(longText));
    }

    private static void CappedAt100RowsWithMarker()
    {
        var table = BuildTable();
        for (var i = 1; i <= 150; i++)
            table.Rows.Add(i, $"name{i}");

        var array = JsonNode.Parse(Log(table))!.AsArray();
        AssertEqual(101, array.Count);
        AssertEqual(1, array[0]!["Id"]!.GetValue<int>());
        AssertEqual(100, array[99]!["Id"]!.GetValue<int>());

        var marker = array[100]!.AsObject();
        AssertEqual(1, marker.Count);
        AssertEqual("Showing first 100 of 150 rows", marker["_truncated"]!.GetValue<string>());
    }

    private static void StringCellsRoundTripAsStrings()
    {
        var table = new DataTable();
        table.Columns.Add("Id", typeof(string));
        table.Rows.Add("\"a\"");

        var id = JsonNode.Parse(Log(table))![0]!["Id"]!.GetValue<string>();
        AssertEqual("\"a\"", id);
    }

    private static void DataTableCellArrayUsesItemCap()
    {
        var table = new DataTable();
        table.Columns.Add("Items", typeof(object));
        table.Rows.Add(Enumerable.Range(1, 150).ToList());

        var items = JsonNode.Parse(Log(table))![0]!["Items"]!.AsArray();
        AssertEqual(101, items.Count);
        AssertEqual("Showing first 100 items", items[100]!["_truncated"]!.GetValue<string>());
    }

    private static void UnserializableCellFallsBackToSummary()
    {
        var table = BuildTable();
        table.Columns.Add("Cycle", typeof(object));
        var cycle = new CyclicValue();
        cycle.Self = cycle;
        table.Rows.Add(1, "a", cycle);

        AssertEqual("DataTable with columns [Id, Name, Cycle]", Log(table));
    }

    private static void DataSetKeepsSummary()
    {
        var dataSet = new DataSet();
        dataSet.Tables.Add(new DataTable("First"));
        dataSet.Tables.Add(new DataTable("Second"));
        AssertEqual("DataSet with tables [First, Second]", Log(dataSet));
    }

    private static void PlatformHookTakesPrecedence()
    {
        var previousHook = NodeLogHelper.PlatformSpecificConvertValueForLogging;
        try
        {
            NodeLogHelper.PlatformSpecificConvertValueForLogging = (_, _, _) => "from-hook";
            AssertEqual("from-hook", Log(BuildTable()));
        }
        finally
        {
            NodeLogHelper.PlatformSpecificConvertValueForLogging = previousHook;
        }
    }

    private static void ArrayCappedAt100ItemsForInputAndOutput()
    {
        var items = Enumerable.Range(1, 150).ToArray();
        var input = Log(items, "Input");
        var output = Log(items, "Output");

        AssertEqual(input, output);
        AssertCappedArray(input);
        AssertCappedArray(output);
    }

    private static void LazyEnumerableStopsAfterCap()
    {
        var enumerated = 0;
        IEnumerable<int> Source()
        {
            while (true)
            {
                enumerated++;
                yield return enumerated;
            }
        }

        AssertCappedArray(Log(Source()));
        AssertEqual(101, enumerated);
    }

    private static void AssertCappedArray(string logged)
    {
        var array = JsonNode.Parse(logged)!.AsArray();
        AssertEqual(101, array.Count);
        AssertEqual(1, array[0]!.GetValue<int>());
        AssertEqual(100, array[99]!.GetValue<int>());
        AssertEqual("Showing first 100 items", array[100]!["_truncated"]!.GetValue<string>());
    }

    private static DataTable BuildTable()
    {
        var table = new DataTable();
        table.Columns.Add("Id", typeof(int));
        table.Columns.Add("Name", typeof(string));
        return table;
    }

    private static string Log(object? value, string inOrOut = InOrOut) => NodeLogHelper.ConvertValueForLogging(Key, value, inOrOut);

    private sealed class CyclicValue
    {
        public object? Self { get; set; }
    }
}
