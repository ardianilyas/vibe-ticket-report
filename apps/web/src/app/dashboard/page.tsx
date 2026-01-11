'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getTickets, type Ticket } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/dashboard-shell';
import { formatRelativeDate, cn } from '@/lib/utils';
import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { getStatusStyle, getPriorityStyle, getCategoryStyle } from '@/lib/badge-styles';
import { EmptyState } from '@/components/empty-state';



export default function DashboardPage() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getTickets(token)
        .then((data) => setTickets(data.tickets))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const stats = [
    {
      title: 'Total Tickets',
      value: tickets.length,
      description: 'All time tickets',
      icon: TicketIcon,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      animation: 'animate-bounce',
    },
    {
      title: 'Open',
      value: tickets.filter((t) => t.status === 'open').length,
      description: 'Awaiting review',
      icon: AlertCircle,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      animation: 'animate-pulse',
    },
    {
      title: 'In Progress',
      value: tickets.filter((t) => t.status === 'in_progress').length,
      description: 'Being worked on',
      icon: Clock,
      iconBg: 'bg-sky-100 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-400',
      animation: 'animate-spin-slow',
    },
    {
      title: 'Resolved',
      value: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
      description: 'Completed tickets',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      animation: 'animate-wiggle',
    },
  ];

  const recentTickets = tickets.slice(0, 5);

  return (
    <DashboardShell>
      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}!{' '}
            {user?.role === 'admin'
              ? 'Manage all tickets and user reports.'
              : 'Track your submitted tickets.'}
          </p>
        </div>
        <Link href="/dashboard/tickets">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground/60 font-medium">
                  {stat.description}
                </p>
              </div>
              <div className={cn("p-3 rounded-2xl bg-primary/10 text-primary")}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>
              {user?.role === 'admin'
                ? 'Latest tickets from all users'
                : 'Your latest submitted tickets'}
            </CardDescription>
          </div>
          <Link href="/dashboard/tickets">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentTickets.length === 0 ? (
            <EmptyState
              title="All caught up"
              description={user?.role === 'admin'
                ? "There are no tickets in the system yet. Everything is quiet!"
                : "It looks like you haven't submitted any support tickets. Click 'New Ticket' to get started."
              }
              icon={TicketIcon}
              actionLabel={user?.role === 'admin' ? undefined : "New Ticket"}
              onAction={user?.role === 'admin' ? undefined : () => window.location.href = '/dashboard/tickets'}
            />
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{ticket.title}</h3>
                      {ticket.categoryName && (
                        <Badge
                          variant="outline"
                          className={`hidden sm:inline-flex ${getCategoryStyle(ticket.categoryColor)}`}
                        >
                          {ticket.categoryName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {ticket.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeDate(ticket.createdAt)}
                      {user?.role === 'admin' && ticket.reporterName && (
                        <span> • by {ticket.reporterName}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={getStatusStyle(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getPriorityStyle(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
