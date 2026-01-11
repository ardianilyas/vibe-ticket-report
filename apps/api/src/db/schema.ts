import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);
export const ticketTimelineEventTypeEnum = pgEnum('ticket_timeline_event_type', ['created', 'status_change', 'priority_change', 'assignee_change', 'category_change', 'commented']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#6366f1').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Tickets table
export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  priority: ticketPriorityEnum('priority').default('medium').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  reporterId: uuid('reporter_id').references(() => users.id).notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Ticket Timeline table
export const ticketTimeline = pgTable('ticket_timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: ticketTimelineEventTypeEnum('type').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reportedTickets: many(tickets, { relationName: 'reporter' }),
  assignedTickets: many(tickets, { relationName: 'assignee' }),
  timelineEvents: many(ticketTimeline),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  category: one(categories, {
    fields: [tickets.categoryId],
    references: [categories.id],
  }),
  reporter: one(users, {
    fields: [tickets.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
  assignee: one(users, {
    fields: [tickets.assigneeId],
    references: [users.id],
    relationName: 'assignee',
  }),
  timeline: many(ticketTimeline),
}));

export const ticketTimelineRelations = relations(ticketTimeline, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketTimeline.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketTimeline.userId],
    references: [users.id],
  }),
}));

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketTimeline = typeof ticketTimeline.$inferSelect;
export type NewTicketTimeline = typeof ticketTimeline.$inferInsert;
