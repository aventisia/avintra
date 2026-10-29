import { TicketDetailPage } from "@/features/05-tenant-admin/support-tickets-v2/components/ticket-detail/TicketDetailPage";
import { superAdminTicketDetailApiAdapter } from "@/features/06-super-admin/support-tickets/apis/super-admin-ticket-detail-api.constant.ee";

const SaSupportTicketDetailPage = () => {
  return (
    <TicketDetailPage
      api={superAdminTicketDetailApiAdapter}
      showTriage
      showStatusAction
      listPath="/sa/support/tickets"
    />
  );
};

export default SaSupportTicketDetailPage;
