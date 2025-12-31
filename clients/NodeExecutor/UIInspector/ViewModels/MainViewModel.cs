using FlaUI.Core;
using FlaUI.Core.AutomationElements;
using FlaUI.UIA2;
using FlaUI.UIA3;
using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Drawing.Imaging;
using System.Reflection;
using System.Windows.Input;
using UIInspector.Core;
using UIInspector.Models;
using System.Text.Json;
using System.Linq;
using System.Windows;
using FlaUI.Core.Definitions;
using System.Threading;

namespace UIInspector.ViewModels
{
    public class MainViewModel : ObservableObject
    {
        private HoverMode _hoverMode;
        private FocusTrackingMode _focusTrackingMode;
        private ITreeWalker _treeWalker;
        private AutomationBase _automation;
        private AutomationElement _rootElement;

        public MainViewModel()
        {
            Elements = new ObservableCollection<ElementViewModel>();
            StartNewInstanceCommand = new RelayCommand(o =>
            {
                var info = new ProcessStartInfo(Assembly.GetExecutingAssembly().Location);
                Process.Start(info);
            });
            CaptureSelectedItemCommand = new RelayCommand(o =>
            {
                if (SelectedItemInTree == null)
                {
                    return;
                }
                var capturedImage = SelectedItemInTree.AutomationElement.Capture();
                var saveDialog = new SaveFileDialog();
                saveDialog.Filter = "Png file (*.png)|*.png";
                if (saveDialog.ShowDialog() == true)
                {
                    capturedImage.Save(saveDialog.FileName, ImageFormat.Png);
                }
                capturedImage.Dispose();
            });
            RefreshCommand = new RelayCommand(o =>
            {
                RefreshTree();
            });
            CopyIdentificationPathJsonCommand = new RelayCommand(o =>
            {
                var json = GetIdentificationPathAsJson();
                System.Windows.Clipboard.SetText(json); // Copies JSON to clipboard
            });
        }

        public bool IsInitialized
        {
            get { return GetProperty<bool>(); }
            private set { SetProperty(value); }
        }

        public bool EnableHoverMode
        {
            get { return GetProperty<bool>(); }
            set
            {
                if (SetProperty(value))
                {
                    if (value) { _hoverMode.Start(); }
                    else { _hoverMode.Stop(); }
                }
            }
        }

        public bool EnableFocusTrackingMode
        {
            get { return GetProperty<bool>(); }
            set
            {
                if (SetProperty(value))
                {
                    if (value) { _focusTrackingMode.Start(); }
                    else { _focusTrackingMode.Stop(); }
                }
            }
        }

        public bool EnableXPath
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public bool KeepWindowOnTop
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public AutomationType SelectedAutomationType
        {
            get => _selectedAutomationType;
            set
            {
                if (_selectedAutomationType != value)
                {
                    _selectedAutomationType = value;
                    OnPropertyChanged();
                    Elements.Clear();
                    Initialize(_selectedAutomationType);
                }
            }
        }

        public ObservableCollection<AutomationType> AutomationTypes { get; } = new ObservableCollection<AutomationType> { AutomationType.UIA3, AutomationType.UIA2 };

        private AutomationType _selectedAutomationType = AutomationType.UIA3;

        public ObservableCollection<ElementViewModel> Elements { get; private set; }

        public ICommand StartNewInstanceCommand { get; private set; }

        public ICommand CaptureSelectedItemCommand { get; private set; }

        public ICommand RefreshCommand { get; private set; }

        public ICommand CopyIdentificationPathJsonCommand { get; private set; }

        public event Action RequestTreeScrollReset;

        public ObservableCollection<DetailGroupViewModel> SelectedItemDetails => SelectedItemInTree?.ItemDetails;

        public ObservableCollection<IdentificationPathStep> IdentificationPath { get; } = new ObservableCollection<IdentificationPathStep>();

        public ObservableCollection<SupportedPatternViewModel> SupportedPatterns { get; } = new ObservableCollection<SupportedPatternViewModel>();

        public ElementViewModel SelectedItemInTree
        {
            get { return GetProperty<ElementViewModel>(); }
            private set { SetProperty(value); }
        }

        public void Initialize(AutomationType selectedAutomationType)
        {
            SelectedAutomationType = selectedAutomationType;
            EnableXPath = true;
            IsInitialized = true;

            _automation = selectedAutomationType == AutomationType.UIA2 ? (AutomationBase)new UIA2Automation() : new UIA3Automation();
            _rootElement = _automation.GetDesktop();
            var desktopViewModel = new ElementViewModel(_rootElement);
            desktopViewModel.SelectionChanged += DesktopViewModel_SelectionChanged;
            desktopViewModel.LoadChildren(false);
            Elements.Add(desktopViewModel);
            Elements[0].IsExpanded = true;

            // Initialize TreeWalker
            _treeWalker = _automation.TreeWalkerFactory.GetControlViewWalker();

            // Initialize hover
            _hoverMode = new HoverMode(_automation);
            _hoverMode.ElementHovered += ElementToSelectChanged;

            // Initialize focus tracking
            _focusTrackingMode = new FocusTrackingMode(_automation);
            _focusTrackingMode.ElementFocused += ElementToSelectChanged;
        }

        public string GetIdentificationPathAsJson()
        {
            var filtered = IdentificationPath.ToList()
                .Select(step =>
                {
                    var obj = new Dictionary<string, object>();

                    if (step.IsIndexSelected && !string.IsNullOrEmpty(step.Index))
                        obj["index"] = step.Index;
                    if (step.IsNameSelected && !string.IsNullOrEmpty(step.Name))
                        obj["name"] = step.Name;
                    if (step.IsClassNameSelected && !string.IsNullOrEmpty(step.ClassName))
                        obj["className"] = step.ClassName;
                    if (step.IsControlTypeSelected && !string.IsNullOrEmpty(step.ControlType))
                        obj["controlType"] = step.ControlType;
                    if (step.IsFrameworkIdSelected && !string.IsNullOrEmpty(step.FrameworkId))
                        obj["frameworkId"] = step.FrameworkId;
                    if (step.IsAutomationIdSelected && !string.IsNullOrEmpty(step.AutomationId))
                        obj["automationId"] = step.AutomationId;
                    // If you want to include NameMatchMode only if Name is selected:
                    if (step.IsNameSelected && step.NameMatchMode != NameMatchModeEnum.Equals)
                        obj["nameMatchMode"] = step.NameMatchMode.ToString();

                    return obj;
                }).ToList();

            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            return JsonSerializer.Serialize(filtered, options);
        }

        public void ElementToSelectChanged(AutomationElement obj)
        {
            // Build a stack from the root to the hovered item
            var pathToRoot = new Stack<AutomationElement>();
            while (obj != null)
            {
                // Break on circular relationship (should not happen?)
                if (pathToRoot.Contains(obj) || obj.Equals(_rootElement)) { break; }

                pathToRoot.Push(obj);
                try
                {
                    obj = _treeWalker.GetParent(obj);
                }
                catch (Exception ex)
                {
                    // TODO: Log
                    Console.WriteLine($"Exception: {ex.Message}");
                }
            }

            // Expand the root element if needed
            if (!Elements[0].IsExpanded)
            {
                Elements[0].IsExpanded = true;
                System.Threading.Thread.Sleep(1000);
            }

            var elementVm = Elements[0];
            var identificationPathVm = new List<ElementViewModel>(); // This will hold the path to the element 
            while (pathToRoot.Count > 0)
            {
                var elementOnPath = pathToRoot.Pop();
                var nextElementVm = FindElement(elementVm, elementOnPath);
                if (nextElementVm == null)
                {
                    // Could not find next element, try reloading the parent
                    elementVm.LoadChildren(true);
                    // Now search again
                    nextElementVm = FindElement(elementVm, elementOnPath);
                    if (nextElementVm == null)
                    {
                        // The next element is still not found, exit the loop
                        Console.WriteLine("Could not find the next element!");
                        break;
                    }
                }
                elementVm = nextElementVm;
                if (!elementVm.IsExpanded)
                {
                    elementVm.IsExpanded = true;
                }
                identificationPathVm.Add(elementVm); // Collect the path as you go
            }
            // Select the last element
            elementVm.IsSelected = true;

            // Update IdentificationPath here
            IdentificationPath.Clear();
            for (int i = 0; i < identificationPathVm.Count; i++)
            {
                var elementName = identificationPathVm[i].AutomationElement.Properties.Name.ValueOrDefault;
                var elementControlType = identificationPathVm[i].ControlType.ToString();
                var pathHeading = !string.IsNullOrEmpty(elementName) ? $"{i} - {elementName} {elementControlType.ToLower()}" : $"{i} - {elementControlType} element";

                var step = new IdentificationPathStep
                {
                    PathHeading = pathHeading,
                    Index = i == 0 ? null : identificationPathVm[i].Index.ToString(),
                    IsIndexSelected = i != 0 && string.IsNullOrWhiteSpace(elementName), // index is not selected for the root element and if the name is not set
                    Name = elementName,
                    OriginalName = elementName,
                    NameMatchMode = NameMatchModeEnum.Equals, // Default to Equals, can be changed later
                    ClassName = identificationPathVm[i].AutomationElement.Properties.ClassName.ValueOrDefault,
                    ControlType = elementControlType,
                    FrameworkId = identificationPathVm[i].AutomationElement.Properties.FrameworkId.ValueOrDefault,
                    AutomationId = identificationPathVm[i].AutomationElement.Properties.AutomationId.ValueOrDefault
                };
                IdentificationPath.Add(step);
            }
        }

        private ElementViewModel FindElement(ElementViewModel parent, AutomationElement element)
        {
            for (int i = 0; i < parent.Children.Count; i++)
            {
                var child = parent.Children[i];
                if (child.AutomationElement.Equals(element))
                {
                    // Set the index of the found element
                    child.Index = i;
                    return child;
                }
                // Recursively search in children
                var elementVm = FindElement(child, element);
                if (elementVm != null)
                {
                    return elementVm;
                }
            }
            return null;
        }

        private void DesktopViewModel_SelectionChanged(ElementViewModel obj)
        {
            SelectedItemInTree = obj;
            UpdateSupportedPatterns();
            OnPropertyChanged(() => SelectedItemDetails);
        }

        private void RefreshTree()
        {
            Elements.Clear();
            SelectedItemInTree = null;
            Initialize(SelectedAutomationType);
            IdentificationPath.Clear();
            RequestTreeScrollReset?.Invoke();
        }

        private void UpdateSupportedPatterns()
        {
            SupportedPatterns.Clear();
            if (SelectedItemInTree?.AutomationElement == null)
                return;

            var element = SelectedItemInTree.AutomationElement;

            // InvokePattern
            if (element.Patterns.Invoke.IsSupported)
            {
                SupportedPatterns.Add(new SupportedPatternViewModel
                {
                    SupportedAction = SupportedActionType.Invoke,
                    ActionName = "Click / Invoke Element",
                    TestCommand = new RelayCommand(_ => TestPattern(SupportedActionType.Invoke, element))
                });
            }

            // ValuePattern
            if (element.Patterns.Value.IsSupported)
            {
                // SetValue
                var patternVm = new SupportedPatternViewModel
                {
                    SupportedAction = SupportedActionType.SetValue,
                    ActionName = "Set Value",
                    ValueToSet = "Test Value",
                };
                patternVm.TestCommand = new RelayCommand(_ => TestPattern(SupportedActionType.SetValue, element, patternVm.ValueToSet));
                SupportedPatterns.Add(patternVm);

                // GetValue
                SupportedPatterns.Add(new SupportedPatternViewModel
                {
                    SupportedAction = SupportedActionType.GetValue,
                    ActionName = "Get Value",
                    TestCommand = new RelayCommand(_ => TestPattern(SupportedActionType.GetValue, element))
                });
            }

            // SelectionItemPattern
            if (element.Patterns.SelectionItem.IsSupported)
            {
                SupportedPatterns.Add(new SupportedPatternViewModel
                {
                    SupportedAction = SupportedActionType.Select,
                    ActionName = "Select item",
                    TestCommand = new RelayCommand(_ => TestPattern(SupportedActionType.Select, element))
                });
            }

            // TogglePattern
            if (element.Patterns.Toggle.IsSupported)
            {
                SupportedPatterns.Add(new SupportedPatternViewModel
                {
                    SupportedAction = SupportedActionType.Toggle,
                    ActionName = "Toggle state",
                    TestCommand = new RelayCommand(_ => TestPattern(SupportedActionType.Toggle, element))
                });
            }

            // ExpandCollapsePattern
            if (element.Patterns.ExpandCollapse.IsSupported)
            {
                SupportedPatterns.Add(new SupportedPatternViewModel
                {
                    SupportedAction = SupportedActionType.ExpandOrCollapse,
                    ActionName = "Expand or Collapse",
                    TestCommand = new RelayCommand(_ => TestPattern(SupportedActionType.ExpandOrCollapse, element))
                });
            }

            // ItemContainerPattern
            if (element.Patterns.ItemContainer.IsSupported)
            {
                var patternVm = new SupportedPatternViewModel
                {
                    SupportedAction = SupportedActionType.ItemContainer,
                    ActionName = "Select item in List",
                    ValueToSet = "0",
                };
                patternVm.TestCommand = new RelayCommand(_ => TestPattern(SupportedActionType.ItemContainer, element, patternVm.ValueToSet));
                SupportedPatterns.Add(patternVm);
            }
        }

        private void TestPattern(SupportedActionType supportedAction, AutomationElement targetElement, string value = null)
        {
            try
            {


                // NOTE: We'll not check whether patterns are supported here, as this is already done.

                // Validate the target element
                if (targetElement == null)
                {
                    MessageBox.Show("No element selected to perform action on.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                if (!targetElement.Properties.IsEnabled.ValueOrDefault && !targetElement.Properties.IsKeyboardFocusable.ValueOrDefault)
                {
                    MessageBox.Show("Element is not enabled or focusable, cannot perform action.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                // Take action based on the supported action type
                switch (supportedAction)
                {
                    case SupportedActionType.Invoke:
                        targetElement.Patterns.Invoke.PatternOrDefault?.Invoke();
                        break;
                    case SupportedActionType.Select:
                        var selectionItemPattern = targetElement.Patterns.SelectionItem.PatternOrDefault;
                        if (selectionItemPattern != null)
                        {
                            selectionItemPattern.Select();
                            // Try to invoke the element after selection
                            var invokePattern = targetElement.Patterns.Invoke.PatternOrDefault;
                            if (invokePattern != null)
                                invokePattern.Invoke();
                            else
                            {
                                // Mouse click if invoke pattern is not available
                                targetElement.Focus();
                                Thread.Sleep(500);
                                // FlaUI: Click() will move the mouse and click the element's clickable point
                                targetElement.Click();
                            }
                        }
                        break;
                    case SupportedActionType.SetValue:
                        targetElement.Patterns.Value.PatternOrDefault?.SetValue(value ?? "");
                        break;
                    case SupportedActionType.GetValue:
                        MessageBox.Show($"Current value: {targetElement.Patterns.Value.PatternOrDefault?.Value}", "Value", MessageBoxButton.OK, MessageBoxImage.Information);
                        break;
                    case SupportedActionType.Toggle:
                        targetElement.Patterns.Toggle.PatternOrDefault?.Toggle();
                        break;
                    case SupportedActionType.ExpandOrCollapse:
                        // Get current state
                        var currentState = targetElement.Patterns.ExpandCollapse.PatternOrDefault?.ExpandCollapseState;

                        // If already expanded, collapse
                        if (currentState == FlaUI.Core.Definitions.ExpandCollapseState.Expanded)
                            targetElement.Patterns.ExpandCollapse.PatternOrDefault?.Collapse();
                        else
                            targetElement.Patterns.ExpandCollapse.PatternOrDefault?.Expand();
                        break;
                    case SupportedActionType.ItemContainer:
                        SelectItemInList(targetElement, value ?? "0");
                        break;
                    default:
                        MessageBox.Show($"Unsupported action type: {supportedAction.ToString()}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                        break;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error while testing pattern: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }
        }

        private void SelectItemInList(AutomationElement listElement, string itemNameOrIndex)
        {
            try
            {
                string statusMessage = "";
                for (int i = 1; i <= 5; i++)
                {
                    try
                    {
                        // Try to expand the element if it supports ExpandCollapsePattern
                        var expandCollapsePattern = listElement.Patterns.ExpandCollapse.PatternOrDefault;
                        if (expandCollapsePattern != null && expandCollapsePattern.ExpandCollapseState.Value != ExpandCollapseState.Expanded)
                        {
                            expandCollapsePattern.Expand();
                            Thread.Sleep(200);
                            continue;
                        }

                        // Find all list items (options)
                        var listItems = listElement.FindAllDescendants(cf =>
                                                                            cf.ByControlType(ControlType.ListItem)
                                                                            .Or(cf.ByControlType(ControlType.DataItem))
                                                                            .Or(cf.ByControlType(ControlType.TreeItem))
                                                                            .Or(cf.ByControlType(ControlType.MenuItem))
                                                                        );
                        AutomationElement itemToSelect = null;

                        // Try to parse as index
                        if (int.TryParse(itemNameOrIndex, out int optionIndex))
                        {
                            if (optionIndex >= 0 && optionIndex < listItems.Length)
                            {
                                itemToSelect = listItems[optionIndex];
                            }
                            else
                            {
                                statusMessage = $"Index {optionIndex} is out of range for the drop-down options.";
                            }
                        }
                        else
                        {
                            // Select by name (case-insensitive)
                            foreach (var item in listItems)
                            {
                                if (item.Name.Equals(itemNameOrIndex, StringComparison.OrdinalIgnoreCase))
                                {
                                    itemToSelect = item;
                                    break;
                                }
                            }
                            if (itemToSelect == null)
                            {
                                statusMessage = $"Could not find an item named '{itemNameOrIndex}' in the list.";
                            }
                        }

                        if (itemToSelect != null)
                        {
                            var selectionItemPattern = itemToSelect.Patterns.SelectionItem.PatternOrDefault;
                            if (selectionItemPattern != null)
                            {
                                selectionItemPattern.Select();
                                MessageBox.Show($"Selected item: {itemToSelect.Name}", "Item Selected", MessageBoxButton.OK, MessageBoxImage.Information);
                                return;
                            }
                            else
                            {
                                statusMessage = "The selected item does not support selection.";
                            }
                        }
                        else
                        {
                            statusMessage = string.IsNullOrEmpty(statusMessage) ? "No item selected." : statusMessage;
                        }

                        // Optionally collapse the drop-down after selection
                        if (expandCollapsePattern != null && expandCollapsePattern.ExpandCollapseState.Value == ExpandCollapseState.Expanded)
                        {
                            expandCollapsePattern.Collapse();
                        }
                    }
                    catch
                    {
                        Thread.Sleep(400);
                    }

                    MessageBox.Show(statusMessage, "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error while selecting item in list: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }
        }
    }
}
