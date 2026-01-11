'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getTickets, getCategories, getUsers, updateTicket, deleteTicket, type Ticket, type Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getStatusStyle, getPriorityStyle, getRoleStyle } from '@/lib/badge-styles';
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
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard-shell';
import { Ticket as TicketIcon, Tag as TagIcon, Users as UsersIcon } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'categories' | 'users'>('tickets');

  // Category form
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');

  // Delete confirmation
  const [deleteTicketDialogOpen, setDeleteTicketDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [token, user]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [ticketsData, categoriesData, usersData] = await Promise.all([
        getTickets(token),
        getCategories(),
        getUsers(token),
      ]);
      setTickets(ticketsData.tickets);
      setCategories(categoriesData.categories);
      setUsers(usersData.users as User[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: {
          name: newCategoryName,
          description: newCategoryDescription,
          color: newCategoryColor,
        },
        token,
      });
      toast.success('Category created!');
      setCategoryDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryColor('#6366f1');
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE', token });
      toast.success('Category deleted');
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const handleDeleteTicket = (id: string) => {
    setTicketToDelete(id);
    setDeleteTicketDialogOpen(true);
  };

  const confirmDeleteTicket = async () => {
    if (!token || !ticketToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteTicket(ticketToDelete, token);
      toast.success('Ticket deleted');
      setDeleteTicketDialogOpen(false);
      setTicketToDelete(null);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete ticket');
    } finally {
      setIsSubmitting(false);
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

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage tickets, categories, and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`relative overflow-hidden cursor-pointer transition-all duration-200 border-none shadow-sm hover:shadow-md ${activeTab === 'tickets'
            ? 'ring-2 ring-primary bg-primary/5'
            : 'bg-card/50 backdrop-blur-sm'
            }`}
          onClick={() => setActiveTab('tickets')}
        >
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Tickets
              </p>
              <p className="text-2xl font-bold">{tickets.length}</p>
            </div>
            <div className={`p-3 rounded-2xl ${activeTab === 'tickets' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
              <TicketIcon className="h-5 w-5" />
            </div>
          </div>
          {activeTab === 'tickets' && (
            <div className="absolute bottom-0 left-0 h-1 w-full bg-primary" />
          )}
        </Card>

        <Card
          className={`relative overflow-hidden cursor-pointer transition-all duration-200 border-none shadow-sm hover:shadow-md ${activeTab === 'categories'
            ? 'ring-2 ring-primary bg-primary/5'
            : 'bg-card/50 backdrop-blur-sm'
            }`}
          onClick={() => setActiveTab('categories')}
        >
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <div className={`p-3 rounded-2xl ${activeTab === 'categories' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
              <TagIcon className="h-5 w-5" />
            </div>
          </div>
          {activeTab === 'categories' && (
            <div className="absolute bottom-0 left-0 h-1 w-full bg-primary" />
          )}
        </Card>

        <Card
          className={`relative overflow-hidden cursor-pointer transition-all duration-200 border-none shadow-sm hover:shadow-md ${activeTab === 'users'
            ? 'ring-2 ring-primary bg-primary/5'
            : 'bg-card/50 backdrop-blur-sm'
            }`}
          onClick={() => setActiveTab('users')}
        >
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Users
              </p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className={`p-3 rounded-2xl ${activeTab === 'users' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 h-1 w-full bg-primary" />
          )}
        </Card>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>Manage all tickets in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <EmptyState
                title="System is empty"
                description="There are currently no support tickets in the system. Everything is quiet!"
                icon={TicketIcon}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Reporter</TableHead>
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
                      <TableCell>{ticket.reporterName}</TableCell>
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
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteTicket(ticket.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage ticket categories</CardDescription>
            </div>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button>+ Add Category</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateCategory}>
                  <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>Add a new ticket category</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          placeholder="#6366f1"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyState
                title="No categories"
                description="You haven't created any ticket categories yet."
                icon={TagIcon}
                actionLabel="Add Category"
                onAction={() => setCategoryDialogOpen(true)}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>View all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <EmptyState
                title="No users"
                description="There are no users registered in the system yet."
                icon={UsersIcon}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleStyle(u.role)}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
      {/* Delete Ticket Confirmation Dialog */}
      <Dialog open={deleteTicketDialogOpen} onOpenChange={setDeleteTicketDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTicketDialogOpen(false);
                setTicketToDelete(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTicket}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
