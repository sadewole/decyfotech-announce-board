import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../core/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { PostFilterDto } from '../core/common/dto/post-filter.dto';
import { JwtPayload } from '../auth/guards/auth.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post (admin only)' })
  @ApiCreatedResponse({ description: 'Post created' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: JwtPayload) {
    return this.postsService.create(createPostDto, user.sub);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all posts (paginated, with optional category filter)' })
  @ApiOkResponse({ description: 'Paginated post list' })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(@Query() filterDto: PostFilterDto) {
    return this.postsService.findAll(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiOkResponse({ description: 'Post found' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post (admin only)' })
  @ApiOkResponse({ description: 'Post updated' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({ description: 'Can only update your own posts' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.update(id, updatePostDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post (admin only)' })
  @ApiOkResponse({ description: 'Post deleted' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({ description: 'Can only delete your own posts' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.postsService.remove(id, user.sub);
  }
}
