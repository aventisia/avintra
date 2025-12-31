using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Read Formula from Excel Cell")]
    [Description("Reads the formula from a specific cell or named range in Excel.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class ReadFormulaFromExcelActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object from which the formula will be read. If not provided, the active worksheet will be used.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Reference Type")]
        [Description("Specifies whether to reference by cell address or named range.")]
        [DefaultValue(CellReferenceTypeEnum.CellAddress)]
        public InArgument<CellReferenceTypeEnum> ReferenceType { get; set; }

        [DisplayName("Cell Address")]
        [Description("The address of the cell to read (e.g., 'A1', 'B2').")]
        [RenderIfCondition(nameof(ReferenceType), CellReferenceTypeEnum.CellAddress)]
        public InArgument<string> CellAddress { get; set; }

        [DisplayName("Named Range")]
        [Description("The name of the range to read the formula from.")]
        [RenderIfCondition(nameof(ReferenceType), CellReferenceTypeEnum.NamedRange)]
        public InArgument<string> NamedRange { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Cell Formula")]
        [Description("The formula contained in the specified cell or range.")]
        public OutArgument<string> CellFormula { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var formula = string.Empty;
            var status = "Success";
            Excel.Range targetRange = null;

            try
            {
               
                var worksheet = WorksheetInstance.Get(context);
                var referenceType = ReferenceType.Get(context);

                if (worksheet == null)
                {
                    var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                }

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is not available.");

                switch (referenceType)
                {
                    case CellReferenceTypeEnum.CellAddress:
                        var cellAddress = CellAddress.Get(context);
                        if (string.IsNullOrWhiteSpace(cellAddress))
                            throw new ArgumentException("Cell address cannot be empty.");
                        targetRange = worksheet.Range[cellAddress];
                        break;

                    case CellReferenceTypeEnum.NamedRange:
                        var rangeName = NamedRange.Get(context);
                        if (string.IsNullOrWhiteSpace(rangeName))
                            throw new ArgumentException("Named range cannot be empty.");
                        targetRange = worksheet.Names.Item(rangeName)?.RefersToRange;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(referenceType));
                }

                if (targetRange == null)
                    throw new InvalidOperationException("Target range not found.");

                formula = targetRange.Formula?.ToString() ?? string.Empty;

                CellFormula.Set(context, formula);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error reading formula: {ex.Message}";
                CellFormula.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            finally
            {
                if (targetRange != null)
                    Marshal.ReleaseComObject(targetRange);
            }
        }
    }
}