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
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../core/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationDto } from '../core/common/dto/pagination.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category (admin only)' })
  @ApiCreatedResponse({ description: 'Category created' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List categories (supports pagination via query params)' })
  @ApiOkResponse({ description: 'Category list' })
  findAll(@Query() pagination: PaginationDto) {
    if (pagination.page || pagination.limit) {
      return this.categoriesService.findAllPaginated(pagination.page ?? 1, pagination.limit ?? 10);
    }
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiOkResponse({ description: 'Category found' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (admin only)' })
  @ApiOkResponse({ description: 'Category updated' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a category (admin only)',
    description:
      'If the category has posts, provide targetCategoryId to move them before deletion.',
  })
  @ApiOkResponse({ description: 'Category deleted' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiBadRequestResponse({
    description: 'Category has posts without targetCategoryId, or target is the same category',
  })
  @ApiQuery({ name: 'targetCategoryId', required: false, type: Number })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('targetCategoryId') targetCategoryId?: string,
  ) {
    return this.categoriesService.remove(id, targetCategoryId ? +targetCategoryId : undefined);
  }
}
