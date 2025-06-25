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
using System.Linq;
using System.Reflection;
using System.Windows.Input;
using UIInspector.Core;
using UIInspector.Models;

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

        public ObservableCollection<DetailGroupViewModel> SelectedItemDetails => SelectedItemInTree?.ItemDetails;

        public ObservableCollection<IdentificationPathStep> IdentificationPath { get; } = new ObservableCollection<IdentificationPathStep>();

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
                    Index = identificationPathVm[i].Index,
                    Name = elementName,
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
            OnPropertyChanged(() => SelectedItemDetails);
        }

        private void RefreshTree()
        {
            Elements.Clear();
            Initialize(SelectedAutomationType);
            IdentificationPath.Clear();
        }
    }
}
