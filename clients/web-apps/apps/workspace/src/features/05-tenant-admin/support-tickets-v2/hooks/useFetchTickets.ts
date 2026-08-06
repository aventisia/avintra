import { useQuery } from "@tanstack/react-query";
import { getTickets, getTicket } from "../apis/ticket-apis";

export const useFetchTickets = () =>
  useQuery({
    queryKey: ["support-tickets-v2"],
    queryFn: getTickets,
  });

export const useFetchTicket = (id: string) =>
  useQuery({
    queryKey: ["support-ticket-v2", id],
    queryFn: () => getTicket(id),
    enabled: !!id,
  });
