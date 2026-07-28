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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: JwtPayload) {
    return this.postsService.create(createPostDto, user.sub);
  }

  @Get()
  findAll(@Query() filterDto: PostFilterDto) {
    return this.postsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.update(+id, updatePostDto, user.sub);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.remove(+id, user.sub);
  }
}
