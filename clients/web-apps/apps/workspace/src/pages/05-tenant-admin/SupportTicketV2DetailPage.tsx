import { TicketDetailPage } from "@/features/05-tenant-admin/support-tickets-v2/components/ticket-detail/TicketDetailPage";
import { tenantTicketDetailApiAdapter } from "@/features/05-tenant-admin/support-tickets-v2/apis/tenant-ticket-detail-api.constant";

const SupportTicketV2DetailPage = () => {
  return <TicketDetailPage api={tenantTicketDetailApiAdapter} />;
};

export default SupportTicketV2DetailPage;
