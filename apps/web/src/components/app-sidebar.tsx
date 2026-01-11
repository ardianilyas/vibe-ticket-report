"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  TicketIcon,
  SettingsIcon,
  HelpCircleIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Tickets",
      url: "/dashboard/tickets",
      icon: TicketIcon,
      isActive: pathname === "/dashboard/tickets" || pathname.startsWith("/dashboard/tickets/"),
    },
    ...(user?.role === "admin"
      ? [
        {
          title: "Admin Panel",
          url: "/dashboard/admin",
          icon: SettingsIcon,
          isActive: pathname === "/dashboard/admin",
        },
      ]
      : []),
  ]

  const navSecondary = [
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircleIcon,
    },
  ]

  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <span className="text-2xl">🎫</span>
                <span className="text-base font-semibold">Ticket System</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
