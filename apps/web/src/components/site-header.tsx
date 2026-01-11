"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/tickets": "Tickets",
  "/dashboard/admin": "Admin Panel",
}

export function SiteHeader() {
  const pathname = usePathname()

  // Get page title or generate from path
  let title = pageTitles[pathname] || "Dashboard"
  if (pathname.startsWith("/dashboard/tickets/") && pathname !== "/dashboard/tickets") {
    title = "Ticket Details"
  }

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
