import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../repositories/users.repository';
import { SigninDto, SignupDto, UpdateRoleDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const allUsers = await this.usersRepo.findAllPaginated(1, 1);
    const role = allUsers.total === 0 ? 'admin' : 'viewer';
    const user = await this.usersRepo.create({ email: dto.email, password: hashedPassword, name: dto.name, role });
    const token = await this.jwtService.signAsync({
      sub: user.id, email: user.email, role: user.role,
    });

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async signin(dto: SigninDto) {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwtService.signAsync({
      sub: user.id, email: user.email, role: user.role,
    });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async updateUserRole(userId: number, updateRoleDto: UpdateRoleDto) {
    const user = await this.usersRepo.updateRole(userId, updateRoleDto.role);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async getUsers(page: number, limit: number) {
    return this.usersRepo.findAllPaginated(page, limit);
  }
}
