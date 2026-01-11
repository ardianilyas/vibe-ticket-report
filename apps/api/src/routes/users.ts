import { Router, Response } from 'express';
import { db, users } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /users - List all users (admin only)
router.get('/', authMiddleware, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);

    res.json({ users: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /users/:id - Get single user
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless admin
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export { router as usersRouter };
