import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider = ({ children }: UIProviderProps) => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {children}
    </TooltipProvider>
  );
};