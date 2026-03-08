import { useQuery } from "@tanstack/react-query";

const FALLBACK_RATE = 110;

async function fetchBDTRate(): Promise<number> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error("Failed to fetch exchange rate");
  const data = await res.json();
  return data.rates?.BDT ?? FALLBACK_RATE;
}

export function useExchangeRate() {
  return useQuery({
    queryKey: ["exchange-rate", "USD-BDT"],
    queryFn: fetchBDTRate,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
    retry: 2,
    placeholderData: FALLBACK_RATE,
  });
}
