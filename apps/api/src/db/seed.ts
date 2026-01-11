import { db, users, categories, type NewUser, type NewCategory } from './index.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const [admin] = await db.insert(users).values({
    email: 'admin@example.com',
    name: 'Admin User',
    passwordHash: adminPassword,
    role: 'admin',
  } satisfies NewUser).returning();
  console.log('✅ Created admin user:', admin?.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const [user] = await db.insert(users).values({
    email: 'user@example.com',
    name: 'Regular User',
    passwordHash: userPassword,
    role: 'user',
  } satisfies NewUser).returning();
  console.log('✅ Created regular user:', user?.email);

  // Create categories
  const categoryData: NewCategory[] = [
    { name: 'Bug Report', description: 'Report software bugs and issues', color: '#ef4444' },
    { name: 'Feature Request', description: 'Request new features', color: '#22c55e' },
    { name: 'Support', description: 'General support inquiries', color: '#3b82f6' },
    { name: 'Other', description: 'Other inquiries', color: '#6b7280' },
  ];

  const createdCategories = await db.insert(categories).values(categoryData).returning();
  console.log('✅ Created categories:', createdCategories.map(c => c.name).join(', '));

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
