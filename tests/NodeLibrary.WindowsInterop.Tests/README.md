# NodeLibrary.WindowsInterop.Tests

Interactive integration test harness for Windows-specific interop code used by `NodeLibrary`. These are **not unit tests** — they exercise real Windows APIs such as `user32.dll`, UI Automation, registry, GDI+, and WMI.

Use this project to:

- Verify that `SendInput` struct layouts match the native Windows ABI.
- Smoke-test keyboard and mouse simulation.
- Check screenshot, printer, environment-variable, and other workstation nodes in isolation.
- Debug failures without launching the full desktop app or RunnerApp.

## Requirements

- Windows 10/11
- .NET 8 SDK
- Run from an interactive desktop session (not a Windows service or SSH session without a desktop)

## Run

```powershell
cd tests/NodeLibrary.WindowsInterop.Tests
dotnet run
```

Choose an option from the interactive menu. Many tests visibly affect your machine (e.g., they send keystrokes or move the mouse), so run with care.

## Structure

```
Native/              P/Invoke struct definitions (INPUT, KEYBDINPUT, etc.)
Tests/
  MouseAndKeyboard/  KeyboardHelper/MouseHelper interop tests
  Workstation/       Screenshot, printer, sound tests
  System/            Environment variables, process tests
```

## Adding a new test

1. Create a class under `Tests/<Category>/` implementing `IInteropTest`.
2. Return the display name from `Name`.
3. Run the Windows API call inside `RunAsync` and report success or failure.
4. Register the test in `Program.cs`.
