namespace WorkspaceAPIs.Features.CloudConnectors.M365.Outlook;

public enum M365OutlookActionsEnum
{
    // Email Sending
    SendEmail,
    SendEmailWithAttachments,

    // Read / Get Emails
    GetEmails,
    GetEmailById,
    GetEmailByIdWithAttachments,
    GetEmailsBySearchCriteria,
    GetAllEmails,
    GetUnreadEmails,

    // Email Management
    ReplyEmail,
    ForwardEmail,

    DeleteEmail,
    MoveEmailToFolder,
    UpdateAllEmailProperties,

    // Drafts
    CreateDraftEmail,
    UpdateDraftEmail,
    DeleteDraftEmail,
    SendDraftEmail,

    // Attachments
    GetAttachmentsFromEmail,
    AddAttachmentToDraft,
    DownloadAttachment,

    // Folders
    GetEmailsByFolderName,
    GetMailFolderByName,
    GetMailFolders,
    CreateMailFolder,
    RenameMailFolder,
    DeleteMailFolder,

    // Categories
    AddCategoryToEmail,
    RemoveCategoryFromEmail,
    GetCategories,

    // Calendar (Optional but common in Outlook APIs)
    CreateCalendarEvent,
    UpdateCalendarEvent,
    DeleteCalendarEvent,
    GetCalendarEvents,

    // Contacts (Optional Outlook capability)
    CreateContact,
    UpdateContact,
    DeleteContact,
    GetContacts,

    // User Info
    GetMailboxSettings,
    GetUserProfile
}
