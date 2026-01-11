'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getTickets, getCategories, createTicket, type Ticket, type Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Plus, Ticket as TicketIcon } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { getStatusStyle, getPriorityStyle, getCategoryStyle } from '@/lib/badge-styles';
import { EmptyState } from '@/components/empty-state';

export default function TicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [ticketsData, categoriesData] = await Promise.all([
        getTickets(token),
        getCategories(),
      ]);
      setTickets(ticketsData.tickets);
      setCategories(categoriesData.categories);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await createTicket(
        {
          title,
          description,
          priority,
          categoryId: categoryId || undefined,
        },
        token
      );
      toast.success('Ticket created successfully!');
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategoryId('');
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Manage your support tickets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateTicket}>
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>
                  Submit a new support ticket. We&apos;ll get back to you as soon as possible.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>View and manage all your submitted tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              title="No tickets yet"
              description="It looks like you haven't submitted any support tickets. Click the button above to get started."
              icon={TicketIcon}
              actionLabel="Create Ticket"
              onAction={() => setIsDialogOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {ticket.title}
                    </TableCell>
                    <TableCell>
                      {ticket.categoryName ? (
                        <Badge
                          variant="outline"
                          className={getCategoryStyle(ticket.categoryColor)}
                        >
                          {ticket.categoryName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusStyle(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityStyle(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
