using CodeActivitiesLibrary.Extensions;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Security;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security;

namespace CodeActivitiesLibrary.AppIntegrations.EmailActivities
{
    [DisplayName("Process Email Messages")]
    [Description(
        "Moves, deletes, or marks as unread an email (or a list of emails) retrieved by a Retrieve email messages action.")]
        [ActivityMetaData(nodeImg:"/assets/Email.svg")]
    public class ProcessEmailMessagesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The action to perform on the email messages.")]
        [DefaultValue(EmailOperationEnum.Delete)]
        public InArgument<EmailOperationEnum> Operation { get; set; }

        [RequiredArgument]
        [DisplayName("Email Messages to Process")]
        [Description("The IDs of the email messages to process.")]
        public InArgument<List<string>> MessageIds { get; set; }


        [DisplayName("IMAP Server")]
        [Description("The IMAP server address.")]
        public InArgument<string> ImapServer { get; set; }


        [DisplayName("Port")]
        [Description("The port number for the IMAP server.")]
        public InArgument<int> Port { get; set; }


        [DisplayName("Enable SSL")]
        [Description("If true, enables SSL encryption for the connection.")]
        public InArgument<bool> EnableSSL { get; set; }


        [DisplayName("Username")]
        [Description("The username for the IMAP account.")]
        public InArgument<string> Username { get; set; }


        [DisplayName("Password")]
        [Description("The password for the IMAP account.")]
        public InArgument<SecureString> Password { get; set; }


        [DisplayName("Accept Untrusted Certificates")]
        [Description("If true, accepts untrusted SSL certificates.")]
        public InArgument<bool> AcceptUntrustedCertificates { get; set; }


        [DisplayName("Mail Folder")]
        [Description("The destination mail folder for moving emails (required if 'Operation' is 'Move').")]
        [RenderIfCondition(nameof(Operation), EmailOperationEnum.MoveToFolder)]
        public InArgument<string> MailFolder { get; set; }

        protected override void Execute(CodeActivityContext context)
        {

            try
            {
                var operation = Operation.Get(context);
                var messageIds = MessageIds.Get(context);
                var imapServer = ImapServer.Get(context);
                var port = Port.Get(context);
                var enableSsl = EnableSSL.Get(context);
                var username = Username.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
                var acceptUntrustedCertificates = AcceptUntrustedCertificates.Get(context);
                using (var client = CreateImapClient(imapServer, port, enableSsl, username, password,
                           acceptUntrustedCertificates))
                {
                    switch (operation)
                    {
                        case EmailOperationEnum.Delete:
                            DeleteEmails(messageIds, client);
                            break;

                        case EmailOperationEnum.MarkAsUnread:
                            MarkEmailsAsUnread(messageIds, client);
                            break;

                        case EmailOperationEnum.MoveToFolder:
                            {
                                var mailFolder = MailFolder.Get(context);
                                MoveEmailsToFolder(messageIds, mailFolder, client);
                                if (string.IsNullOrWhiteSpace(mailFolder))
                                    throw new ArgumentException(
                                        "Mail folder cannot be empty when u imapServer, port, enableSSL, username, password");
                                break;
                            }

                        default:
                            throw new ArgumentOutOfRangeException(nameof(operation));
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Email messages processed successfully");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error processing email messages: {ex.Message}");
            }


        }

        private static ImapClient CreateImapClient(string imapServer, int port, bool enableSSL,
            string username, string password, bool acceptUntrustedCertificates)
        {
            var client = new ImapClient();

            if (acceptUntrustedCertificates) client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            var options = enableSSL ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;

            client.Connect(imapServer, port, options);
            client.Authenticate(username, password);

            return client;
        }

        private static void DeleteEmails(List<string> messageIds, ImapClient client)
        {
            // Open the inbox folder (you might want to make this configurable)
            var inbox = client.Inbox;
            inbox.Open(FolderAccess.ReadWrite);

            // Convert string message IDs to UIDs
            var uids = messageIds.Select(id => new UniqueId(uint.Parse(id))).ToList();

            // Add the \Deleted flag and expunge the messages
            inbox.AddFlags(uids, MessageFlags.Deleted, true);
            inbox.Expunge(uids);

            client.Disconnect(true);
        }


        private static void MarkEmailsAsUnread(IEnumerable<string> messageIds, ImapClient client)
        {
            // Open the inbox folder
            var inbox = client.Inbox;
            inbox.Open(FolderAccess.ReadWrite);

            // Convert string message IDs to UIDs
            var uids = messageIds.Select(id => new UniqueId(uint.Parse(id))).ToList();

            // Remove the \Seen flag to mark as unread
            inbox.RemoveFlags(uids, MessageFlags.Seen, true);

            client.Disconnect(true);
        }

        private static void MoveEmailsToFolder(IEnumerable<string> messageIds, string mailFolder, ImapClient client)
        {
            // Open the inbox folder (source)
            var inbox = client.Inbox;
            inbox.Open(FolderAccess.ReadWrite);

            // Get or create the destination folder
            var destinationFolder = client.GetFolder(mailFolder) ??
                                    client.GetFolder(client.PersonalNamespaces[0]).Create(mailFolder, true);

            destinationFolder.Open(FolderAccess.ReadWrite);

            // Convert string message IDs to UIDs
            var uids = messageIds.Select(id => new UniqueId(uint.Parse(id))).ToList();

            // Move the messages
            inbox.MoveTo(uids, destinationFolder);

            client.Disconnect(true);
        }
    }

    public enum EmailOperationEnum
    {
        [Display(Name = "Delete", Description = "Deletes email messages from the server.")]
        Delete,

        [Display(Name = "Mark as Unread", Description = "Marks email messages as unread.")]
        MarkAsUnread,

        [Display(Name = "Move to Mail Folder", Description = "Moves email messages to a specified mail folder.")]
        MoveToFolder
    }
}