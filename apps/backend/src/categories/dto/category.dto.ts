import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Technology', description: 'Category name' })
  @IsString()
  @MinLength(1)
  name!: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Tech', description: 'New category name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
