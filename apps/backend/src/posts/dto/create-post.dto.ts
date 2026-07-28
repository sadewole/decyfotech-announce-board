import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post', description: 'Post title' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'This is the content of the post.', description: 'Post body' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: 1, description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated Title', description: 'New post title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content.', description: 'New post body' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 2, description: 'New category ID' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
