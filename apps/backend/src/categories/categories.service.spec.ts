import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from '../repositories/categories.repository';
import { PostsRepository } from '../repositories/posts.repository';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepo: jest.Mocked<CategoriesRepository>;
  let postsRepo: jest.Mocked<PostsRepository>;

  const mockCategory = { id: 1, name: 'General', createdAt: new Date() };

  beforeEach(async () => {
    categoriesRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    postsRepo = {
      countByCategory: jest.fn(),
      moveToCategory: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: categoriesRepo },
        { provide: PostsRepository, useValue: postsRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('should create category', async () => {
      categoriesRepo.create.mockResolvedValue(mockCategory);
      expect(await service.create({ name: 'General' })).toEqual(mockCategory);
      expect(categoriesRepo.create).toHaveBeenCalledWith('General');
    });
  });

  describe('findAll', () => {
    it('should return all', async () => {
      categoriesRepo.findAll.mockResolvedValue([mockCategory]);
      expect(await service.findAll()).toEqual([mockCategory]);
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated', async () => {
      const p = { items: [mockCategory], total: 1, page: 1, limit: 10, totalPages: 1 };
      categoriesRepo.findAllPaginated.mockResolvedValue(p);
      expect(await service.findAllPaginated(1, 10)).toEqual(p);
    });
  });

  describe('findOne', () => {
    it('should return if found', async () => {
      categoriesRepo.findById.mockResolvedValue(mockCategory);
      expect(await service.findOne(1)).toEqual(mockCategory);
    });

    it('should throw if missing', async () => {
      categoriesRepo.findById.mockResolvedValue(undefined as any);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update if found', async () => {
      categoriesRepo.findById.mockResolvedValue(mockCategory);
      categoriesRepo.update.mockResolvedValue({ ...mockCategory, name: 'Tech' });
      expect(await service.update(1, { name: 'Tech' })).toEqual({ ...mockCategory, name: 'Tech' });
    });

    it('should throw if missing', async () => {
      categoriesRepo.findById.mockResolvedValue(undefined as any);
      await expect(service.update(999, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete category without posts', async () => {
      categoriesRepo.findById.mockResolvedValue(mockCategory);
      postsRepo.countByCategory.mockResolvedValue(0);
      expect(await service.remove(1)).toEqual({ message: 'Category deleted successfully' });
      expect(categoriesRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if has posts and no target', async () => {
      categoriesRepo.findById.mockResolvedValue(mockCategory);
      postsRepo.countByCategory.mockResolvedValue(5);
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should move posts and delete with target', async () => {
      categoriesRepo.findById.mockResolvedValueOnce(mockCategory);
      categoriesRepo.findById.mockResolvedValueOnce({ id: 2, name: 'Other', createdAt: new Date() });
      postsRepo.countByCategory.mockResolvedValue(5);
      await service.remove(1, 2);
      expect(postsRepo.moveToCategory).toHaveBeenCalledWith(1, 2);
      expect(categoriesRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if target missing', async () => {
      categoriesRepo.findById.mockResolvedValueOnce(mockCategory);
      categoriesRepo.findById.mockResolvedValueOnce(undefined as any);
      postsRepo.countByCategory.mockResolvedValue(5);
      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw if target same category', async () => {
      categoriesRepo.findById.mockResolvedValueOnce(mockCategory);
      categoriesRepo.findById.mockResolvedValueOnce(mockCategory);
      postsRepo.countByCategory.mockResolvedValue(5);
      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
