import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a query client instance
const queryClient = new QueryClient();

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};