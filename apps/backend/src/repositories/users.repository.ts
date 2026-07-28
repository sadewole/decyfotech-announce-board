import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@announce-board/db';
import { BaseRepository } from './base.repository';

@Injectable()
export class UsersRepository extends BaseRepository {
  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return user;
  }

  async findById(id: number) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user;
  }

  async create(data: { email: string; password: string; name: string; role?: 'admin' | 'viewer' }) {
    const [user] = await this.db.insert(schema.users).values(data).returning();
    return user;
  }

  async updateRole(userId: number, role: 'admin' | 'viewer') {
    const [user] = await this.db
      .update(schema.users)
      .set({ role, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async findAllPaginated(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const items = await this.db.query.users.findMany({
      columns: { password: false },
      limit,
      offset,
      orderBy: (users, { asc }) => [asc(users.id)],
    });
    const [totalResult] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(schema.users);
    return { items, total: Number(totalResult.total), page, limit, totalPages: Math.ceil(Number(totalResult.total) / limit) };
  }
}
