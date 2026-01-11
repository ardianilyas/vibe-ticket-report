import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db, users } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { generateToken, authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({ email, name, passwordHash, role: 'user' })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    const token = generateToken(newUser!.id);

    res.status(201).json({
      message: 'Registration successful',
      user: newUser,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /auth/me - Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export { router as authRouter };
