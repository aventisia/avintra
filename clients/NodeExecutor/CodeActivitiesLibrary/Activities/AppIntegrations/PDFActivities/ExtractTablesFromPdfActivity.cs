using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;
using UglyToad.PdfPig;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("Extract Tables From PDF")]
    [Description("Extracts tabular text from all pages of a PDF file.")]
    [ActivityMetaData(nodeImg:"/assets/PDF.svg")]
    public class ExtractTablesFromPdfActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("PDF File Path")]
        [Description("Path of the PDF file.")]
        public InArgument<string> PdfFilePath { get; set; }

        [DisplayName("Extracted Tables")]
        [Description("List of extracted DataTables.")]
        public OutArgument<List<DataTable>> ExtractedTables { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tables = new List<DataTable>();

            try
            {
                var pdfPath = PdfFilePath.Get(context);

                if (!File.Exists(pdfPath))
                    throw new FileNotFoundException("PDF file not found.", pdfPath);

                using (var document = PdfDocument.Open(pdfPath))
                {
                    foreach (var page in document.GetPages())
                    {
                        var table = new DataTable();

                        var lines = page.GetWords()
                            .GroupBy(w => Math.Round(w.BoundingBox.BottomLeft.Y, 2))
                            .OrderByDescending(g => g.Key)
                            .Select(g => g.OrderBy(w => w.BoundingBox.Left)
                                          .Select(w => w.Text)
                                          .ToArray())
                            .ToList();

                        if (!lines.Any())
                            continue;

                        // Create columns
                        int columnCount = lines.Max(l => l.Length);
                        for (int i = 0; i < columnCount; i++)
                        {
                            table.Columns.Add($"Column{i + 1}");
                        }

                        // Fill rows
                        foreach (var rowWords in lines)
                        {
                            var row = table.NewRow();
                            for (int i = 0; i < rowWords.Length; i++)
                            {
                                row[i] = rowWords[i];
                            }
                            table.Rows.Add(row);
                        }

                        if (table.Rows.Count > 0)
                            tables.Add(table);
                    }
                }

                ExtractedTables.Set(context, tables);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Extracted {tables.Count} table(s) from PDF.");
            }
            catch (Exception ex)
            {
                ExtractedTables.Set(context, new List<DataTable>());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error extracting tables: {ex.Message}");
            }
        }
    }
}
