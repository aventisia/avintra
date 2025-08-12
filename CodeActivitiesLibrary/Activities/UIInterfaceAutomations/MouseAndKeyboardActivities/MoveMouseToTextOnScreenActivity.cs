namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities
{
    // [DisplayName("Move Mouse to Text on Screen (OCR)")]
    // [Description("Moves the mouse over a text found on the screen or on the foreground window using OCR.")]
    // [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/MouseAndKeyboard.svg")]
    // public class MoveMouseToTextOnScreenActivity : BaseCodeActivity
    // {
    //     // ----------------------
    //     // Input Arguments
    //     // ----------------------
    //
    //     [RequiredArgument]
    //     
    //     [DisplayName("OCR Engine Type")]
    //     [Description("Specifies the OCR engine to use for text recognition.")]
    //     public InArgument<OCREngineEnum> OCREngineType { get; set; }
    //
    //     [RequiredArgument]
    //     
    //     [DisplayName("Text to Find")]
    //     [Description("The text to search for on the screen or in the foreground window.")]
    //     public InArgument<string> TextToFind { get; set; }
    //
    //     
    //     [DisplayName("Is Regular Expression")]
    //     [Description("If true, treats 'Text to Find' as a regular expression.")]
    //     public InArgument<bool> IsRegularExpression { get; set; }
    //
    //     
    //     [DisplayName("Occurrence")]
    //     [Description("Which occurrence of the text to find (1-based index).")]
    //     [DefaultValue(1)]
    //     public InArgument<int> Occurrence { get; set; }
    //
    //     
    //     [DisplayName("Search Scope")]
    //     [Description("Specifies where to search for the text.")]
    //     [DefaultValue(SearchScopeEnum.EntireScreen)]
    //     public InArgument<SearchScopeEnum> SearchScope { get; set; }
    //
    //     
    //     [DisplayName("Search Mode")]
    //     [Description("Specifies how to search for the text within the selected scope.")]
    //     [DefaultValue(SearchModeEnum.WholeSource)]
    //     public InArgument<SearchModeEnum> SearchMode { get; set; }
    //
    //     
    //     [DisplayName("Move Mouse from Previous Position")]
    //     [Description("Specifies how the mouse should move to the target position.")]
    //     [DefaultValue(MouseMovementStyleEnum.Instant)]
    //     public InArgument<MouseMovementStyleEnum> MouseMovementStyle { get; set; }
    //
    //     
    //     [DisplayName("Use Other Language")]
    //     [Description("If true, specifies a custom language for Tesseract OCR.")]
    //     [RenderIfCondition(nameof(OCREngineType), OCREngineEnum.TesseractEngine)]
    //     public InArgument<bool> UseOtherLanguage { get; set; }
    //
    //     
    //     [DisplayName("Language Abbreviation")]
    //     [Description("The language abbreviation (e.g., 'en', 'fr') for Tesseract OCR.")]
    //     [RenderIfCondition(nameof(UseOtherLanguage), true)]
    //     public InArgument<string> LanguageAbbreviation { get; set; }
    //
    //     
    //     [DisplayName("Language Data Path")]
    //     [Description("The path to custom language data files for Tesseract OCR.")]
    //     [RenderIfCondition(nameof(LaunchWithUrl), true)]
    //     public InArgument<string> LanguageDataPath { get; set; }
    //
    //     
    //     [DisplayName("Image Width Multiplier")]
    //     [Description("Multiplier for image width (used for Tesseract OCR).")]
    //     [RenderIfCondition(nameof(OCREngineType), OCREngineEnum.TesseractEngine)]
    //     [DefaultValue(1)]
    //     public InArgument<double> ImageWidthMultiplier { get; set; }
    //
    //     
    //     [DisplayName("Image Height Multiplier")]
    //     [Description("Multiplier for image height (used for Tesseract OCR).")]
    //     [RenderIfCondition(nameof(OCREngineType), OCREngineEnum.TesseractEngine)]
    //     [DefaultValue(1)]
    //     public InArgument<double> ImageHeightMultiplier { get; set; }
    //
    //     
    //     [DisplayName("Wait for Text to Appear")]
    //     [Description("If true, waits for the text to appear before moving the mouse.")]
    //     public InArgument<bool> WaitForTextToAppear { get; set; }
    //
    //     
    //     [DisplayName("Fail Timeout")]
    //     [Description("Maximum time in seconds to wait for the text to appear.")]
    //     [RenderIfCondition(nameof(LaunchWithUrl), true)]
    //     public InArgument<int> FailTimeout { get; set; }
    //
    //     
    //     [DisplayName("Send a Click After Moving Mouse")]
    //     [Description("If true, sends a click after moving the mouse.")]
    //     public InArgument<bool> SendClickAfterMoving { get; set; }
    //
    //     
    //     [DisplayName("Click Type")]
    //     [Description("The type of click to perform after moving the mouse.")]
    //     [RenderIfCondition(nameof(LaunchWithUrl), true)]
    //     public InArgument<MoveMouseToImageActivity.ClickTypeEnum> ClickType { get; set; }
    //
    //     
    //     [DisplayName("Wait Before Clicking For")]
    //     [Description("Seconds to wait before clicking after moving the mouse.")]
    //     [RenderIfCondition(nameof(LaunchWithUrl), true)]
    //     public InArgument<int> WaitBeforeClickingFor { get; set; }
    //
    //     
    //     [DisplayName("Mouse Position Relative to Text")]
    //     [Description("Specifies the offset from the center of the found text.")]
    //     public InArgument<Point> MousePositionRelativeToText { get; set; }
    //
    //     // ----------------------
    //     // Output Arguments
    //     // ----------------------
    //
    //     
    //     [DisplayName("Status Message")]
    //     [Description("Returns status information about the operation.")]
    //     public OutArgument<string> StatusMessage { get; set; }
    //
    //     
    //     [DisplayName("Location of Text Found X")]
    //     [Description("The X-coordinate of the found text.")]
    //     public OutArgument<int> LocationOfTextFoundX { get; set; }
    //
    //     
    //     [DisplayName("Location of Text Found Y")]
    //     [Description("The Y-coordinate of the found text.")]
    //     public OutArgument<int> LocationOfTextFoundY { get; set; }
    //
    //     
    //     [DisplayName("Width of Text Found")]
    //     [Description("The width of the found text bounding box.")]
    //     public OutArgument<int> WidthOfTextFound { get; set; }
    //
    //     
    //     [DisplayName("Height of Text Found")]
    //     [Description("The height of the found text bounding box.")]
    //     public OutArgument<int> HeightOfTextFound { get; set; }
    //
    //     // ----------------------
    //     // Execution Logic
    //     // ----------------------
    //     protected override void Execute(CodeActivityContext context)
    //     {
    //         string status = "Operation completed successfully.";
    //         int x = 0, y = 0, width = 0, height = 0;
    //
    //         try
    //         {
    //             var ocrEngineType = OCREngineType.Get(context);
    //             var textToFind = TextToFind.Get(context);
    //             var isRegex = IsRegularExpression.Get(context);
    //             var occurrence = Occurrence.Get(context);
    //             var searchScope = SearchScope.Get(context);
    //             var searchMode = SearchMode.Get(context);
    //             var movementStyle = MouseMovementStyle.Get(context);
    //             var useOtherLanguage = UseOtherLanguage.Get(context);
    //             var languageAbbreviation = LanguageAbbreviation.Get(context);
    //             var languageDataPath = LanguageDataPath.Get(context);
    //             var imageWidthMultiplier = ImageWidthMultiplier.Get(context);
    //             var imageHeightMultiplier = ImageHeightMultiplier.Get(context);
    //             var waitForText = WaitForTextToAppear.Get(context);
    //             var failTimeout = FailTimeout.Get(context);
    //             var sendClick = SendClickAfterMoving.Get(context);
    //             var clickType = ClickType.Get(context);
    //             var waitBeforeClick = WaitBeforeClickingFor.Get(context);
    //             var mouseOffset = MousePositionRelativeToText.Get(context);
    //
    //             if (string.IsNullOrEmpty(textToFind))
    //             {
    //                 throw new ArgumentException("Text to find cannot be null or empty.");
    //             }
    //
    //             if (occurrence < 1)
    //             {
    //                 throw new ArgumentOutOfRangeException(nameof(occurrence), "Occurrence must be at least 1.");
    //             }
    //
    //             // Perform OCR based on selected engine
    //             switch (ocrEngineType)
    //             {
    //                 case OCREngineEnum.WindowsOCR:
    //                     // Use Windows OCR engine
    //                     break;
    //
    //                 case OCREngineEnum.Tesseract:
    //                     // Use Tesseract engine
    //                     break;
    //
    //                 default:
    //                     throw new ArgumentOutOfRangeException(nameof(ocrEngineType));
    //             }
    //
    //             // Handle search scope and mode
    //             Rectangle? searchArea = null;
    //             switch (searchScope)
    //             {
    //                 case SearchScopeEnum.EntireScreen:
    //                     searchArea = CaptureFullScreen();
    //                     break;
    //
    //                 case SearchScopeEnum.ForegroundWindowOnly:
    //                     searchArea = CaptureForegroundWindow();
    //                     break;
    //
    //                 case SearchScopeEnum.SpecificSubregion:
    //                     searchArea = new Rectangle(x1, y1, x2 - x1, y2 - y1);
    //                     break;
    //
    //                 case SearchScopeEnum.SubregionRelativeToImage:
    //                     if (string.IsNullOrEmpty(imagePath))
    //                     {
    //                         throw new ArgumentException(
    //                             "Image path cannot be null or empty when using 'Subregion Relative to Image'.");
    //                     }
    //
    //                     searchArea = LocateImageOnScreen(imagePath, tolerance);
    //                     break;
    //
    //                 default:
    //                     throw new ArgumentOutOfRangeException(nameof(searchScope));
    //             }
    //
    //             // Perform OCR and locate text
    //             var textLocations = PerformOCR(searchArea.Value, textToFind, isRegex, occurrence);
    //
    //             if (textLocations.Count >= occurrence)
    //             {
    //                 var location = textLocations[occurrence - 1];
    //                 x = location.X + mouseOffset.X;
    //                 y = location.Y + mouseOffset.Y;
    //                 width = location.Width;
    //                 height = location.Height;
    //
    //                 // Move the mouse
    //                 MoveMouse(x, y, movementStyle);
    //
    //                 status = $"Moved mouse to text '{textToFind}' at ({x}, {y})";
    //
    //                 // Optionally send a click
    //                 if (sendClick)
    //                 {
    //                     PerformClick(clickType, x, y, waitBeforeClick);
    //                 }
    //             }
    //             else
    //             {
    //                 status = $"Text '{textToFind}' not found.";
    //             }
    //         }
    //         catch (Exception ex)
    //         {
    //             status = $"Error moving mouse to text: {ex.Message}";
    //         }
    //
    //         StatusMessage.Set(context, status);
    //         LocationOfTextFoundX.Set(context, x);
    //         LocationOfTextFoundY.Set(context, y);
    //         WidthOfTextFound.Set(context, width);
    //         HeightOfTextFound.Set(context, height);
    //     }
    //
    //     private static List<Rectangle> PerformOCR(Rectangle searchArea, string textToFind, bool isRegex, int occurrence)
    //     {
    //         // Placeholder for OCR logic
    //         return new List<Rectangle>();
    //     }
    //
    //     private static Rectangle? LocateImageOnScreen(string imagePath, int tolerance)
    //     {
    //         // Placeholder for image matching logic
    //         return null;
    //     }
    //
    //     private static void MoveMouse(int x, int y, MouseMovementStyleEnum movementStyle)
    //     {
    //         switch (movementStyle)
    //         {
    //             case MouseMovementStyleEnum.Instant:
    //                 SetCursorPosition(x, y);
    //                 break;
    //
    //             case MouseMovementStyleEnum.AnimationLowSpeed:
    //                 AnimateMouseMove(x, y, 10); // Slow speed
    //                 break;
    //
    //             case MouseMovementStyleEnum.AnimationNormalSpeed:
    //                 AnimateMouseMove(x, y, 5); // Normal speed
    //                 break;
    //
    //             case MouseMovementStyleEnum.AnimationHighSpeed:
    //                 AnimateMouseMove(x, y, 2); // Fast speed
    //                 break;
    //
    //             default:
    //                 throw new ArgumentOutOfRangeException(nameof(movementStyle));
    //         }
    //     }
    //
    //     private static void AnimateMouseMove(int targetX, int targetY, int stepDelay)
    //     {
    //         var currentPoint = Cursor.Position;
    //         var deltaX = targetX - currentPoint.X;
    //         var deltaY = targetY - currentPoint.Y;
    //
    //         for (int i = 0; i < Math.Max(Math.Abs(deltaX), Math.Abs(deltaY)); i++)
    //         {
    //             var newX = currentPoint.X + (i * Math.Sign(deltaX));
    //             var newY = currentPoint.Y + (i * Math.Sign(deltaY));
    //
    //             SetCursorPosition(newX, newY);
    //             Thread.Sleep(stepDelay);
    //         }
    //
    //         SetCursorPosition(targetX, targetY);
    //     }
    //
    //     [DllImport("user32.dll")]
    //     private static extern bool SetCursorPos(int x, int y);
    //
    //     private static void SetCursorPosition(int x, int y)
    //     {
    //         SetCursorPos(x, y);
    //     }
    //
    //     private static Bitmap CaptureFullScreen()
    //     {
    //         var bounds = Screen.PrimaryScreen.Bounds;
    //         var screenshot = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb);
    //
    //         using (var graphics = Graphics.FromImage(screenshot))
    //         {
    //             graphics.CopyFromScreen(bounds.X, bounds.Y, 0, 0, bounds.Size, CopyPixelOperation.SourceCopy);
    //         }
    //
    //         return screenshot;
    //     }
    //
    //     private static Bitmap CaptureForegroundWindow()
    //     {
    //         // Placeholder for capturing foreground window
    //         return null;
    //     }
    // }
    //
    // public enum OCREngineEnum
    // {
    //     [Display(Name = "Windows OCR engine", Description = "Uses the built-in Windows OCR engine.")]
    //     WindowsOCR,
    //
    //     [Display(Name = "Tesseract engine", Description = "Uses the Tesseract OCR engine.")]
    //     Tesseract
    // }
    //
    // public enum SearchScopeEnum
    // {
    //     [Display(Name = "Entire screen", Description = "Searches the entire screen.")]
    //     EntireScreen,
    //
    //     [Display(Name = "Foreground window only", Description = "Searches only the active window.")]
    //     ForegroundWindowOnly,
    //
    //     [Display(Name = "Specific subregion", Description = "Searches a specified subregion of the screen.")]
    //     SpecificSubregion,
    //
    //     [Display(Name = "Subregion relative to image", Description = "Searches a subregion relative to an image.")]
    //     SubregionRelativeToImage
    // }
    //
    // public enum SearchModeEnum
    // {
    //     [Display(Name = "Whole of specified source", Description = "Searches the entire source.")]
    //     WholeSource,
    //
    //     [Display(Name = "Specific subregion only", Description = "Searches a specific subregion.")]
    //     SpecificSubregion,
    //
    //     [Display(Name = "Subregion relative to image", Description = "Searches a subregion relative to an image.")]
    //     SubregionRelativeToImage
    // }
    //
    // public enum MouseMovementStyleEnum
    // {
    //     [Display(Name = "Instant", Description = "Moves the mouse instantly to the target position.")]
    //     Instant,
    //
    //     [Display(Name = "With animation (low speed)", Description = "Moves the mouse with low speed animation.")]
    //     AnimationLowSpeed,
    //
    //     [Display(Name = "With animation (normal speed)", Description = "Moves the mouse with normal speed animation.")]
    //     AnimationNormalSpeed,
    //
    //     [Display(Name = "With animation (high speed)", Description = "Moves the mouse with high speed animation.")]
    //     AnimationHighSpeed
    // }
}