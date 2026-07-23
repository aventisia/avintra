import { ConnectedIntegrationListDTO } from "../dto/connected-integration-list-dto";

export const connectedIntegrations: ConnectedIntegrationListDTO[] = [
  {
    id: window.crypto.randomUUID(),
    name: "Sendgrid",
    value: "sendgrid",
    icon: "/brand-img/sendgrid.svg",
    description: "Easily send transactional and marketing emails using Sendgrid integration.",
  },
];
