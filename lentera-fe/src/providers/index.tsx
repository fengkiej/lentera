import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./query-provider";
import { UIProvider } from "./ui-provider";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Application providers component
 *
 * Wraps the entire application with all necessary providers:
 * - QueryProvider: React Query for data fetching
 * - UIProvider: UI-related providers (tooltips, toasts)
 * - BrowserRouter: React Router for navigation
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <UIProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </UIProvider>
    </QueryProvider>
  );
};