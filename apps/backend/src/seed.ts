import * as bcrypt from 'bcryptjs';
import { db } from '@announce-board/db';
import { users, categories } from '@announce-board/db';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@announceboard.com'))
    .limit(1);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      email: 'admin@announceboard.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    });
    console.log('  Created admin user (admin@announceboard.com / admin123)');
  } else {
    console.log('  Admin user already exists');
  }

  const existingCategories = ['General', 'Announcements', 'Events', 'News'];

  for (const name of existingCategories) {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (!existing) {
      await db.insert(categories).values({ name });
      console.log(`  Created category: ${name}`);
    } else {
      console.log(`  Category already exists: ${name}`);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
