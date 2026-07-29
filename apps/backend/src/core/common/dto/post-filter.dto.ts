import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class PostFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Filter posts created on or after this date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter posts created on or before this date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class MovePostsDto {
  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  targetCategoryId!: number;
}
