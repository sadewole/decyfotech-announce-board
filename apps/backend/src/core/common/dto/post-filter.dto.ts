import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class PostFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}

export class MovePostsDto {
  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  targetCategoryId!: number;
}
