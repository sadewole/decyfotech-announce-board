import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty()
  @IsString()
  name!: string;
}

export class SigninDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class UpdateRoleDto {
  @ApiProperty({ enum: ['admin', 'viewer'] })
  @IsEnum(['admin', 'viewer'])
  @IsString()
  role!: 'admin' | 'viewer';
}
