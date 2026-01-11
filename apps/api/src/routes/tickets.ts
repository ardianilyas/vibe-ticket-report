import { Router, Response } from 'express';
import { db, tickets, users, categories, ticketTimeline } from '../db/index.js';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createTicketSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  categoryId: z.string().uuid().optional(),
});

const updateTicketSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

// GET /tickets - List tickets
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'admin';

    // Build query with joins
    const ticketList = await db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        categoryId: tickets.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        reporterId: tickets.reporterId,
        reporterName: users.name,
        reporterEmail: users.email,
      })
      .from(tickets)
      .leftJoin(categories, eq(tickets.categoryId, categories.id))
      .leftJoin(users, eq(tickets.reporterId, users.id))
      .where(isAdmin ? undefined : eq(tickets.reporterId, req.user!.id))
      .orderBy(desc(tickets.createdAt));

    res.json({ tickets: ticketList });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// POST /tickets - Create new ticket
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = createTicketSchema.parse(req.body);

    const [newTicket] = await db
      .insert(tickets)
      .values({
        ...data,
        reporterId: req.user!.id,
      })
      .returning();

    // Record timeline event
    if (newTicket) {
      await db.insert(ticketTimeline).values({
        ticketId: newTicket.id,
        userId: req.user!.id,
        type: 'created',
      });
    }

    res.status(201).json({ ticket: newTicket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /tickets/:id - Get single ticket
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';

    const [ticket] = await db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        categoryId: tickets.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        reporterId: tickets.reporterId,
        assigneeId: tickets.assigneeId,
      })
      .from(tickets)
      .leftJoin(categories, eq(tickets.categoryId, categories.id))
      .where(eq(tickets.id, id as string))
      .limit(1);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    // Check access
    if (!isAdmin && ticket.reporterId !== req.user?.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get reporter and assignee details
    const [reporter] = ticket.reporterId
      ? await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, ticket.reporterId))
        .limit(1)
      : [null];

    const [assignee] = ticket.assigneeId
      ? await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, ticket.assigneeId))
        .limit(1)
      : [null];

    res.json({
      ticket: {
        ...ticket,
        reporter,
        assignee,
      },
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// PUT /tickets/:id - Update ticket
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const data = updateTicketSchema.parse(req.body);

    // Check ticket exists and access
    const [existing] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id as string))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    // Only admin can update status/assignee, reporter can update title/description
    if (!isAdmin && existing.reporterId !== req.user?.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Non-admin users can only update title and description
    const updateData = isAdmin
      ? { ...data, updatedAt: new Date() }
      : { title: data.title, description: data.description, updatedAt: new Date() };

    const [updated] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id as string))
      .returning();

    // Record timeline events for changes
    const timelineEvents = [];
    if (data.status && data.status !== existing.status) {
      timelineEvents.push({
        ticketId: id,
        userId: req.user!.id,
        type: 'status_change',
        oldValue: existing.status,
        newValue: data.status,
      });
    }
    if (data.priority && data.priority !== existing.priority) {
      timelineEvents.push({
        ticketId: id,
        userId: req.user!.id,
        type: 'priority_change',
        oldValue: existing.priority,
        newValue: data.priority,
      });
    }
    if (data.assigneeId !== undefined && data.assigneeId !== existing.assigneeId) {
      timelineEvents.push({
        ticketId: id,
        userId: req.user!.id,
        type: 'assignee_change',
        oldValue: existing.assigneeId || null,
        newValue: data.assigneeId || null,
      });
    }
    if (data.categoryId !== undefined && data.categoryId !== existing.categoryId) {
      timelineEvents.push({
        ticketId: id,
        userId: req.user!.id,
        type: 'category_change',
        oldValue: existing.categoryId || null,
        newValue: data.categoryId || null,
      });
    }

    if (timelineEvents.length > 0) {
      await db.insert(ticketTimeline).values(timelineEvents as any);
    }

    res.json({ ticket: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE /tickets/:id - Delete ticket (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [deleted] = await db.delete(tickets).where(eq(tickets.id, id as string)).returning();

    if (!deleted) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.json({ message: 'Ticket deleted', ticket: deleted });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// GET /tickets/:id/timeline - Get ticket timeline
router.get('/:id/timeline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const timeline = await db
      .select({
        id: ticketTimeline.id,
        type: ticketTimeline.type,
        oldValue: ticketTimeline.oldValue,
        newValue: ticketTimeline.newValue,
        createdAt: ticketTimeline.createdAt,
        userId: ticketTimeline.userId,
        userName: users.name,
      })
      .from(ticketTimeline)
      .leftJoin(users, eq(ticketTimeline.userId, users.id))
      .where(eq(ticketTimeline.ticketId, id as string))
      .orderBy(desc(ticketTimeline.createdAt));

    res.json({ timeline });
  } catch (error) {
    console.error('Error fetching ticket timeline:', error);
    res.status(500).json({ error: 'Failed to fetch ticket timeline' });
  }
});

export { router as ticketsRouter };
