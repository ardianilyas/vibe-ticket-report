'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getTicket, updateTicket, getUsers, getCategories, getTicketTimeline, type Category, type TicketDetail, type TicketTimelineEvent } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStatusStyle, getPriorityStyle, getCategoryStyle } from '@/lib/badge-styles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { ArrowLeft } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { TicketTimeline } from '@/components/ticket-timeline';


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TicketDetailPage() {
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeline, setTimeline] = useState<TicketTimelineEvent[]>([]);

  const ticketId = params.id as string;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, [token, ticketId]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [ticketData, timelineData] = await Promise.all([
        getTicket(ticketId, token),
        getTicketTimeline(ticketId, token),
      ]);
      setTicket(ticketData.ticket);
      setTimeline(timelineData.timeline);

      if (isAdmin) {
        const [usersData, categoriesData] = await Promise.all([
          getUsers(token),
          getCategories(),
        ]);
        setUsers(usersData.users);
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast.error('Failed to load ticket');
      router.push('/dashboard/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (field: string, value: string | null) => {
    if (!token || !ticket) return;
    setIsUpdating(true);
    try {
      const updated = await updateTicket(ticketId, { [field]: value }, token);
      setTicket({ ...ticket, ...updated.ticket });

      // Refresh timeline after update
      const timelineData = await getTicketTimeline(ticketId, token);
      setTimeline(timelineData.timeline);

      toast.success('Ticket updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };



  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!ticket) {
    return (
      <DashboardShell>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Ticket not found</p>
          <Link href="/dashboard/tickets">
            <Button className="mt-4">Back to Tickets</Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/tickets">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-border mx-2" />
          <p className="text-sm font-medium text-muted-foreground">
            Ticket <span className="text-foreground">#{ticket.id.slice(0, 8)}</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight mb-4">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="outline" className={getStatusStyle(ticket.status)}>
                {ticket.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={getPriorityStyle(ticket.priority)}>
                {ticket.priority} priority
              </Badge>
              {ticket.categoryName && (
                <Badge
                  variant="outline"
                  className={getCategoryStyle(ticket.categoryColor)}
                >
                  {ticket.categoryName}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Created {formatRelativeDate(ticket.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main content Area */}
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground/90">
                {ticket.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Management Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                Status
              </Label>
              {isAdmin ? (
                <Select
                  value={ticket.status}
                  onValueChange={(value) => handleUpdate('status', value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="pt-1">
                  <Badge variant="outline" className={getStatusStyle(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                Priority
              </Label>
              {isAdmin ? (
                <Select
                  value={ticket.priority}
                  onValueChange={(value) => handleUpdate('priority', value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="pt-1">
                  <Badge variant="outline" className={getPriorityStyle(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                Category
              </Label>
              {isAdmin ? (
                <Select
                  value={ticket.categoryId || ''}
                  onValueChange={(value) => handleUpdate('categoryId', value || null)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="pt-1">
                  {ticket.categoryName ? (
                    <Badge
                      variant="outline"
                      className={getCategoryStyle(ticket.categoryColor)}
                    >
                      {ticket.categoryName}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No category</span>
                  )}
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Assignee
                </Label>
                <Select
                  value={ticket.assigneeId || ''}
                  onValueChange={(value) => handleUpdate('assigneeId', value || null)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => u.role === 'admin')
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Involved Parties Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">Involved Parties</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                {ticket.reporter?.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Reporter
                </p>
                <p className="font-medium text-sm">{ticket.reporter?.name}</p>
                <p className="text-xs text-muted-foreground">{ticket.reporter?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 font-medium text-xs">
                {ticket.assignee?.name.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Assignee
                </p>
                <p className="font-medium text-sm">
                  {ticket.assignee?.name || 'Unassigned'}
                </p>
                {ticket.assignee && (
                  <p className="text-xs text-muted-foreground">{ticket.assignee.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 overflow-hidden">
            <TicketTimeline events={timeline} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
