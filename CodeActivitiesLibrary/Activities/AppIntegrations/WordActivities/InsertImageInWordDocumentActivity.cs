using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{

    [DisplayName("Insert Image in Word Document")]
    [Description("Inserts an image into a Word file.")]
    public class InsertImageInWordDocumentActivity : BaseCodeActivity
    {
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to use.")]
        [RequiredArgument]
        public InArgument<Word.Application> WordInstance { get; set; }

        [DisplayName("Insert Image To")]
        [Description("Specifies the location in the document where the image should be inserted.")]
        [DefaultValue(InsertLocationEnum.BeginningOfWordFile)]
        public InArgument<InsertLocationEnum> InsertImageTo { get; set; }

        [DisplayName("Insert Image From")]
        [Description("Specifies whether the image is from a file or clipboard.")]
        [DefaultValue(ImageSourceEnum.File)]
        public InArgument<ImageSourceEnum> InsertImageFrom { get; set; }

        [DisplayName("Image Path")]
        [Description("The file path of the image to insert.")]
        [RequiredArgument]
        public InArgument<string> ImagePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var insertLocation = context.GetValue(InsertImageTo);
                var imageSource = context.GetValue(InsertImageFrom);
                var imagePath = context.GetValue(ImagePath);

                if (wordApp == null)
                {
                    throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");
                }

                _Document activeDocument = wordApp.ActiveDocument;

                // Determine the insertion range based on InsertImageTo
                var insertionRange = GetInsertionRange(activeDocument, insertLocation);

                // Insert the image
                switch (imageSource)
                {
                    case ImageSourceEnum.File:
                        if (string.IsNullOrEmpty(imagePath))
                        {
                            throw new ArgumentException("ImagePath cannot be empty when inserting from File.");
                        }
                        insertionRange.InlineShapes.AddPicture(imagePath);
                        break;

                    case ImageSourceEnum.Clipboard:
                        insertionRange.Paste();
                        break;

                    default:
                        throw new ArgumentException("Invalid InsertImageFrom option.");
                }

                Console.WriteLine("Image inserted successfully.");
            }
            catch (Exception ex)
            {
                throw new Exception("Error inserting image into Word document:", ex);
            }
        }

        private static Range GetInsertionRange(_Document document, InsertLocationEnum location)
        {
            switch (location)
            {
                case InsertLocationEnum.BeginningOfWordFile:
                    return document.Content.Paragraphs[1].Range;

                case InsertLocationEnum.EndOfWordFile:
                    return document.Content;

                case InsertLocationEnum.BeforeBookmark:
                    // Placeholder: Implement bookmark handling
                    throw new NotImplementedException("BeforeBookmark is not implemented.");

                case InsertLocationEnum.AfterBookmark:
                    // Placeholder: Implement bookmark handling
                    throw new NotImplementedException("AfterBookmark is not implemented.");

                case InsertLocationEnum.BeforeSpecificText:
                    // Placeholder: Implement specific text handling
                    throw new NotImplementedException("BeforeSpecificText is not implemented.");

                case InsertLocationEnum.AfterSpecificText:
                    // Placeholder: Implement specific text handling
                    throw new NotImplementedException("AfterSpecificText is not implemented.");

                default:
                    throw new ArgumentException("Invalid InsertLocation option.");
            }
        }
    }
    public enum InsertLocationEnum
    {
        [Display(Name = "Beginning of Word file", Description = "Inserts content at the beginning of the document.")]
        BeginningOfWordFile,

        [Display(Name = "End of Word file", Description = "Inserts content at the end of the document.")]
        EndOfWordFile,

        [Display(Name = "Before Bookmark", Description = "Inserts content before the specified bookmark.")]
        BeforeBookmark,

        [Display(Name = "After Bookmark", Description = "Inserts content after the specified bookmark.")]
        AfterBookmark,

        [Display(Name = "Before Specific Text", Description = "Inserts content before a specific text in the document.")]
        BeforeSpecificText,

        [Display(Name = "After Specific Text", Description = "Inserts content after a specific text in the document.")]
        AfterSpecificText
    }
    public enum ImageSourceEnum
    {
        [Display(Name = "File", Description = "Inserts an image from a file path.")]
        File,

        [Display(Name = "Clipboard", Description = "Inserts an image from the system clipboard.")]
        Clipboard
    }

}