import express from 'express';
import cors from 'cors';
import { APP_NAME, API_VERSION } from '@repo/shared';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { categoriesRouter } from './routes/categories.js';
import { ticketsRouter } from './routes/tickets.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/tickets', ticketsRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: APP_NAME,
    version: API_VERSION,
    message: 'Welcome to the Ticket Report API',
    endpoints: {
      health: '/health',
      auth: '/auth',
      users: '/users',
      categories: '/categories',
      tickets: '/tickets',
    },
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} API server running on http://localhost:${PORT}`);
  console.log(`📋 API Version: ${API_VERSION}`);
});

export default app;
