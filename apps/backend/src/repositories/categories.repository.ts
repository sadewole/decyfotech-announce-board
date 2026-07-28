import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@announce-board/db';
import { BaseRepository } from './base.repository';

@Injectable()
export class CategoriesRepository extends BaseRepository {
  async create(name: string) {
    const [category] = await this.db.insert(schema.categories).values({ name }).returning();
    return category;
  }

  async findById(id: number) {
    const [category] = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1);
    return category;
  }

  async findAllPaginated(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const items = await this.db.query.categories.findMany({
      limit,
      offset,
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
    const [totalResult] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(schema.categories);
    return { items, total: Number(totalResult.total), page, limit, totalPages: Math.ceil(Number(totalResult.total) / limit) };
  }

  async update(id: number, name: string) {
    const [category] = await this.db
      .update(schema.categories)
      .set({ name })
      .where(eq(schema.categories.id, id))
      .returning();
    return category;
  }

  async delete(id: number) {
    await this.db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  async findAll() {
    return this.db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
  }
}
