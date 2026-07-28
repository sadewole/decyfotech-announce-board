import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { PostsRepository } from '../repositories/posts.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepo: CategoriesRepository,
    private readonly postsRepo: PostsRepository,
  ) {}

  async create(dto: CreateCategoryDto) {
    return this.categoriesRepo.create(dto.name);
  }

  async findAll() {
    return this.categoriesRepo.findAll();
  }

  async findAllPaginated(page: number, limit: number) {
    return this.categoriesRepo.findAllPaginated(page, limit);
  }

  async findOne(id: number) {
    const category = await this.categoriesRepo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return this.categoriesRepo.update(id, dto.name!);
  }

  async remove(id: number, targetCategoryId?: number) {
    const category = await this.categoriesRepo.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    const postCount = await this.postsRepo.countByCategory(id);
    if (postCount > 0) {
      if (!targetCategoryId) {
        throw new BadRequestException(
          'Category has posts. Provide a targetCategoryId to move them.',
        );
      }
      const target = await this.categoriesRepo.findById(targetCategoryId);
      if (!target) throw new NotFoundException('Target category not found');
      if (target.id === id) throw new BadRequestException('Target category must be different');

      await this.postsRepo.moveToCategory(id, targetCategoryId);
    }

    await this.categoriesRepo.delete(id);
    return { message: 'Category deleted successfully' };
  }
}
