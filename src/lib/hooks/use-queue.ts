import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useQueue(refreshInterval: number = 5000) {
  return useSWR("/api/queue", fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
}

export function useTicketStatus(ticketId: string, refreshInterval: number = 3000) {
  return useSWR(ticketId ? `/api/tickets/${ticketId}` : null, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
}
