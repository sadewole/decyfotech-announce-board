import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsRepository } from '../repositories/posts.repository';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { PostFilterDto } from '../core/common/dto/post-filter.dto';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepo: PostsRepository) {}

  async create(dto: CreatePostDto, userId: number) {
    const post = await this.postsRepo.create({ ...dto, authorId: userId });
    return this.postsRepo.findById(post.id);
  }

  async findAll(filterDto: PostFilterDto) {
    const { page = 1, limit = 10, categoryId, startDate, endDate } = filterDto;
    return this.postsRepo.findAllPaginated(page, limit, { categoryId, startDate, endDate });
  }

  async findOne(id: number) {
    const post = await this.postsRepo.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: number, dto: UpdatePostDto, userId: number) {
    const post = await this.postsRepo.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId)
      throw new ForbiddenException('You can only update your own posts');
    await this.postsRepo.update(id, dto);
    return this.postsRepo.findById(id);
  }

  async remove(id: number, userId: number) {
    const post = await this.postsRepo.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId)
      throw new ForbiddenException('You can only delete your own posts');
    await this.postsRepo.delete(id);
    return { message: 'Post deleted successfully' };
  }
}
