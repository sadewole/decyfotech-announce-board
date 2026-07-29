import { Injectable } from '@nestjs/common';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import * as schema from '@announce-board/db';
import { BaseRepository } from './base.repository';

@Injectable()
export class PostsRepository extends BaseRepository {
  async create(data: { title: string; content: string; categoryId?: number; authorId: number }) {
    const [post] = await this.db.insert(schema.posts).values(data).returning();
    return post;
  }

  async findById(id: number) {
    return this.db.query.posts.findFirst({
      where: eq(schema.posts.id, id),
      with: {
        author: { columns: { id: true, name: true, email: true } },
        category: true,
      },
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filter?: { categoryId?: number; startDate?: string; endDate?: string },
  ) {
    const conditions: ReturnType<typeof eq | typeof gte | typeof lte>[] = [];
    if (filter?.categoryId) {
      conditions.push(eq(schema.posts.categoryId, filter.categoryId));
    }
    if (filter?.startDate) {
      conditions.push(gte(schema.posts.createdAt, new Date(filter.startDate)));
    }
    if (filter?.endDate) {
      conditions.push(lte(schema.posts.createdAt, new Date(filter.endDate)));
    }

    const offset = (page - 1) * limit;
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await this.db.query.posts.findMany({
      where,
      limit,
      offset,
      with: {
        author: { columns: { id: true, name: true, email: true } },
        category: true,
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    const [totalResult] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(schema.posts)
      .where(where ?? sql`true`);

    return { items, total: Number(totalResult.total), page, limit, totalPages: Math.ceil(Number(totalResult.total) / limit) };
  }

  async update(id: number, data: Partial<typeof schema.posts.$inferInsert>) {
    const [post] = await this.db
      .update(schema.posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.posts.id, id))
      .returning();
    return post;
  }

  async delete(id: number) {
    await this.db.delete(schema.posts).where(eq(schema.posts.id, id));
  }

  async countByCategory(categoryId: number) {
    const [result] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(schema.posts)
      .where(eq(schema.posts.categoryId, categoryId));
    return Number(result.total);
  }

  async moveToCategory(fromCategoryId: number, toCategoryId: number) {
    await this.db
      .update(schema.posts)
      .set({ categoryId: toCategoryId, updatedAt: new Date() })
      .where(eq(schema.posts.categoryId, fromCategoryId));
  }
}
