import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsRepository } from '../repositories/posts.repository';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepo: jest.Mocked<PostsRepository>;

  const mockPost = {
    id: 1,
    title: 'Title',
    content: 'Content',
    categoryId: null,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { id: 1, name: 'A', email: 'a@b.com' },
    category: null,
  };

  beforeEach(async () => {
    postsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllPaginated: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByCategory: jest.fn(),
      moveToCategory: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PostsRepository, useValue: postsRepo }],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should create and return with relations', async () => {
      postsRepo.create.mockResolvedValue({ id: 1 } as any);
      postsRepo.findById.mockResolvedValue(mockPost);
      expect(await service.create({ title: 'T', content: 'C', categoryId: 1 }, 1)).toEqual(mockPost);
      expect(postsRepo.create).toHaveBeenCalledWith({ title: 'T', content: 'C', categoryId: 1, authorId: 1 });
    });
  });

  describe('findAll', () => {
    it('should return paginated', async () => {
      const paginated = { items: [mockPost], total: 1, page: 1, limit: 10, totalPages: 1 };
      postsRepo.findAllPaginated.mockResolvedValue(paginated);
      expect(await service.findAll({ page: 1, limit: 10 })).toEqual(paginated);
    });

    it('should pass categoryId filter', async () => {
      postsRepo.findAllPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
      await service.findAll({ page: 1, limit: 10, categoryId: 5 });
      expect(postsRepo.findAllPaginated).toHaveBeenCalledWith(1, 10, { categoryId: 5 });
    });
  });

  describe('findOne', () => {
    it('should return post if found', async () => {
      postsRepo.findById.mockResolvedValue(mockPost);
      expect(await service.findOne(1)).toEqual(mockPost);
    });

    it('should throw if not found', async () => {
      postsRepo.findById.mockResolvedValue(undefined);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update if owner', async () => {
      postsRepo.findById.mockResolvedValue(mockPost);
      postsRepo.findById.mockResolvedValue(mockPost);
      expect(await service.update(1, { title: 'U' }, 1)).toEqual(mockPost);
    });

    it('should throw if not owner', async () => {
      postsRepo.findById.mockResolvedValue(mockPost);
      await expect(service.update(1, { title: 'U' }, 2)).rejects.toThrow(ForbiddenException);
    });

    it('should throw if missing', async () => {
      postsRepo.findById.mockResolvedValue(undefined);
      await expect(service.update(999, { title: 'U' }, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete if owner', async () => {
      postsRepo.findById.mockResolvedValue(mockPost);
      expect(await service.remove(1, 1)).toEqual({ message: 'Post deleted successfully' });
      expect(postsRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if not owner', async () => {
      postsRepo.findById.mockResolvedValue(mockPost);
      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('should throw if missing', async () => {
      postsRepo.findById.mockResolvedValue(undefined);
      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
