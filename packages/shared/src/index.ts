// Application Constants
export const APP_NAME = 'Ticket Report System';
export const API_VERSION = '1.0.0';

// User Role Enum
export type UserRole = 'user' | 'admin';

// Ticket Status Enum
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// Ticket Priority Enum
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
}

// Ticket Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId: string | null;
  reporterId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketWithRelations extends Ticket {
  category: Category | null;
  reporter: UserPublic;
  assignee: UserPublic | null;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

// Auth Types
export interface AuthResponse {
  message: string;
  user: UserPublic;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

// Ticket Request Types
export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: TicketPriority;
  categoryId?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string | null;
  assigneeId?: string | null;
}

// Category Request Types
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}

// Utility Functions
export function formatDate(date: Date): string {
  return date.toISOString();
}

export function createApiResponse<T>(data: T, success = true): ApiResponse<T> {
  return {
    success,
    data,
    timestamp: formatDate(new Date()),
  };
}

export function createErrorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
    timestamp: formatDate(new Date()),
  };
}

// Environment helpers
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Status and Priority helpers
export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
