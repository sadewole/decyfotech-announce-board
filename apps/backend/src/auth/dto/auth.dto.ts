import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6, description: 'Account password' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe', description: 'Display name' })
  @IsString()
  name!: string;
}

export class SigninDto {
  @ApiProperty({ example: 'user@example.com', description: 'Registered email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Account password' })
  @IsString()
  password!: string;
}

export class UpdateRoleDto {
  @ApiProperty({ enum: ['admin', 'viewer'], example: 'admin', description: 'New role' })
  @IsEnum(['admin', 'viewer'])
  @IsString()
  role!: 'admin' | 'viewer';
}
