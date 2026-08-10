import { tenantTicketDetailApiAdapter } from "@/features/05-tenant-admin/support-tickets-v2/apis/tenant-ticket-detail-api.constant";
import { TicketDetailPage } from "@/features/05-tenant-admin/support-tickets-v2/components/ticket-detail/TicketDetailPage";

const SupportTicketV2DetailPage = () => {
  return <TicketDetailPage api={tenantTicketDetailApiAdapter} />;
};

export default SupportTicketV2DetailPage;
