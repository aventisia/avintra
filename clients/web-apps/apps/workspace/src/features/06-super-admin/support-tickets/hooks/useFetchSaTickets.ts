import { useQuery } from "@tanstack/react-query";
import { getSaTickets, getSaTicket } from "../apis/sa-ticket-apis";

export const useFetchSaTickets = () =>
  useQuery({
    queryKey: ["sa-support-tickets"],
    queryFn: getSaTickets,
  });

export const useFetchSaTicket = (id: string) =>
  useQuery({
    queryKey: ["sa-support-ticket", id],
    queryFn: () => getSaTicket(id),
    enabled: !!id,
  });
