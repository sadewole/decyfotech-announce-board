import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { db, users, categories, posts } from '@announce-board/db';

describe('Announce Board API (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let categoryId: number;
  let postId: number;

  beforeAll(async () => {
    await db.delete(posts);
    await db.delete(categories);
    await db.delete(users);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /v1/auth/signup - should register first user as admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'admin@test.com', password: 'password123', name: 'Admin' })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('POST /v1/auth/signup - should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'admin@test.com', password: 'password123', name: 'Admin' })
        .expect(409);
    });

    it('POST /v1/auth/signup - should register second user as viewer', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'user@test.com', password: 'password123', name: 'User' })
        .expect(201);

      expect(res.body.user.role).toBe('viewer');
      userToken = res.body.token;
    });

    it('POST /v1/auth/signin - should authenticate', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/signin')
        .send({ email: 'admin@test.com', password: 'password123' })
        .expect(200);

      expect(res.body.token).toBeDefined();
    });

    it('POST /v1/auth/signin - should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/signin')
        .send({ email: 'admin@test.com', password: 'wrong' })
        .expect(401);
    });

    it('GET /v1/auth/users - admin should list users', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });

    it('GET /v1/auth/users - viewer should be denied', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('POST /v1/auth/signup - should reject unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'x@y.com', password: '123456', name: 'X', evil: 'field' })
        .expect(400);
    });
  });

  describe('Categories', () => {
    it('POST /v1/categories - admin should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'General' })
        .expect(201);

      expect(res.body.name).toBe('General');
      categoryId = res.body.id;
    });

    it('POST /v1/categories - viewer should be denied', async () => {
      await request(app.getHttpServer())
        .post('/v1/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Other' })
        .expect(403);
    });

    it('GET /v1/categories - should list paginated', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/categories?page=1&limit=10')
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('GET /v1/categories/:id - should get by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/categories/${categoryId}`)
        .expect(200);

      expect(res.body.name).toBe('General');
    });

    it('GET /v1/categories/:id - should 404 for missing', async () => {
      await request(app.getHttpServer())
        .get('/v1/categories/999')
        .expect(404);
    });

    it('PATCH /v1/categories/:id - admin should update', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/v1/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' })
        .expect(200);

      expect(res.body.name).toBe('Updated');
    });

    it('DELETE /v1/categories/:id - admin should delete empty category', async () => {
      const { body: cat } = await request(app.getHttpServer())
        .post('/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Temp' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/v1/categories/${cat.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Posts', () => {
    it('POST /v1/posts - admin should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'First Post', content: 'Hello', categoryId })
        .expect(201);

      expect(res.body.title).toBe('First Post');
      expect(res.body.author).toBeDefined();
      postId = res.body.id;
    });

    it('POST /v1/posts - viewer should be denied', async () => {
      await request(app.getHttpServer())
        .post('/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Bad', content: 'Nope' })
        .expect(403);
    });

    it('POST /v1/posts - should reject unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/v1/posts')
        .send({ title: 'X', content: 'Y' })
        .expect(401);
    });

    it('GET /v1/posts - should list paginated', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/posts?page=1&limit=10')
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].author).toBeDefined();
    });

    it('GET /v1/posts - should filter by categoryId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/posts?categoryId=${categoryId}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
    });

    it('GET /v1/posts/:id - should get by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/posts/${postId}`)
        .expect(200);

      expect(res.body.id).toBe(postId);
    });

    it('GET /v1/posts/:id - should 404 for missing', async () => {
      await request(app.getHttpServer())
        .get('/v1/posts/999')
        .expect(404);
    });

    it('PATCH /v1/posts/:id - admin should update', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect(200);

      expect(res.body.title).toBe('Updated');
    });

    it('DELETE /v1/categories/:id - should reject if has posts without target', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('DELETE /v1/categories/:id - should delete category by moving posts', async () => {
      const { body: other } = await request(app.getHttpServer())
        .post('/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Other' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/v1/categories/${categoryId}?targetCategoryId=${other.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/v1/posts?page=1&limit=10')
        .expect(200);

      expect(res.body.items[0].category.id).toBe(other.id);
    });

    it('DELETE /v1/posts/:id - admin should delete', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Security', () => {
    it('should reject unknown query fields', async () => {
      await request(app.getHttpServer())
        .get('/v1/posts?evil=1')
        .expect(400);
    });

    it('should reject non-numeric ID', async () => {
      await request(app.getHttpServer())
        .get('/v1/posts/abc')
        .expect(400);
    });
  });
});
