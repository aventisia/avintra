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
    public class ReadFormulaFromExcelActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

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
                var excelApp = ExcelApplication.Get(context);
                var referenceType = ReferenceType.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                switch (referenceType)
                {
                    case CellReferenceTypeEnum.CellAddress:
                        var cellAddress = CellAddress.Get(context);
                        if (string.IsNullOrWhiteSpace(cellAddress))
                            throw new ArgumentException("Cell address cannot be empty.");

                        targetRange = ws.Range[cellAddress];
                        break;

                    case CellReferenceTypeEnum.NamedRange:
                        var rangeName = NamedRange.Get(context);
                        if (string.IsNullOrWhiteSpace(rangeName))
                            throw new ArgumentException("Named range cannot be empty.");

                        targetRange = ws.Names.Item(rangeName)?.RefersToRange;
                        break;
                }

                if (targetRange == null)
                    throw new InvalidOperationException("Target range not found.");

                formula = targetRange.Formula?.ToString() ?? string.Empty;
            }
            catch (Exception ex)
            {
                status = $"Error reading formula: {ex.Message}";
            }
            finally
            {
                if (targetRange != null) Marshal.ReleaseComObject(targetRange);
            }

            CellFormula.Set(context, formula);
            StatusMessage.Set(context, status);
        }
    }
}