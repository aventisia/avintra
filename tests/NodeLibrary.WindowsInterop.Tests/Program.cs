using NodeLibrary.WindowsInterop.Tests.Tests.MouseAndKeyboard;
using NodeLibrary.WindowsInterop.Tests.Tests.System;
using NodeLibrary.WindowsInterop.Tests.Tests.Workstation;

namespace NodeLibrary.WindowsInterop.Tests;

class Program
{
    static async Task Main(string[] args)
    {
        var tests = new IInteropTest[]
        {
            new SendInputStructSizeTest(),
            new KeyboardHelperPlaceholder(),
            new SendSingleKeyTest(),
            new SendTabKeyTest(),
            new SendModifierCombinationTest(),
            new MoveMouseTest(),
            new TakeScreenshotTest(),
            new EnvironmentVariableTest()
        };

        Console.WriteLine("NodeLibrary.WindowsInterop.Tests");
        Console.WriteLine("================================");
        Console.WriteLine("WARNING: These tests call real Windows APIs and may move your mouse or send keystrokes.");
        Console.WriteLine();

        string? initialChoice = args.Length > 0 ? args[0].Trim().ToUpperInvariant() : null;

        if (initialChoice == "A")
        {
            await RunAllAsync(tests);
            return;
        }

        if (initialChoice is not null && int.TryParse(initialChoice, out var initialIndex) && initialIndex >= 1 && initialIndex <= tests.Length)
        {
            await RunSingleAsync(tests[initialIndex - 1]);
            return;
        }

        bool running = true;
        while (running)
        {
            Console.WriteLine("Available tests:");
            for (int i = 0; i < tests.Length; i++)
            {
                Console.WriteLine($"  {i + 1}. [{tests[i].Category}] {tests[i].Name}");
            }
            Console.WriteLine("  A. Run all tests");
            Console.WriteLine("  0. Exit");
            Console.WriteLine();
            Console.Write("Choose an option: ");

            var choice = Console.ReadLine()?.Trim().ToUpperInvariant();
            Console.WriteLine();

            if (choice == "0")
            {
                running = false;
                continue;
            }

            if (choice == "A")
            {
                await RunAllAsync(tests);
                continue;
            }

            if (int.TryParse(choice, out var index) && index >= 1 && index <= tests.Length)
            {
                await RunSingleAsync(tests[index - 1]);
            }
            else
            {
                Console.WriteLine("Invalid option.");
            }

            Console.WriteLine();
        }
    }

    static async Task RunSingleAsync(IInteropTest test)
    {
        Console.WriteLine($"Running: {test.Name} ...");
        try
        {
            var result = await test.RunAsync();
            Print(result);
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  UNHANDLED EXCEPTION: {ex.Message}");
            Console.ResetColor();
        }
    }

    static async Task RunAllAsync(IInteropTest[] tests)
    {
        int passed = 0;
        int failed = 0;

        foreach (var test in tests)
        {
            Console.WriteLine($"Running: {test.Name} ...");
            try
            {
                var result = await test.RunAsync();
                Print(result);
                if (result.Success) passed++;
                else failed++;
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"  UNHANDLED EXCEPTION: {ex.Message}");
                Console.ResetColor();
                failed++;
            }
        }

        Console.WriteLine();
        Console.WriteLine($"Results: {passed} passed, {failed} failed.");
    }

    static void Print(InteropTestResult result)
    {
        if (result.Success)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"  PASS: {result.Message}");
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  FAIL: {result.Message}");
        }
        Console.ResetColor();
    }
}
