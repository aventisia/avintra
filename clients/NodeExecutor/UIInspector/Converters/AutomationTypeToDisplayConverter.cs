using FlaUI.Core;
using System;
using System.Globalization;
using System.Windows.Data;

namespace UIInspector.Converters
{
    public class AutomationTypeToDisplayConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is AutomationType type)
            {
                switch (type)
                {
                    case AutomationType.UIA3:
                        return "Modern Mode (UIA3)";
                    case AutomationType.UIA2:
                        return "Classic Mode (UIA2)";
                    default:
                        return type.ToString();
                }
            }
            return value?.ToString() ?? "";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string str)
            {
                if (str.Contains("UIA3"))
                    return AutomationType.UIA3;
                if (str.Contains("UIA2"))
                    return AutomationType.UIA2;
            }
            return AutomationType.UIA3;
        }
    }
}