import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Roles } from '../core/decorators/role.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AuthGuard } from './guards/auth.guard';
import { SigninDto, SignupDto, UpdateRoleDto } from './dto/auth.dto';
import { PaginationDto } from '../core/common/dto/pagination.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiConflictResponse({ description: 'Email already in use' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ description: 'Authentication successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (paginated, admin only)' })
  @ApiOkResponse({ description: 'Paginated user list' })
  @UseGuards(AuthGuard)
  getUsers(@Query() pagination: PaginationDto) {
    return this.authService.getUsers(pagination.page ?? 1, pagination.limit ?? 10);
  }

  @Patch('users/:id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user role (admin only)' })
  @ApiOkResponse({ description: 'Role updated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  updateUserRole(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.authService.updateUserRole(id, updateRoleDto);
  }
}
