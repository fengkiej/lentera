import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  )
}