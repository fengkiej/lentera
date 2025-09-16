import { QueryClient } from '@tanstack/react-query';

// Konfigurasi QueryClient dengan pengaturan yang optimal untuk UX
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data selama 5 menit
      staleTime: 1000 * 60 * 5,
      // Simpan data di cache selama 10 menit
      gcTime: 1000 * 60 * 10,
      // Retry gagal maksimal 2 kali
      retry: 2,
      // Refetch saat window focus untuk data terbaru
      refetchOnWindowFocus: false,
      // Refetch saat reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry gagal maksimal 1 kali untuk mutations
      retry: 1,
    },
  },
});