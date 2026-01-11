import { Router, Request, Response } from 'express';
import { db, categories } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// GET /categories - List all categories (public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allCategories = await db.select().from(categories);
    res.json({ categories: allCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /categories - Create category (admin only)
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const data = categorySchema.parse(req.body);

    const [newCategory] = await db.insert(categories).values(data).returning();

    res.status(201).json({ category: newCategory });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /categories/:id - Update category (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = categorySchema.partial().parse(req.body);

    const [updated] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ category: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /categories/:id - Delete category (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted', category: deleted });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export { router as categoriesRouter };
