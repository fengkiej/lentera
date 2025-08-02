import { Wifi, WifiOff, Battery } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface OfflineIndicatorProps {
  isOnline?: boolean
  batteryLevel?: number
  className?: string
}

export function OfflineIndicator({ 
  isOnline = false, 
  batteryLevel = 85,
  className = "" 
}: OfflineIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={isOnline ? "default" : "secondary"} 
        className="flex items-center gap-1 px-2 py-1"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span className="text-xs">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">Offline</span>
          </>
        )}
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
        <Battery 
          className={`h-3 w-3 ${
            batteryLevel > 20 ? "text-success" : "text-warning"
          }`} 
        />
        <span className="text-xs">{batteryLevel}%</span>
      </Badge>
    </div>
  )
}