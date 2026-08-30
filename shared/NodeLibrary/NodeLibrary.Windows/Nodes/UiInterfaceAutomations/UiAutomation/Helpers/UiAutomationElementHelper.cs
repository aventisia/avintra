using NodeLibrary.UiAutomationNodes.Enums;
using FlaUI.Core.AutomationElements;
using FlaUI.UIA3;

namespace NodeLibrary.UiAutomationNodes.Helpers;

public class IdentificationObject
{
    public string? Index { get; set; }
    public string? Name { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public NameMatchModeEnum NameMatchMode { get; set; } = NameMatchModeEnum.Equals;
    public string? ClassName { get; set; }
    public string? ControlType { get; set; }
    public string? FrameworkId { get; set; }
    public string? AutomationId { get; set; }
}

public static class UiAutomationElementHelper
{
    public static bool IsIdentificationObjectEmpty(IdentificationObject identificationObject)
    {
        // Check if all properties of the identification object are null or empty
        return string.IsNullOrEmpty(identificationObject.Index) &&
               string.IsNullOrEmpty(identificationObject.Name) &&
               string.IsNullOrEmpty(identificationObject.ClassName) &&
               string.IsNullOrEmpty(identificationObject.ControlType) &&
               string.IsNullOrEmpty(identificationObject.FrameworkId) &&
               string.IsNullOrEmpty(identificationObject.AutomationId);
    }

    public static string? GetPropertyValue(AutomationElement element, PropertyTypeEnum propertyName)
    {
        // Return null if element or propertyName is null
        if (element == null)
            return null;

        try
        {
            // Get the property value based on the property name
            switch (propertyName)
            {
                case PropertyTypeEnum.Name:
                    return element.Properties.Name.ValueOrDefault?.Trim();
                case PropertyTypeEnum.ClassName:
                    return element.Properties.ClassName.ValueOrDefault?.Trim();
                case PropertyTypeEnum.ControlType:
                    return element.ControlType.ToString().Trim();
                case PropertyTypeEnum.FrameworkId:
                    return element.Properties.FrameworkId.ValueOrDefault?.Trim();
                case PropertyTypeEnum.AutomationId:
                    return element.Properties.AutomationId.ValueOrDefault?.Trim();
                default:
                    return null; // Unknown property
            }
        }
        catch
        {
            // Optionally log or handle exception
            return null;
        }
    }

    public static AutomationElement? FindChildElement(AutomationElement parent, IdentificationObject identificationObject)
    {
        // Return null if parent or identificationObject is null
        if (parent == null || identificationObject == null)
            return null;

        // identificationObject should have at least one property set
        if (IsIdentificationObjectEmpty(identificationObject))
            return null;

        // Find all children of the parent element
        var children = parent.FindAllChildren();

        // If no children found, return null
        if (children == null || children.Count() == 0)
            return null;

        // Iterate through each child and check if it matches the identification criteria
        int index = 0;
        foreach (var child in children)
        {
            // Get and Trim the properties to avoid leading/trailing whitespace issues
            var name = GetPropertyValue(child, PropertyTypeEnum.Name);
            var className = GetPropertyValue(child, PropertyTypeEnum.ClassName);
            var controlType = GetPropertyValue(child, PropertyTypeEnum.ControlType);
            var frameworkId = GetPropertyValue(child, PropertyTypeEnum.FrameworkId);
            var automationId = GetPropertyValue(child, PropertyTypeEnum.AutomationId);

            // Check if the child matches the identification criteria
            bool isMatch = true;
            if (!string.IsNullOrEmpty(identificationObject.Index) && index.ToString() != identificationObject.Index.Trim())
                isMatch = false;
            if (!string.IsNullOrEmpty(identificationObject.Name))
            {
                var trimmedIdentificationName = identificationObject.Name.Trim();
                switch (identificationObject.NameMatchMode)
                {
                    case NameMatchModeEnum.Equals:
                        if (name != trimmedIdentificationName)
                            isMatch = false;
                        break;
                    case NameMatchModeEnum.Contains:
                        if (name == null || !name.Contains(trimmedIdentificationName))
                            isMatch = false;
                        break;
                    case NameMatchModeEnum.StartsWith:
                        if (name == null || !name.StartsWith(trimmedIdentificationName))
                            isMatch = false;
                        break;
                }
            }
            if (!string.IsNullOrEmpty(identificationObject.ClassName) && className != identificationObject.ClassName.Trim())
                isMatch = false;
            if (!string.IsNullOrEmpty(identificationObject.ControlType) && controlType != identificationObject.ControlType.Trim())
                isMatch = false;
            if (!string.IsNullOrEmpty(identificationObject.FrameworkId) && frameworkId != identificationObject.FrameworkId.Trim())
                isMatch = false;
            if (!string.IsNullOrEmpty(identificationObject.AutomationId) && automationId != identificationObject.AutomationId.Trim())
                isMatch = false;

            // Increment index
            index++;

            // If all criteria match, return the child element
            if (isMatch)
                return child;
        }

        return null; // No matching child found
    }

    public static AutomationElement? GetElementByPath(List<IdentificationObject> path, int maxWaitTime = 0)
    {
        // Get the window by using the first identification object in the path
        if (path == null || path.Count == 0)
            return null;

        // Start with the desktop element
        using (var automation = new UIA3Automation())
        {
            // Get the root element (desktop)
            var rootElement = automation.GetDesktop();

            // Root element is null
            if (rootElement == null)
                return null;

            // Start traversing the path
            AutomationElement currentElement = rootElement;
            foreach (var identificationObject in path)
            {
                AutomationElement? foundChild = null;

                // If maxWaitTime is 0 then try only once
                var retryCount = maxWaitTime > 0 ? maxWaitTime * 2 : 1;

                // If maxWaitTime is greater than 0, sleep time 500ms between retries else 0ms 
                var sleepTime = maxWaitTime > 0 ? 500 : 0;

                for (int i = 0; i <= retryCount; i++)
                {
                    // Find the matching child of the current element
                    try
                    {
                        foundChild = FindChildElement(currentElement, identificationObject);
                    }
                    catch
                    {
                        Thread.Sleep(sleepTime);
                    }

                    // If the element is not found, wait and retry
                    if (foundChild == null)
                    {
                        Thread.Sleep(sleepTime);
                    }
                    else
                    {
                        currentElement = foundChild; // Move to next level
                        break;
                    }
                }

                // Could not find the element in the current level
                if (foundChild == null)
                    return null;
            }

            return currentElement; // The final element found (or null if any step failed)
        }
    }

    public static List<IdentificationObject> ConvertIdentificationObjectPath(string? identificationObjectPath)
    {
        // If the string is null or empty, return an empty list
        if (string.IsNullOrEmpty(identificationObjectPath))
            return new List<IdentificationObject>();

        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // allows case-insensitive matching
            };

            // Try to deserialize as a list
            var list = JsonSerializer.Deserialize<List<IdentificationObject>>(identificationObjectPath, options);
            if (list != null)
                return list;

            // If not a list, try to deserialize as a single object
            var single = JsonSerializer.Deserialize<IdentificationObject>(identificationObjectPath, options);
            if (single != null)
                return new List<IdentificationObject> { single };
        }
        catch
        {
            // Optionally log or handle the exception
        }

        // If deserialization fails, return an empty list
        return new List<IdentificationObject>();
    }
}