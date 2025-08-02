import React from "react";

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};