const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// Ticket types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail extends Omit<Ticket, 'reporterName' | 'reporterEmail'> {
  assigneeId: string | null;
  reporter: { id: string; name: string; email: string } | null;
  assignee: { id: string; name: string; email: string } | null;
}

export interface TicketTimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'priority_change' | 'assignee_change' | 'category_change' | 'commented';
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  userId: string;
  userName: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
}

// API functions
export async function getTickets(token: string) {
  return apiFetch<{ tickets: Ticket[] }>('/tickets', { token });
}

export async function getTicket(id: string, token: string) {
  return apiFetch<{ ticket: TicketDetail }>(`/tickets/${id}`, { token });
}

export async function getTicketTimeline(id: string, token: string) {
  return apiFetch<{ timeline: TicketTimelineEvent[] }>(`/tickets/${id}/timeline`, { token });
}

export async function createTicket(
  data: { title: string; description: string; priority?: string; categoryId?: string },
  token: string
) {
  return apiFetch<{ ticket: Ticket }>('/tickets', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function updateTicket(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    categoryId: string | null;
    assigneeId: string | null;
  }>,
  token: string
) {
  return apiFetch<{ ticket: TicketDetail }>(`/tickets/${id}`, {
    method: 'PUT',
    body: data,
    token,
  });
}

export async function deleteTicket(id: string, token: string) {
  return apiFetch<{ message: string }>(`/tickets/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function getCategories() {
  return apiFetch<{ categories: Category[] }>('/categories');
}

export async function getUsers(token: string) {
  return apiFetch<{ users: { id: string; name: string; email: string; role: string }[] }>(
    '/users',
    { token }
  );
}
